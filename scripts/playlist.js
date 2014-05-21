function Playlist(){
	
	this.init = function(){
		this.spotify = new Spotify();
		this.songs = {};
		this.local = {};
		this.load();
	}

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
			//this.songs = {};
		}
	}
	this.clear = function(){
		this.songs = {};
		this.local = {};
		this.save();
	}
	this._insert = function(dict, artist, name, mix, starred, spotify_link){
		if(!dict.hasOwnProperty(artist)){
			dict[artist] = {};
		}
		if(!dict[artist].hasOwnProperty(name)){
			dict[artist][name] = {};
		}
		dict[artist][name].star = starred;
		if(spotify_link != null){
			dict[artist][name].spotify = {track_id: spotify_link};
		}
		if(!dict[artist][name].hasOwnProperty('mix')){
			dict[artist][name].mix = [];
		}
		//add mix if doesn't exist
		if(dict[artist][name].mix.indexOf(mix) < 0){
			dict[artist][name].mix.push(mix);
		}
	}
	this.add = function(artist, name, mix, starred){
		plist = this;
		if(this.track_type == "none"){
			return;
		}
		plist._insert(plist.songs, artist, name, mix, starred, null); //global copy
		plist._insert(plist.local, artist, name, mix, starred, null); //local copy
		//plist.spotify.createTrackset("8tracks", plist.getSpotify().split("\n"), function(){});
		plist.save();

		this.spotify.search(artist, name, function(data){
			if(data.tracks.length > 0){
				var link = data.tracks[0].href;
				plist._insert(plist.songs, artist, name, mix, starred, link); //global copy
				plist._insert(plist.local, artist, name, mix, starred, link); //local copy
				plist.save();
			}
		})

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
						if(tmp.hasOwnProperty("mix"))
							ob.mix = tmp.mix;
						else
							ob.mix = [];
						obj.push(ob);
					}
			}
		}
		return obj;
	}
	this.getPlain = function(){
		playlist = "";
		playlist = "artist\ttrack\tmixes\tstarred\nspotify\n";
		for(var artist in this.songs){
			for(var track in this.songs[artist]){
					if(!(this.track_type == "fav") || this.songs[artist][track].star){
						var liked = this.songs[artist][track].star ? "star" : "none";
						var mixes = this.songs[artist][track].mix; 
						var hasSpotify = "<no spotify>";
						if(this.songs[artist][track].hasOwnProperty("spotify")){
							hasSpotify = this.songs[artist][track].spotify.track_id;
						}
						playlist += artist + "\t"+track +"\t"+mixes.toString() +"\t" + liked + "\t"+hasSpotify+ "\n";
					}
			}
		}
		return playlist;
	}
	this.init();


}
