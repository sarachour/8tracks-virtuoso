
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
        if(request.action == "update"){
            userInterface.updateView();
        }
  }
)

 
function SetupLayout(){
  $('#player-controls').layout();
  $('#player-title').layout();
  $('#search-overlay-results').layout();
  $('#search-overlay').hide();
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

    $( "#player_prog" ).on('change', function() { 
      pct = $("#player_prog").val()/100.0; 
      chrome.extension.sendMessage({action: "set-time", percent:pct})
    });

    $( "#player_search" ).click(function() { 
      $("#search-overlay").show();
    });
    $("#player_sync").click(function(){
      userInterface.sync();
    })
    /*
    $("#player_volume").click(function () {
        var pos = $("#player_volume").position();
        var w= $("#player_volume_controls").width();
        var h= $("#player_volume_controls").height();
        console.log(pos);
        $("#player_volume_controls").css('top',pos.top-h);
        $("#player_volume_controls").css('left',pos.left+w);
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
    */
}
document.addEventListener('DOMContentLoaded', function() {
  SetupLayout();
  SetupPlayer();  
  SetupSearch();
  userInterface.updateView();
})