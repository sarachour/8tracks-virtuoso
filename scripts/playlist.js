function Playlist(){
	this.spotify = new Spotify();
	this.save = function(){
		localStorage.setItem("playlist_cache", JSON.stringify(this.songs));
	}
	this.load = function(){
		if(localStorage.hasOwnProperty("playlist_cache")){
			this.songs = JSON.parse(localStorage.getItem("playlist_cache"));
			console.log(this.songs);
			//this.songs = {};
		}
		else{
			this.songs = {};
		}
	}
	this.add = function(artist, name){
		plist = this;
		if(!plist.songs.hasOwnProperty(artist)){
			plist.songs[artist] = {};
		}
		if(!plist.songs[artist].hasOwnProperty(name)){
			plist.songs[artist][name] = {};
		}
		this.spotify.search(artist, name, function(data){
			if(data.tracks.length > 0){
				plist.songs[artist][name].spotify = {track_id: data.tracks[0].href};
				plist.save();
			}
		})
				

	}
	this.getSpotify = function(){
		playlist = "";
		for(var artist in this.songs){
			for(var track in this.songs[artist]){
				if(this.songs[artist][track].hasOwnProperty("spotify")){
					playlist += this.songs[artist][track].spotify.track_id+"\n";
				}
			}
		}
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
		for(var artist in this.songs){
			for(var track in this.songs[artist]){
					playlist += artist + "\t"+track + "\n";
			}
		}
		return playlist;
	}
	this.load();


}
