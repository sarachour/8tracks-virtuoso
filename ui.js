
function UserInterface(){
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
		/*
		$("#mix-title").html(scrobbler.play_mix.name);
		$("#track-title").html(trackinfo.name);
		$("#track-artist").html(trackinfo.performer);
		//$( "#player" ).attr( "src", trackinfo.track_file_stream_url );
		$( "#albumart" ).attr( "src", scrobbler.play_mix.cover );
		*/
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
	this.updateView = function(){
		chrome.extension.sendMessage({action: "getTrackInfo"}, function(data){
			console.log(data);
	    	$("#mix-title").html(data.mix_name);
			$("#track-title").html(data.track_name);
			$("#track-artist").html(data.track_artist);
			$( "#albumart" ).attr( "src", data.mix_cover );
			$("#player_container")
				.attr("duration", data.track_duration)
				.attr("currentTime", data.track_time);
	    });
		
		
	}
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
    $("#playstream").click(userInterface.onPlay);
    userInterface.updateView();
    
});
