function Playlist(){
	this.songs = [];
	this.spotify = new Spotify();
	this.add = function(artist, name){
		songdata = {};
		songdata.artist = artist;
		songdata.name = name;
		playlist = this;
		this.spotify.search(artist, name, function(data){
			console.log(data);
			if(data.tracks.length > 0){
				track = data.tracks[0];
				songdata.spotify = {};
				songdata.spotify.track_id = track.href;
				console.log(songdata);
				playlist.songs.push[songdata];
			}
		})
		

	}
	this.getSpotifyPlaylist = function(){
		playlist = "";
		for(song : this.songs){
			playlist += song.spotify.track_id + "\n";
		}
		return playlist;
	}
	this.getNormalPlaylist = function(){
		playlist = "";
		for(song : this.songs){
			playlist += song.artist + ","+song.name + "\n";
		}
		return playlist;
	}


}
