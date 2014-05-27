
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
        if(request.action == "update"){
            userInterface.updateView();
        }
  }
)

 
function showLogin(){
  $('#login-overlay').fadeIn(200);
  $("#login-overlay").click(function(e){
    if(e.target !== this)
      return;

    $("#login-overlay").fadeOut(200);
  })
  $("#player_log_in").click(function(){
    var uname = $('#login_username').val();
    var pass = $('#login_password').val();
    var that = this;
    if(uname == "" || pass == ""){
      console.log("Login failed: username, pass values do not exist.");
      return;
    }
    eightTracks.login(uname, pass, function(){
      //reload persistant data
      chrome.extension.sendMessage({action: "reload"})
      $("#login-indicator").attr("src", "images/dot-ok.png");
      $("#login-overlay").fadeOut(500);
      userInterface.updateView();
    });
  });
  $('#login-back').click(function(){
      $("#login-overlay").fadeOut(200);
  })
  
}
function SetupLayout(){
  $('#player-controls').layout();
  $('#player-title').layout();
  $('#search-overlay-results').layout();
  if(localStorage.hasOwnProperty("user_token")){
    $('#search-overlay, #login-overlay').hide();
    $("#login-indicator").attr("src", "images/dot-ok.png");
  }

  var outerContainer = $('#player').layout({resize: false});

}
function SetupSearch(){
  function loadMix(){

  }
  function doSearch(){
    var grid = $("#search-overlay-results");
    var desc = $("#search-overlay-description");
    var type = $('#search-type').val();
    var term = $('#search-text').val();
    var sort = $('#search-sort').val();
    grid.empty();
    eightTracks.search(type, term, sort, function(data){
      console.log(data);
      var description = data.mix_set.name;
      var smartid = data.mix_set.smart_id;
      desc.html(description);
      if(data.hasOwnProperty('mix_set')){
        var mixes = data.mix_set.mixes;
        for(var i=0; i < mixes.length; i++){
          var id = mixes[i].id;
          var cover = mixes[i].cover_urls.sq100;
          var name = mixes[i].name;
          var cert = mixes[i].certification;
          var html_text = $('<div/>').addClass("search-result-text").addClass("text-sm").html(name);
          var html_img = $('<img/>').attr("src", cover);
          var html_div = $('<div/>').addClass("search-result").append(html_img).append(html_text);
          html_div.click(function(myid){
            return function(){
              console.log("loading mix: ",smartid ,myid); 
              chrome.extension.sendMessage({action: "play", id:myid, smart_id:smartid})
              $("#search-overlay").fadeOut(200);
            } 
          }(id));
          console.log(html_div);
          grid.append(html_div)
        }
      }
    });
  }
  $("#search-type").on('change', function(){
    var name = $('#search-type').val();
    console.log("type:"+name);
    if(name == 'tag' && name == 'artist' && name == 'mix'){
      //make textbox visible
    }
    doSearch();
  });
  $("#search-text").on('change', function(){
    var term = $('#search-text').val();
    console.log("search:"+term);
    doSearch();
  })
  $("#search-sort").on('change', function(){
    var type = $('#search-sort').val();
    console.log("sort:"+type);
    doSearch();
  })

}
function SetupPlayer(){
   //play bind
   $("#player_play").click(function(){
      if($("#player_play").hasClass("playing")){
        $("#player_play").removeClass("playing");
        chrome.extension.sendMessage({action: "pause"});
        $("#player_play").attr("src", "images/play.png");
      }
      else{
        $("#player_play").addClass("playing");
        $("#player_play").attr("src", "images/pause.png");
        chrome.extension.sendMessage({action: "resume"});
      }
    });
   //like bind
    $("#player_like_mix").click(function(){
      if($("#player_like_mix").hasClass("like")){
        chrome.extension.sendMessage({action: "unlike-mix"})
      }
      else{
        chrome.extension.sendMessage({action: "like-mix"})
      } 
    })
    //star bind
    $("#player_star_track").click(function(){
      if($("#player_star_track").hasClass("favorite")){
        chrome.extension.sendMessage({action: "unfavorite-track"})
      }
      else{
        chrome.extension.sendMessage({action: "favorite-track"})
      } 
    })

    $( "#player_prog" ).on('change', function(e) { 
      var value = e.target.value;
      chrome.extension.sendMessage({action: "set-time", percent:(value/100)})
    });

    $( "#player_search" ).click(function() { 
      $("#search-overlay").fadeIn(200);
      $('#search-back').click(function(){
          $("#search-overlay").fadeOut(200);
      })
      $("#search-overlay").click(function(e){
        if(e.target !== this)
          return;

        $("#search-overlay").fadeOut(200);
      })
    });
    $("#player_sync").click(function(){
      userInterface.sync();
    })
    $("#player_login").click(function(){
      showLogin();
    })
    $("#player_next_mix").click(function(){
      chrome.extension.sendMessage({action: "next-mix"})
    })
    
    $("#player_volume").click(function () {
        var pos = $("#player_volume").offset();
        var w= $("#player_volume_controls").width();
        var h= $("#player_volume_controls").height();
        $("#player_volume_controls").css('top',pos.top-h);
        $("#player_volume_controls").css('left',pos.left);
      $("#player_volume_controls").fadeToggle("slow");
    });
    $( "#player_volume_slider" ).slider({
      range: "min",
      orientation: "vertical",
      slide: function(event, ui) { 
        pct = ui.value/100.0; 
        if(ui.value > 50){
          $("#player_volume").attr("src", "images/highvolume.png");
        }
        else if(ui.value > 0){
          $("#player_volume").attr("src", "images/lowvolume.png");
        }
        else{
          $("#player_volume").attr("src", "images/mute.png");
        }
        chrome.extension.sendMessage({action: "set-volume", percent:pct})
      }
    });
}
document.addEventListener('DOMContentLoaded', function() {
  SetupLayout();
  SetupPlayer();  
  SetupSearch();
  userInterface.updateView();
})