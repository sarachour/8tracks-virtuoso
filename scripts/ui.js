
chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
			  if(request.action == "update"){
			  		userInterface.updateView();
			  }
	}
)


document.addEventListener('DOMContentLoaded', function() {

	if(!localStorage.hasOwnProperty("user_token")){
		$("#login").css("display", "block");
		$("#login-ok").click(function(){
			var uname = document.getElementById('username').value;
			var pass = document.getElementById('password').value;
			var that = this;
			if(uname == "" || pass == ""){
				console.log("Login failed: username, pass values do not exist.");
				return;
			}
			eightTracks.login(uname, pass, function(){
				//reload persistant data
				chrome.extension.sendMessage({action: "reload"})
				$("#login-indicator").attr("src", "images/dot-ok.png");
				$("#login").fadeOut(500);
				userInterface.updateView();
			});
		});
	}
    $("#playstream").click(userInterface.onPlay);

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
    
    $("#player_sync").click(function(){
    	userInterface.sync();
    })
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
    		chrome.extension.sendMessage({action: "set-time", percent:pct})
    	}
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
    $("#player_volume").click(function () {
    	var pos = $("#player_volume").position();
    	var w= $("#player_volume_controls").width();
    	var h= $("#player_volume_controls").height();
    	console.log(pos);
    	$("#player_volume_controls").css('top',pos.top-h);
    	$("#player_volume_controls").css('left',pos.left+w);
		$("#player_volume_controls").fadeToggle("slow");
	});
    userInterface.updateView();    
});
