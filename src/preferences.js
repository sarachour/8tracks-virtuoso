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

function upd_login_8tracks(isloggedin,attemptlogin,errmsg){
  var ns = $("#login-8tracks")
  if(isloggedin){
    $("#indic",ns).attr("src", "images/dot-ok.png");
    succ($("#status",ns).html("logged onto 8Tracks"))
  }
  else{
    if(attemptlogin){
        $("#indic",ns).attr("src", "images/dot-err.png");
        chrome.extension.sendMessage({action: "login", type: "8tracks", username: null, password:null});
        pend($("#status",ns).html("attempting to auto-login from open 8Tracks session."))
    }
    $('#indic').attr('src', 'images/dot-err.png');
    if(errmsg == undefined || errmsg == null){
        errmsg = "not logged in to 8tracks.";
    }
    fail($("#status",ns).html(errmsg))
  }

}

function upd_login_lastfm(isloggedin){
  var ns = $("#login-lastfm")
  if(isloggedin){
    $("#indic", ns).attr("src", "images/dot-ok.png");
    succ($("#status",ns).html("logged onto LastFM"))
  }
  else{
    fail($("#status",ns).html("not logged into LastFM."))
    $('#indic', ns).attr('src', 'images/dot-err.png');
  }
}

function SetupLogin(){
  var ns = $("#login-8tracks")

  $("#login",ns).click(function(){
    var uname = $('#username',ns).val();
    var pass = $('#password',ns).val();
    var that = this;
    if(uname == "" || pass == "" || uname == undefined || pass == undefined){
      var msg = "login failed. username or password is blank.";
      var title = "Login Failed"
      disp_status(title,msg,"failure");
      fail($("#status",ns).html(msg));
      return;
    }
    disp_status("Logging into 8Tracks", "Logging into 8Tracks as: "+uname,"pending")
    chrome.extension.sendMessage({
        action: "login", 
        type: "8tracks", 
        username: uname, 
        password:pass
      })
  });
  upd_login_8tracks(isLoggedOn8Tracks(), true);
  

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
    /*
  var pon = $("#enable_pause_on_idle");
  pon.change(function(){
    var newv = pon.is(':checked');
    console.log("change to:",newv);
    chrome.extension.sendMessage({action: "set-idle", value: newv})
  })
  chrome.extension.sendMessage({action: "get-idle"}, function(v){
    pon.prop('checked', v);
  })
*/
}

function SetupExport(){

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
                }
                else {
                    disp_status("8Tracks Login", "Failed to Login to 8Tracks", status.responseJSON.errors)
                }
                upd_login_8tracks(data != null, false, status.responseJSON.errors)
            }
            else if(request.type == "lastfm"){

            }
            console.log("request");
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
    SetupExport();

});