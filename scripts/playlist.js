function Playlist(){
	this.songs = [];
	this.spotify = new Spotify();
	this.add = function(artist, name){
		songdata = {};
		songdata.artist = artist;
		songdata.name = name;
		plist = this;
		this.spotify.search(artist, name, function(data){
			console.log(data);
			if(data.tracks.length > 0){
				track = data.tracks[0];
				songdata.spotify = {};
				songdata.spotify.track_id = track.href;
				console.log(songdata);
				plist.songs.push(songdata);
			}
		})
		

	}
	this.getSpotify = function(){
		playlist = "";
		this.songs.forEach(function(song){
			playlist += song.spotify.track_id + "\n";
		})
		return playlist;
	}
	this.getItunes = function(){
		return "ITunes";
	}
	this.getLastFm = function(){
		return "LASTFM";
	}
	this.getPlain = function(){
		playlist = "";
		this.songs.forEach(function(song){
			console.log(song);
			playlist += song.artist + "\t"+song.name + "\n";
		});
		return playlist;
	}


}
