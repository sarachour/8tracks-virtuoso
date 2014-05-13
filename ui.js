
function UserInterface(){
	this.init = function(){
		this.timer = null;
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
	this.updateView = function(){
		chrome.extension.sendMessage({action: "getTrackInfo"}, function(data){
			console.log(data);
	    	$("#mix-title").html(data.mix_name);
			$("#track-title").html(data.track_name);
			$("#track-artist").html(data.track_artist);
			$( "#albumart" ).attr( "src", data.mix_cover );
			$("#player_prog").slider('value', data.track_time/data.track_duration*100.0);
			if(data.skip_ok){
				$("#player_skip").attr("src", "images/ffwd.png");
			}
			else{
				$("#player_skip").attr("src", "images/ffwd-disable.png");
			}
			if(!data.hasOwnProperty("mix_name")){
				//autoload
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
	    });
	    if(this.timer == null){
	    	that = this;
			this.timer = window.setInterval(function(){
				chrome.extension.sendMessage({action: "getTrackInfo"}, function(data){
					console.log("updating..");
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
    $("#playstream").click(userInterface.onPlay);
    $("#player_play").click(function(){
    	console.log("clicked: "+$("#player_play").hasClass("playing"));
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
    	console.log("skipping [ui]");
    	chrome.extension.sendMessage({action: "skip"})
    })
    $("#player_volume").click(function(){
    	var position = {left: 0, top: 0};
		$(".box-overlay").css( { position: "absolute", left: position.left, top: position.top } );
	});
    $( "#player_prog" ).slider({
    	range: "min",
    	slide: function(event, ui) { 
    		pct = ui.value/100.0; 
    		console.log("ui:"+pct)
    		chrome.extension.sendMessage({action: "setTime", percent:pct})
    	}
    });
    userInterface.updateView();    
});
