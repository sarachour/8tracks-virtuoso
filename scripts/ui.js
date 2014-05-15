
function UserInterface(){
	this.init = function(){
		this.timer = null;
		if(localStorage.hasOwnProperty("ui_openTab"))
			this.openTab = parseInt(localStorage.ui_openTab);
		else this.openTab = null;
		console.log(this.openTab);
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
	//var RTM_URL_RE_ = /http?\:\/\/www.8tracks.com\//; 

	this.getRegexTab = function(url_regex, callback) { 
		chrome.tabs.getAllInWindow(undefined, function(tabs) { 
			for (var i = 0, tab; tab = tabs[i]; i++) { 
				if (tab.url && url_regex.test(tab.url)) { 
					callback(tab); 
					called = true;
				} 
			} 
		})
		if(!called) callback(null); 
	} 
	this.openURL = function(newurl){
		var findid = this.openTab;
		if(findid == null){
			chrome.tabs.create({url: newurl}, function(tab){
				this.openTab = tab.id;
				localStorage.ui_openTab= this.openTab;
			});
			return;
		}
		chrome.tabs.get(findid, function(tab){
			if(tab != undefined){
				chrome.tabs.update(tab.id, {url: newurl, selected: true}); 
				return;
			}
			else{
				chrome.tabs.create({url: newurl}, function(tab){
				this.openTab = tab.id;
				localStorage.ui_openTab= this.openTab;
			}); 
				return;
			}
		})
		
	}


	this.updateView = function(){
		var that = this;
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
	    	$("#player_goto").click(function(){
	    		that.openURL(data.mix_url);
	    	})
	    	$("#player_purchase").click(function(){
	    		that.openURL(data.track_buy);
	    	})
	    	if(data.mix_rank == "gold"){
	    		$("#mix_rank").attr("src", "images/gold.png");
	    	}
	    	else if(data.mix_rank == "silver"){
	    		$("#mix_rank").attr("src", "images/silver.png");
	    	}
	    	else if(data.mix_rank == "bronze"){
	    		$("#mix_rank").attr("src", "images/bronze.png");
	    	}
			if(!data.hasOwnProperty("mix_name")){
				//autoload
				that.sync();
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
    userInterface.updateView();    
});
