
function UserInterface(){
	this.init = function(){
		this.timer = null;
	}
	this.setClipboard = function(text){
		console.log(text);
		$("#clipboard").text(text);
		$("#clipboard").select();
		document.execCommand('copy',true);
	}
	this.onLogin = function(){
		var uname = document.getElementById('username');
		var pass = document.getElementById('password');
		if(uname == undefined || pass == undefined){
			console.log("Login failed: username, pass values do not exist.");
			return;
		}
		chrome.extension.sendMessage({action: "login", username: uname.value, password: pass.value })
		
	}

	this.onPlay = function(){
		console.log("playing stream")
		that = this;
		chrome.extension.sendMessage({action: "mix", name: "electrominimalicious" });

	}
	this.onPause = function(){
		chrome.extension.sendMessage({action: "pause"})
	}
	this.onResume = function(){
		chrome.extension.sendMessage({action: "resume"})
	}
	this.sync = function(){
		chrome.tabs.getSelected(null,function(tab) {
		    var tablink = tab.url;
		    if(tablink.indexOf("8tracks.com") > -1){
		    	tabarr = tablink.split("/");
		    	mixname = tabarr[tabarr.length-1];
		    	artistname = tabarr[tabarr.length-2];
		    	chrome.extension.sendMessage({action: "mix", name: mixname, artist: artistname});
		    }
		});
	}
	this.updateView = function(){
		uthat = this;
		chrome.extension.sendMessage({action: "get-track-info"}, function(data){
			console.log(data);
	    	$("#mix-title").html(data.mix_name);
			$("#track-title").html(data.track_name);
			$("#track-artist").html(data.track_artist);

			$("#mix-tags").html(data.mix_tag_list);
			$("#mix-likes").html(data.mix_likes_count);
			$("#mix-plays").html(data.mix_plays_count);
			$("#mix-tracks").html(data.mix_tracks_count);
			$("#mix-description").html(data.mix_description);

			$( "#albumart" ).attr( "src", data.mix_cover );
			$("#player_prog").slider('value', data.track_time/data.track_duration*100.0);
			if(data.skip_ok){
				$("#player_skip").attr("src", "images/ffwd.png");
			}
			else{
				$("#player_skip").attr("src", "images/ffwd-disable.png");
			}
			if(data.is_paused){
	    		$("#player_play").removeClass("playing");
	    		$("#player_play").attr("src", "images/play.png");
	    	}
	    	else{
	    		$("#player_play").addClass("playing");
	    		$("#player_play").attr("src", "images/pause.png");
	    	}
	    	if(data.track_favorite){
	    		$("#player_star_track").addClass("favorite");
	    		$("#player_star_track").attr("src", "images/star-on.png");
	    	}
	    	else{
	    		$("#player_star_track").removeClass("favorite");
	    		$("#player_star_track").attr("src", "images/star.png");
	    	}
	    	if(data.mix_like){
	    		$("#player_like_mix").addClass("like");
	    		$("#player_like_mix").attr("src", "images/heart-on.png");
	    	}
	    	else{
	    		$("#player_like_mix").removeClass("like");
	    		$("#player_like_mix").attr("src", "images/heart.png");
	    	}
			if(!data.hasOwnProperty("mix_name")){
				//autoload
				uthat.sync();
			}
	    });
	    if(this.timer == null){
	    	that = this;
			this.timer = window.setInterval(function(){
				chrome.extension.sendMessage({action: "get-track-info"}, function(data){
					$("#player_prog").slider('value', data.track_time/data.track_duration*100.0);
					if($('#player_prog').slider("option", "value") >= 100){
						window.clearInterval(that.timer);
						that.timer == null;
					}
			    });
			}, 1000);
		}
	}
	this.init();
}
userInterface = new UserInterface();

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
			  if(request.action == "update"){
			  		userInterface.updateView();
			  }
	}
)


document.addEventListener('DOMContentLoaded', function() {
    $("#login").click(userInterface.onLogin);

    $("#export_spotify").click(function(){
    	console.log("clicky");
    	chrome.extension.sendMessage({action: "playlist-spotify"}, function(resp){
    		userInterface.setClipboard(resp.playlist);
    	})
    })
    $("#export_itunes").click(function(){
    	chrome.extension.sendMessage({action: "playlist-itunes"}, function(resp){
    		userInterface.setClipboard(resp.playlist);
    	})
    })
    $("#export_lastfm").click(function(){
    	chrome.extension.sendMessage({action: "playlist-lastfm"}, function(resp){
    		userInterface.setClipboard(resp.playlist);
    	})
    })
    $("#export_text").click(function(){
    	chrome.extension.sendMessage({action: "playlist-text"}, function(resp){
    		userInterface.setClipboard(resp.playlist);
    	})
    })


    $("#playstream").click(userInterface.onPlay);

    $("#player_play").click(function(){
    	if($("#player_play").hasClass("playing")){
    		$("#player_play").removeClass("playing");
    		userInterface.onPause();
    		$("#player_play").attr("src", "images/play.png");
    	}
    	else{
    		$("#player_play").addClass("playing");
    		$("#player_play").attr("src", "images/pause.png");
    		userInterface.onResume();
    	}
    });
    $("#player_skip").click(function(){
    	chrome.extension.sendMessage({action: "skip"})
    })
    $("#player_sync").click(function(){
    	userInterface.sync();
    })
    $("#player_volume").click(function(){
    	var position = {left: 0, top: 0};
		$(".box-overlay").css( { position: "absolute", left: position.left, top: position.top } );
	});
	$("#player_like_mix").click(function(){
		if($("#player_like_mix").hasClass("like")){
    		chrome.extension.sendMessage({action: "unlike-mix"})
    	}
    	else{
    		chrome.extension.sendMessage({action: "like-mix"})
    	}	
	})
	$("#player_star_track").click(function(){
		if($("#player_star_track").hasClass("favorite")){
    		chrome.extension.sendMessage({action: "unfavorite-track"})
    	}
    	else{
    		chrome.extension.sendMessage({action: "favorite-track"})
    	}	
	})
    $( "#player_prog" ).slider({
    	range: "min",
    	slide: function(event, ui) { 
    		pct = ui.value/100.0; 
    		console.log("ui:"+pct)
    		chrome.extension.sendMessage({action: "set-time", percent:pct})
    	}
    });
    /*
    $( "#more-info" ).accordion({
    	collapsible: true,
    	autoHeight: false,
    	heightStyle: "content"
    });
    */
    userInterface.updateView();    
});
