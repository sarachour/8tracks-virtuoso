
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
        if(request.action == "update"){
            userInterface.updateView();
        }
  }
)

function doSearch(){
    var grid = $("#search-page-results");
    var desc = $("#search-page-description");
    var type = $('#search-type').val();
    var term = $('#search-text').val();
    var sort = $('#search-sort').val();
    var page = $("#search-page");
    grid.empty();
    eightTracks.search(type, term, sort, function(data){
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
          var badge_image = "images/no-rank.png";
          if(cert == "gold"){
            badge_image = "images/gold.png";
          }
          else if(cert == "silver"){
            badge_image = "images/silver.png";
          }
          if(cert == "bronze"){
            badge_image = "images/bronze.png";
          }
          var html_text = $('<div/>').addClass("search-result-text").addClass("text tiny black").html(name);
          var html_img = $('<img/>').attr("src", cover);
          var html_badge = $('<div/>').addClass("icon-sm").append($('<img/>').attr("src", badge_image));
          var html_likes = $('<div/>').addClass("icon-tiny").append($('<img/>').attr("src", "images/heart-on.png"));
          var html_plays = $('<div/>').addClass("icon-tiny").append($('<img/>').attr("src", "images/play-black.png"));
          var html_tracks = $('<div/>').addClass("icon-tiny").append($('<img/>').attr("src", "images/music.png"));
          html_text.append("<br>",
            html_badge,"<br>", 
            mixes[i].likes_count,html_likes,"&nbsp;", 
            mixes[i].plays_count,html_plays,"&nbsp;", 
            mixes[i].tracks_count, html_tracks, "<br>",
            mixes[i].tag_list_cache);
          var html_div = $('<div/>').addClass("search-result").append(html_img).append(html_text);
          html_div.click(function(myid){
            return function(){
              chrome.extension.sendMessage({action: "play", id:myid, smart_id:smartid})
              $("#search-overlay").fadeOut(200);
            } 
          }(id));
          grid.append(html_div)
        }
      }
    });
  }

function ShowLogin(){
  $('#login-page').fadeIn(200);
  
}
function ShowSearch(){
  $('#search-page').fadeIn(200);
  
}
function SetupLogin(){
  $("#login-page").click(function(e){
    if(e.target !== this)
      return;
    $("#login-page").fadeOut(200);
  })
  $("#player_log_in").click(function(){
    var uname = $('#login_username').val();
    var pass = $('#login_password').val();
    var that = this;
    if(uname == "" || pass == ""){
      $("#login-status").html("Login failed: username or password is blank.");
      return;
    }
    eightTracks.login(uname, pass, function(data, err){
      //reload persistant data
      console.log("INFO:",data,err);
      if(data != null){
        chrome.extension.sendMessage({action: "reload"})
        $("#login-indicator").attr("src", "images/dot-ok.png");
        $("#login-overlay").fadeOut(200);
        if(userInterface.data == null)
          userInterface.sync();
      }
      else{
        console.log("Error", err);
        $("#login-status").html(err);
      }
    });
  });
  $('#login-back').click(function(){
      $("#login-page").fadeOut(200);
  })
  
}
function SetupLayout(){
  $('#player-controls').layout();
  $('#player-title').layout();
  $('#search-page-results').layout();
  $('.login-overlay, .search-overlay').layout({resize: false})
  $('.search-overlay').hide();
  $('#player_volume_controls').hide();
  if(localStorage.hasOwnProperty("user_token")){
    $('#login-page').hide();
    $("#login-indicator").attr("src", "images/dot-ok.png");
  }
  else{
    eightTracks.login(null, null, function(data, err){
      //reload persistant data
      console.log("INFO:",data,err);
      if(data != null){
        chrome.extension.sendMessage({action: "reload"})
        $("#login-indicator").attr("src", "images/dot-ok.png");
        if(userInterface.data == null)
          userInterface.sync();
      }
    });

  }
  var outerContainer = $('.player-page').layout({resize: false});
}


function SetupSearch(){
  function setupAutocomplete(){
    var typingTimer;                //timer identifier
    var doneTypingInterval = 100;  //time in ms, 5 second for example

    //on keyup, start the countdown
    $('#search-text').keyup(function(){
        clearTimeout(typingTimer);
        console.log("up");
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    });

    //on keydown, clear the countdown 
    $('#search-text').keydown(function(){
        console.log("down");
        clearTimeout(typingTimer);
    });

    //user is "finished typing," do something
    function doneTyping () {
        var term = $('#search-text').val();
        //do something
        eightTracks.getTags(term, function(data){
          availableTags = [];
          for(var i=0; i< data.tag_cloud.tags.length; i++){
            var tag = data.tag_cloud.tags[i];
            availableTags.push(tag.name);
          }
          console.log(availableTags);
          $( "#search-text" ).autocomplete({
            source: availableTags,
            select: function( event, ui ) {
              $( "#search-text" ).val(ui.item.label);
              doSearch();
              return false;
            }
          });
        })
        console.log("sufficient pause");
    }
  }
  $('#search-back').click(function(){
      $("#search-page").fadeOut(200);
  })
  $("#search-page").click(function(e){
    if(e.target !== this)
      return;

    $("#search-page").fadeOut(200);
  })
  $("#search-type").on('change', function(){
    var name = $('#search-type').val();
    console.log("type:"+name);
    if(name == 'tags' || name == 'artist' || name == 'mix'){
      //make textbox visible
      $("#search-text-container").fadeIn(200);
    }
    else{
      $("#search-text-container").fadeOut(200);
    }
    doSearch();
  });
  $("#search-text").on('change', function(){
    var term = $('#search-text').val();
    doSearch();
  })
  $("#search-text-container").hide();
  $("#search-sort").on('change', function(){
    var type = $('#search-sort').val();
    doSearch();
  })
  doSearch();
  setupAutocomplete();

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
      ShowSearch();
    });
    $("#player_sync").click(function(){
      userInterface.sync();
    })
    $("#player_login").click(function(){
      ShowLogin();
    })
    $("#player_next_mix").click(function(){
      chrome.extension.sendMessage({action: "next-mix"})
    })
    
    $("#player_volume").click(function () {
        var pos = $("#player_volume").offset();
        var w= $("#player_volume_controls").width();
        var h= $("#player_volume_controls").height();
        $("#player_volume_controls").css('top',pos.top-h-10);
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
  SetupLogin();
  SetupSearch();
  userInterface.updateView();
})