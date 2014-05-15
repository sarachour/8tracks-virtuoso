
function OptionsInterface(){
	this.init = function(){
	}
	this.setClipboard = function(text, msg){
		$("#clipboard").text(text);
		$("#clipboard").select();
		$("#export-status").html(msg);
		document.execCommand('copy',true);
	}
	this.on8TracksLogin = function(){
		var uname = document.getElementById('tracks-username').value;
		var pass = document.getElementById('tracks-password').value;
		var that = this;
		if(uname == "" || pass == ""){
			console.log("Login failed: username, pass values do not exist.");
			return;
		}
		eightTracks.login(uname, pass, function(){
			//reload persistant data
			chrome.extension.sendMessage({action: "reload"})
			that.updateView();
		});

		
	}
	this.onLastFMLogin = function(){
		var uname = document.getElementById('lastfm-username');
		var pass = document.getElementById('lastfm-password');
		if(uname == undefined || pass == undefined){
			console.log("Login failed: username, pass values do not exist.");
			return;
		}
		
		//chrome.extension.sendMessage({action: "login", username: uname.value, password: pass.value })
		
	}
	this.onSaveMusicTrackPrefs = function(){
		val = $("#playlist_type").val();
		localStorage.playlist_track_type = val;
		chrome.extension.sendMessage({action: "reload"})
		console.log(val);
	}
	this.onSavePreferences = function(){
		this.on8TracksLogin();
		this.onLastFMLogin();
		this.onSaveMusicTrackPrefs();

	}

	this.updateView = function(){
		if(eightTracks.user_token != undefined){
			$("#tracks-login-ok").attr("src", "images/dot-ok.png");
		}
		else{
			$("#tracks-login-ok").attr("src", "images/dot-err.png");
		}
		
	}
	this.init();
}
optionsInterface = new OptionsInterface();

document.addEventListener('DOMContentLoaded', function() {
    $("#save").click(function(){
    	console.log("saving");
    	optionsInterface.onSavePreferences();
    });

    $("#playlist-clear").click(function(){
    	chrome.extension.sendMessage({action: "playlist-clear"}, function(resp){
    		console.log("playlist cleared.");
    	})
    })

    $("#export-spotify").click(function(){
    	chrome.extension.sendMessage({action: "playlist-spotify"}, function(resp){
    		optionsInterface.setClipboard(resp.playlist, "copied to clipboard. paste into spotify playlist.");
    	})
    })
    $("#export-text").click(function(){
    	chrome.extension.sendMessage({action: "playlist-text"}, function(resp){
    		optionsInterface.setClipboard(resp.playlist, "copied to clipboard. paste into text file.");
    	})
    })

    optionsInterface.updateView();    
});