
SearchController = function(){
  this.init = function(){
    this.loading = false;
  }
  this.autocomplete = function(){
    var that = this;
    var typingTimer;                //timer identifier
    var doneTypingInterval = 100;  //time in ms, 5 second for example

    var doneTyping = function() {
        var term = $('#search-text').val();
        //do something
        eightTracks.getTags(term, function(data){
          availableTags = [];
          for(var i=0; i< data.tag_cloud.tags.length; i++){
            var tag = data.tag_cloud.tags[i];
            availableTags.push(tag.name);
          }
          $( "#search-text" ).autocomplete({
            source: availableTags,
            select: function( event, ui ) {
              $( "#search-text" ).val(ui.item.label);
              that.update();
              return false;
            }
          });
        })
        console.log("sufficient pause");
    }
    //on keyup, start the countdown
    $('#search-text').keyup(function(){
        clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTyping, doneTypingInterval);
    });

    //on keydown, clear the countdown 
    $('#search-text').keydown(function(){
        clearTimeout(typingTimer);
    });

    //user is "finished typing," do something
    
  }
  this.update = function(){
    this.grid = $("#search-page-results");
    this.desc = $("#search-page-description");
    this.type = $('#search-type').val();
    this.term = $('#search-text').val();
    this.sort = $('#search-sort').val();
    this.page = $("#search-page");
    this.grid.empty();
    this.page.layout({resize:false});
    this.n = 1;
    this.search();
  }

  this.search = function(){
    var that = this;
    if(that.loading) return;

    that.loading = true;
    eightTracks.search(this.type, this.term, this.sort, this.n, function(data){
      if(data == null){
        that.loading = false;
        return;
      }
      var description = data.mix_set.name;
      var smartid = data.mix_set.smart_id;
      that.desc.html(description);
      console.log(data);
      that.n = data.mix_set.pagination.next_page;

      if(data.hasOwnProperty('mix_set')){
        var mixes = data.mix_set.mixes;
        for(var i=0; i < mixes.length; i++){
          var nh = $("#search-element-template").clone();
          var badge_class = "image-badge-"+mixes[i].certification;
          $("#name",nh).html(mixes[i].name);
          $("#badge-icon", nh).addClass(badge_class);
          $("#cover", nh).attr('src',mixes[i].cover_urls.sq100);
          $("#ntracks-text",nh).html(mixes[i].tracks_count);
          $("#nlikes-text",nh).html(mixes[i].plays_count);
          $("#nplays-text",nh).html(mixes[i].tracks_count);
          $("#tags",nh).html(mixes[i].tag_list_cache);
          nh.click((function(myid){
            return function(){
              chrome.extension.sendMessage({action: "play", id:myid, smart_id:smartid})
              $("#search-page").fadeOut(200);
            } 
          })(mixes[i].id));
          that.grid.append(nh.removeClass("dummy"));
        }
      }
      that.loading = false;
    });
  }

  this.setup = function(){
    var that = this;
    this.update();
    this.grid.scroll(function() {
       if(that.grid.scrollTop() + that.grid.height() >= that.grid[0].scrollHeight) {
           that.search();
       }
    });
    $("#search-type").on('change', function(){
      var name = $('#search-type').val();
      if(name == 'tags'){
        $("#search-page-description").html("Tag Search");
        $("#search-text-container").fadeIn(200);
      }
      else{
        $("#search-text-container").fadeOut(200);
      }
      that.update();
    })
    
    $("#search-sort").on('change', function(){
      that.update();
    })
    
    $("#search-text-container").hide();

    $('#search-back').click(function(){ $("#search-page").fadeOut(200); })
    $("#search-page").click(function(e){
      if(e.target !== this) return;
      $("#search-page").fadeOut(200);
    })
    this.autocomplete();
    //$("#search-text").click(function(){that.update();})
    this.n = 1;
  }
  this.init();
}
searchController = new SearchController();
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
        if(request.action == "update"){
            userInterface.updateView();
        }
        if(request.action == "login-client"){
          var data = request.data;
          var status = request.status;
          if(request.type == "8tracks"){
            console.log("logging in");
            if(data != null){
              $("#login-indicator").attr("src", "images/dot-ok.png");
              $("#login-page").fadeOut(200);
              if(userInterface.data == null)
                userInterface.sync();
            }
            else{
              console.log("Error", status);
              $("#login-status").html(status.responseJSON.errors);
            }
          }
        }
        else{
          console.log("UNKNOWN REQUEST:", request);
        }
  }
)

function doSetup(){
  searchController.setup();
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
    chrome.extension.sendMessage({
        action: "login", 
        type: "8tracks", 
        username: uname, 
        password:pass
      })
  });
  $('#login-back').click(function(){
      $("#login-page").fadeOut(200);
  })
  $('#login-lastfm-perm').click(function(){
      chrome.extension.sendMessage({
        action: "login", 
        type: "lastfm",
        stage: "auth"
      }, 
      function(d, e){
        alert("logged in")
        console.log(d,e);
      }
    );
  })
  if(lastFm.isLoggedIn()){
    $('#login-lastfm-perm').addClass('green-button');
    $("#login-lastfm-indicator").attr("src", "images/dot-ok.png");
  }
  else{
    $('#login-lastfm-perm').addClass('red-button');
  }
  
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
    chrome.extension.sendMessage({action: "login", type: "8tracks", username: null, password:null})

  }
  var outerContainer = $('.player-page').layout({resize: false});
}


function SetupSearch(){
  /*
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
    doSetup();
    doSearch();
  });
  $("#search-text").on('change', function(){
    var term = $('#search-text').val();
    doSetup();
    doSearch();
  })
  $("#search-text-container").hide();
  $("#search-sort").on('change', function(){
    var type = $('#search-sort').val();
    doSetup();
    doSearch();
  })
  doSetup();
  doSearch();
  setupAutocomplete();
  */
  searchController.setup();

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
    $("#player").click(function(){
      $("#player_volume_controls").fadeOut();
      return true;
    })
    $("#player_cast").click(function() {
      chrome.tabs.create({ url: "sender.html" });
    })
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
        $("#player_volume_controls").fadeIn();
        return false;
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