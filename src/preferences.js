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


function succ(e){
    e.addClass("success").removeClass("failure pending")
}
function fail(e){
    e.removeClass("success pending").addClass("failure")
}
function pend(e){
    e.removeClass("success failure").addClass("pending")
}

var AUTHS = {}
AUTHS.tracks8 = new Tracks8Auth(GLOBALS["8tracks-api-key"]);
AUTHS.spotify = new SpotifyAuth(GLOBALS["spotify-api-key"],GLOBALS["spotify-api-secret"],GLOBALS["spotify-scope"])


function upd_login_8tracks(msg){
    var ns = $("#login-8tracks")
    var uinfo = AUTHS.tracks8.getUserInfo();
    if(AUTHS.tracks8.isLoggedIn()){
        var ic = uinfo.icon;
        $("#indic",ns).attr("src", ic);
        succ($("#status",ns))
        $("#text",$("#status",ns)).html("logged in as "+uinfo.user)
        $("#logout-panel",ns).removeClass("dummy")
        $("#login-panel",ns).addClass("dummy")
    }
    else{
        $('#indic').attr('src', 'images/error.png');
        if(msg == undefined || msg == null){
            msg = "not logged in to 8tracks.";
        }
        fail($("#status",ns))
        $("#text",$("#status",ns)).html(msg);
        $("#login-panel",ns).removeClass("dummy")
        $("#logout-panel",ns).addClass("dummy")
    }
  
 

}
function autologin_8tracks(){
    var ns = $("#login-8tracks")
    msg = "attempting to auto-login from open 8Tracks session."; 

    $("#indic",ns).attr("src", "images/error.png");
    pend($("#status",ns))

    $("#text",$("#status",ns)).html(msg);
        AUTHS.tracks8.login(null,null,function(){
        upd_login_8tracks();
    })
}

function upd_login_spotify(msg){
    var ns = $("#login-spotify");
    if(AUTHS.spotify.isLoggedIn()){
        var uinfo = AUTHS.spotify.getUserInfo();
        succ($("#status",ns))
        if(uinfo.icon == undefined){
            uinfo.icon = "images/login.png"
        }
        $("#indic", ns).attr("src", uinfo.icon);
        $("#text",$("#status",ns)).html("logged in as "+uinfo.user+"");
        $("#logout-panel",ns).removeClass("dummy")
        $("#login-panel",ns).addClass("dummy")
    }
    else{
        $('#indic',ns).attr('src', 'images/error.png');
        if(msg == undefined || msg == null){
            msg = "not logged in to spotify.";
        }
        fail($("#status",ns))
        $("#text",$("#status",ns)).html(msg);
        $("#login-panel",ns).removeClass("dummy")
        $("#logout-panel",ns).addClass("dummy")
    }

}

function SetupLogin(){
  var ns = $("#login-8tracks")
  //setup login
  $("#login",ns).click(function(ns){ return function(){
    var uname = $('#username',ns).val();
    var pass = $('#password',ns).val();
    var that = this;
    if(uname == "" || pass == "" || uname == undefined || pass == undefined){
      upd_login_8tracks("login failed. username or password field blank.")
      return;
    }
    var msg = "Logging into 8Tracks as: "+uname
    upd_login_8tracks("logging into 8tracks as <"+uname+">");
    AUTHS.tracks8.login(uname,pass,function(d,e){
        upd_login_8tracks(e)
    })
  }}(ns));
  $("#autologin",ns).click(function(ns){return function(){
    upd_login_8tracks("automatically logging into 8tracks using browser cookies.");
    AUTHS.tracks8.login(null,null,function(d,e){
        upd_login_8tracks(e)
    })
  }}(ns))
  $("#password",ns).keyup(function(ns){return function(e){
    if(e.keyCode == 13){
        $("#login", ns).click();  
    }
  }}(ns));
  $("#logout",ns).click(function(ns){return function(){
    console.log("logging out")
    AUTHS.tracks8.logout();
    upd_login_8tracks("logged out of 8tracks.");
  }}(ns))
  upd_login_8tracks();

  //login to spotify
  var ns = $("#login-spotify")
  $('#login',ns).click(function(ns){return function(){
      upd_login_spotify("launched spotify login page... pending authentication.")
      AUTHS.spotify.unauthorize();
      AUTHS.spotify.authorize(function(d,e){
        upd_login_spotify(e);
      })  
  }}(ns))
  $("#logout",ns).click(function(ns){return function(){
    AUTHS.spotify.unauthorize();
    upd_login_spotify("logged out of spotify.");
  }}(ns))
  upd_login_spotify();

 
}

function SetupPrefUpdates(){
    var map = {
        to: {
            "#idlepause":"idle-pause", 
            "#toastnot":"toast-notify",
            "#idlepausedur":"time-to-wait",
            "#autoplay":"autoplay"
        },
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

    var n = "#autoplay";
    $("#isset",$(n)).change(function(n){return function(){
        var newv = $(this).is(':checked');
        chrome.extension.sendMessage({action: "set-pref", value:newv, key:map.to[n]},
            handle_resp("Updated Autoplay", "successfully "+enabled(newv)+" autoplay on browser start")
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
    SetupPrefUpdates();

});