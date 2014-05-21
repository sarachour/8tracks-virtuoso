
function OptionsInterface(){
	this.init = function(){
		this.updateView();
	}
	//style="display:none;"
	this.setClipboard = function(text, msg){
		$("#clipboard").css('visibility', 'visible');
		$("#clipboard").text(text);
		$("#clipboard").select();
		document.execCommand('copy',true);
		$("#export-status").html(msg)
		$("#export-status").fadeIn();
		$("#clipboard").css('visibility', 'hidden');
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
		chrome.extension.sendMessage({action: "playlist-get", type:"obj"}, function(resp){
			obj = resp.playlist;
    		console.log(obj);
    		$('#track-history').html('<tr class="body-sm-text" style="background-color:#131313;color:#D3D3D3;">'+
						'<td>Track Name</td><td>Artist Name</td><td>Mixes</td><td>Starred</td><td>Spotify Link</td>'+
					'</tr>')

    		for(var i=0; i < obj.length; i++){
    			var ob = obj[i];
    			star_link = "";
    			if(ob.star) star_link = '<div class="div-icon-inline"><img class="image-icon" src="images/star.png"/></div>'
    			spot_link = "";
    			if(ob.hasOwnProperty("spotify")){
    				var tid = ob.spotify.track_id;
    				spot_link = '<a href="'+tid+'">'+
    					'<div class="div-icon-inline"><img class="image-icon" src="images/dot-ok.png"/></div>'+
    					'</a>';
    			}
    			mixes = 
    			$('#track-history')
    			.append('<tr class="body-sm-text">' +
    				'<td>'+ ob.name +'</td>'+
    				'<td>'+ ob.artist +'</td>'+
    				'<td>' + ob.mix.toString() + '</td>'+
    				'<td>' + star_link + '</td>'+
    				'<td>' + spot_link + '</td>'+
    				'</tr>');
    		}
    	})
		
	}
	this.init();
}
optionsInterface = new OptionsInterface();

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
			  if(request.action == "update"){
			  		optionsInterface.updateView();
			  }
	}
)

document.addEventListener('DOMContentLoaded', function() {
    $("#save").click(function(){
    	console.log("saving");
    	optionsInterface.onSavePreferences();
    	optionsInterface.updateView();
    });

    $("#playlist-clear").click(function(){
    	chrome.extension.sendMessage({action: "playlist-clear"}, function(resp){
    		console.log("playlist cleared.");
    	})
    })

    $("#export-spotify").click(function(){
    	chrome.extension.sendMessage({action: "playlist-get", type:"spotify"}, function(resp){
    		console.log(resp.playlist);
    		optionsInterface.setClipboard(resp.playlist, "copied to clipboard. paste into spotify playlist.");
    	})
    })
    $("#export-text").click(function(){
    	chrome.extension.sendMessage({action: "playlist-get", type:"tab"}, function(resp){
    		console.log(resp.playlist);
    		optionsInterface.setClipboard(resp.playlist, "copied to clipboard. paste into text file.");
    	})
    })

    optionsInterface.updateView();    
});