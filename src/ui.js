
SearchController = function(){
  this.init = function(){
    this.loading = false;
    this.handlers = {"keydown":[], "keyup":[]};
  }
  this._do_searchbox = function(get_autocomplete_cbk){
    var that = this;
    var typingTimer;                //timer identifier
    var doneTypingInterval = 100;  //time in ms, 5 second for example
    var searchbox = $("#search-text");

    var set_autocomplete = function(availableTags){
      searchbox.autocomplete({
        source: availableTags,
        select: function( event, ui ) {
          searchbox.val(ui.item.label);
          that.update();
          return false;
        }
      });
    }
    var update_autocomplete = function() {
      var term = searchbox.val();
      get_autocomplete_cbk(term, set_autocomplete);
    }
    //unbind all events
    var types = ["keydown","keyup"]
    for(var j=0; j < types.length; j++){
      var typ = types[j];
      for(var i=0; i < this.handlers[typ].length; i++){
        searchbox.unbind(typ, this.handlers[typ][i])
      }
      this.handlers[typ] = [];
    }
    var u = searchbox.keyup(function(e){
        //if pressed enter, update
        if(e.keyCode == 13)
        {
          that.update();
        }
        clearTimeout(typingTimer);
        typingTimer = setTimeout(update_autocomplete, doneTypingInterval);
    });

    //on keydown, clear the countdown 
    var d = searchbox.keydown(function(e){
        clearTimeout(typingTimer);
    });
    this.handlers["keydown"].push(d);
    this.handlers["keyup"].push(u);
  }
  this.keyword_searchbox = function(){
    var key_cbk = function(term,cbk){
      cbk([]);
    }

    this._do_searchbox(key_cbk);
  }
  this.tag_searchbox = function(){
    var tag_cbk = function(term, cbk){
      eightTracks.getTags(term, function(data){
        availableTags = [];
        for(var i=0; i< data.tag_cloud.tags.length; i++){
          var tag = data.tag_cloud.tags[i];
          availableTags.push(tag.name);
        }
        cbk(availableTags);
      })
    }
    this._do_searchbox(tag_cbk);
    
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
      var resource = {
        'gold': 'images/gold.png',
        'silver': 'images/silver.png',
        'bronze': 'images/bronze.png',
        'gem': 'images/gem.png',
        'diamond':'images/diamond.png',
        null : 'images/no-rank.png'
      }
      var description = data.mix_set.name;
      var smartid = data.mix_set.smart_id;
      that.desc.html(description);
      that.n = data.mix_set.pagination.next_page;

      if(data.hasOwnProperty('mix_set')){
        var mixes = data.mix_set.mixes;
        for(var i=0; i < mixes.length; i++){
          var nh = $("#search-element-template").clone();
          $("#name",nh).html(mixes[i].name);
          $("#badge-icon", nh).attr('src',resource[mixes[i].certification]);
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
      console.log(name)
      if(name == 'tags'){
        $("#search-page-description").html("Tag Search");
        $("#search-text-container").fadeIn(200);
        that.tag_searchbox();
      }
      else if(name == 'keyword'){
        $("#search-page-description").html("Keyword Search");
        $("#search-text-container").fadeIn(200);
        that.keyword_searchbox();
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
  var pon = $("#enable_pause_on_idle");
  pon.change(function(){
    var newv = pon.is(':checked');
    console.log("change to:",newv);
    chrome.extension.sendMessage({action: "set-idle", value: newv})
  })
  chrome.extension.sendMessage({action: "get-idle"}, function(v){
    pon.prop('checked', v);
  })

  
}
function SetupLayout(){
  $('#player').layout({resize:false});
  $('#player-controls').layout({resize:false});
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

  $(".vert-middle").each(function(){
    var e = $(this);
    var par = e.parent();
    var top = -(par.height() - e.height())/2;
    console.log(top)
    e.css({top:top,position:"relative"})
  })


}


function SetupSearch(){
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