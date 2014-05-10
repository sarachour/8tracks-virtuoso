
function onLogin(){
	var uname = document.getElementById('username');
	var pass = document.getElementById('password');
	if(uname == undefined || pass == undefined){
		console.log("Login failed: username, pass values do not exist.");
		return;
	}
	uname = uname.value;
	pass = pass.value;
	console.log(uname, pass)
	scrobbler.login(uname, pass, function(data){
		console.log("logged in");
		console.log(data);
		});
}
function onCreate(){
	scrobbler.createPlaybackStream(function(data){
		console.log("created stream");
		console.log(data);
	});
}
function onPlay(){
	scrobbler.playMix("electrominimalicious", function(data){
		console.log(data);
		trackinfo = data.set.track;

		$("#mix-title").html(scrobbler.play_mix.name);
		$("#track-title").html(trackinfo.name);
		$("#track-artist").html(trackinfo.performer);
		//$( "#player" ).attr( "src", trackinfo.track_file_stream_url );
		$( "#albumart" ).attr( "src", scrobbler.play_mix.cover );

		chrome.extension.sendMessage({action: "play", source: trackinfo.track_file_stream_url })

	});
}

document.addEventListener('DOMContentLoaded', function() {
    $("#login").click(onLogin);
    $("#createstream").click(onCreate);
    $("#playstream").click(onPlay);
});
