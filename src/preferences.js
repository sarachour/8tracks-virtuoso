function disp_status(title, msg, status) {
    var ns = $("#status-popup");
    
    ns
    .removeClass("success failure pending")
    .addClass(status)
    .fadeIn(300);
    
    $("#title", ns).html(title);
    $("#message",ns).html(msg);


    setTimeout(function(){
        ns.fadeOut(500)
    }, 2000)
}

function isLoggedOn8Tracks(){ 
   return localStorage.hasOwnProperty("user_token");
}
function isLoggedOnLastFm(){
   return lastFm.isLoggedIn();
}
function succ(e){
    e.addClass("success").removeClass("failure pending")
}
function fail(e){
    e.removeClass("success pending").addClass("failure")
}
function pend(e){
    e.removeClass("success failure").addClass("pending")
}

function upd_login_8tracks(attemptlogin,errmsg){
  var ns = $("#login-8tracks")
  console.log("getting a preference.");
  chrome.extension.sendMessage({action: "get-pref", key:"8tracks-user"}, function(uinfo){
        console.log("USER",uinfo);
        if(uinfo != null){
            var ic = uinfo.icon;
            $("#indic",ns).attr("src", ic);
            succ($("#status",ns))
            $("#text",$("#status",ns)).html("logged in as "+uinfo.name)
        }
        else{
            if(attemptlogin){
                msg = "attempting to auto-login from open 8Tracks session."; 
                $("#indic",ns).attr("src", "images/error.png");
                chrome.extension.sendMessage({action: "login", type: "8tracks", username: null, password:null});
                pend($("#status",ns))
                $("#text",$("#status",ns)).html(msg);
            }
            $('#indic').attr('src', 'images/error.png');
            if(errmsg == undefined || errmsg == null){
                errmsg = "not logged in to 8tracks.";
            }
            fail($("#status",ns))
            $("#text",$("#status",ns)).html(errmsg);
        }
  })

}

function upd_login_lastfm(isloggedin){
  var ns = $("#login-lastfm")
  if(isloggedin){
    $("#indic", ns).attr("src", "images/dot-ok.png");
    succ($("#status",ns))
    $("#text",$("#status",ns)).html("logged onto LastFM");
  }
  else{
    fail($("#status",ns))
    $('#indic', ns).attr('src', 'images/error.png');
    $("#text",$("#status",ns)).html("logged onto LastFM");
  }
}

function SetupLogin(){
  var ns = $("#login-8tracks")

  $("#login",ns).click(function(ns){ return function(){
    var uname = $('#username',ns).val();
    var pass = $('#password',ns).val();
    var that = this;
    if(uname == "" || pass == "" || uname == undefined || pass == undefined){
      var msg = "username or password is blank.";
      var title = "Login Failed"
      disp_status(title,msg,"failure");
      fail($("#status",ns));
      $('#indic', ns).attr('src', 'images/error.png');
      $("#text",$("#status",ns)).html(msg);

      return;
    }
    var msg = "Logging into 8Tracks as: "+uname
    disp_status("Logging into 8Tracks", msg,"pending")
    pend($("#status",ns).html(msg))
    chrome.extension.sendMessage({
        action: "login", 
        type: "8tracks", 
        username: uname, 
        password:pass
      })
  }}(ns));
  $("#password",ns).keyup(function(ns){return function(e){
    if(e.keyCode == 13){
        $("#login", ns).click();  
        console.log("logging.");  
    }
  }}(ns));
  upd_login_8tracks(false);

  var ns = $("#login-lastfm")
  $('#login',ns).click(function(){
      chrome.extension.sendMessage({
        action: "login", 
        type: "lastfm",
        stage: "auth"
      }, 
      function(d, e){
        var title = "Authentication Pending"
        var msg = "Launched LastFm instance. pending authentication from lastfm."
        console.log(d,e);
        disp_status(title,msg,"pending");
        pend($("#status",ns).html(msg));
      }
    );
  })
  upd_login_lastfm(isLoggedOnLastFm());
  
  

 
}

function SetupGeneral(){
    var map = {
        to: {"#idlepause":"idle-pause", "#toastnot":"toast-notify","#idlepausedur":"time-to-wait"},
        from: {}
    }
    for(k in map.to){
        map.from[map.to[k]] = k;
    }
    var handle_resp =  function(t,sm){
        return function(x){
            if(x.status == "success"){
                disp_status(t, sm, "success")
            }
            else{
                disp_status(t, x.message, "failure");
            }
        }
    }
    
    var enabled = function(x){
        if(x){return "enabled"}
        else {return "disabled"}
    }

    var n = "#idlepause";
    $("#isset",$(n)).change(function(n){return function(){
        var newv = $(this).is(':checked');
        chrome.extension.sendMessage({action: "set-pref", value:newv, key:map.to[n]},
            handle_resp("Updated Pause on Idle", "successfully "+enabled(newv)+" pause on idle")
        )
    }}(n))

    var n = "#idlepausedur";
    $("#isval",$(n)).change(function(n){return function(){
        var newv = parseInt($(this).val());
        chrome.extension.sendMessage({action: "set-pref", value:newv, key:map.to[n]},
            handle_resp("Updated Duration until Idle", "idle wait time set to "+(newv)+" seconds")
        )
    }}(n))

    var n = '#toastnot';
    $("#isset",$(n)).change(function(n){ return function(){
        var newv = $(this).is(':checked');
        chrome.extension.sendMessage({action: "set-pref", value:newv, key:map.to[n]}, 
            handle_resp("Updated Pause on Idle", "successfully "+enabled(newv)+" toast notifications")
        )
    }}(n))

    var upd_pref = function(n,k,v){
        /*update true or false*/
        if(v == true || v == false){
            $("#isset",$(n)).prop("checked",v)
        }
        else {
            $("#isval",$(n)).val(v);
        }
    }
    chrome.extension.sendMessage({action: "get-prefs"}, function(v){
        console.log("PREFS",v);
        for(key in v){
            if(key in map.from){
                n = map.from[key];
                var val = v[key];
                upd_pref(n,key,val);
            }
        }
    })


}



function SetupCallbacks(){

    chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.action == "login-client"){
            var data = request.data;
            var status = request.status;
            if(request.type == "8tracks"){
                if(data != null){
                    disp_status("8Tracks Login", "Successfully logged into 8Tracks", "success")
                    upd_login_8tracks(false)
                }
                else {
                    disp_status("8Tracks Login", status.responseJSON.errors, "failure")
                    upd_login_8tracks(false, status.responseJSON.errors)
                }
            }
            else if(request.type == "lastfm"){

            }
        }
        else{
            console.log("UNKNOWN REQUEST:", request);
        }
    }
    )
}
function SetupLayout(){
    var outerContainer = $('#prefs').layout({resize: false});

    function layout() {
        outerContainer.layout({resize: false});
    }
    $("#status-popup").hide().click(function(){
        $(this).fadeOut(400);
    });

    $('.toggle-button').click(function(){
        $(this).toggleClass("down");
    });
    $('.layout-outer > .east').resizable({
        handles: 'w',
        stop: layout
    });

    $('.layout-outer > .west').resizable({
        handles: 'e',
        stop: layout
    });
    $( window ).resize(function() {
      $('#prefs').layout({resize: false});
    });
}


document.addEventListener('DOMContentLoaded', function() {
    SetupLayout();
    SetupLogin();
    SetupGeneral();
    SetupCallbacks();

});