function Playlist(){
	this.spotify = new Spotify();
	this.save = function(){
		localStorage.setItem("playlist_cache", JSON.stringify(this.songs));
	}
	this.reload = function(){
		this.load();
		if(localStorage.hasOwnProperty("playlist_track_type")){
			this.track_type = localStorage.playlist_track_type;
		}
		else {
			this.track_type = "all";
		}
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
	this.clear = function(){
		this.songs = {};
		this.save();
	}
	this.add = function(artist, name, starred){
		plist = this;
		if(this.track_type == "none"){
			return;
		}

		//created a new track in cache if doesn't exist
		if(!plist.songs.hasOwnProperty(artist)){
			plist.songs[artist] = {};
		}
		if(!plist.songs[artist].hasOwnProperty(name)){
			plist.songs[artist][name] = {};
		}
		plist.songs[artist][name].star = starred;
		//if the cache entry was a starred song, but now we're recording all songs
		//upgrade the cache entry status
		//get rid of ellipses
		var sanitized_name = name.replace(/ *\([^)]*\) */g, "");
		var sanitized_artist = artist.replace(/ *\([^)]*\) */g, "");

		this.spotify.search(sanitized_artist, sanitized_name, function(data){
			if(data.tracks.length > 0){
				plist.songs[artist][name].spotify = {track_id: data.tracks[0].href};
				plist.save();
			}
		})
		plist.save();	

	}
	this.getSpotify = function(){
		playlist = "";
		for(var artist in this.songs){
			for(var track in this.songs[artist]){
				if(this.songs[artist][track].hasOwnProperty("spotify")){
					//if we're only tracking favorited songs, only display favorited songs.
					if(!(this.track_type == "fav") || this.songs[artist][track].star){
						playlist += this.songs[artist][track].spotify.track_id+"\n";
					}
				}
			}
		}
		return playlist;
	}
	this.getObject = function(){
		obj = [];
		for(var artist in this.songs){
			for(var track in this.songs[artist]){
					if(!(this.track_type == "fav") || this.songs[artist][track].star){
						var tmp = this.songs[artist][track];
						var ob = {};
						ob.spotify = tmp.spotify;
						ob.name = track;
						ob.artist = artist;
						ob.star = tmp.star;
						obj.push(ob);
					}
			}
		}
		return obj;
	}
	this.getPlain = function(){
		playlist = "";
		playlist = "artist\ttrack\tstarred\thas-spotify\n";
		for(var artist in this.songs){
			for(var track in this.songs[artist]){
					if(!(this.track_type == "fav") || this.songs[artist][track].star){
						var liked = this.songs[artist][track].star ? "star" : "none";
						var hasSpotify = "no";
						if(this.songs[artist][track].hasOwnProperty("spotify")){
							hasSpotify = "spotify";
						}
						playlist += artist + "\t"+track + "\t" + liked + "\t"+hasSpotify+ "\n";
					}
			}
		}
		return playlist;
	}
	this.load();


}
