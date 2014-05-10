
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
	scrobbler.getMix("electrominimalicious", function(mixdata){
			console.log(mixdata);
			id = mixdata.mix.id;
			console.log("id: "+id);
			scrobbler.playMix(id, function(data){
				var player = document.getElementById('player');
				trackinfo = data.set.track;
				console.log("playing mix");
				console.log(data);
				console.log(player);

				name = trackinfo.name;
				performer = trackinfo.performer;
				skip_allowed = trackinfo.skip_allowed;
				at_end = trackinfo.at_end;
				release = trackinfo.release_name;
				url = trackinfo.url
				player.src = trackinfo.track_file_stream_url;
			});
	});
}

document.addEventListener('DOMContentLoaded', function() {
    var login = document.getElementById('login');
    var createstream = document.getElementById('createstream');
	var playstream = document.getElementById('playstream');
	var player = document.getElementById('player');
    // onClick's logic below:
    login.addEventListener('click', onLogin);
    createstream.addEventListener('click', onCreate);
    playstream.addEventListener('click', onPlay);
});
