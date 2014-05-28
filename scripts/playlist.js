function Playlist(name, isPersistant){
	
	this.init = function(name, isPersistant){
		this.spotify = new Spotify();
		this.name = name;
		this.isPersistant = isPersistant;
		this.load();
	}

	this.save = function(){
		if(this.isPersistant){
			var STATE_NAME = this.name+"_STATE";
			localStorage.setItem(name, JSON.stringify(this.data));
			localStorage[STATE_NAME] = this.NEW_STATE;
		}
	}
	this.load = function(){
		if(this.isPersistant){
			var STATE_NAME = this.name+"_STATE";
			this.data = {};
			this.STATE = false;
			if(localStorage.hasOwnProperty(this.name)){
				this.data = JSON.parse(localStorage.getItem(this.name));
			}
			if(localStorage.hasOwnProperty(STATE_NAME)){
				this.STATE = !localStorage.getItem(STATE_NAME);
			}
		}
	}
	this.clear = function(){
		this.data = {};
		this.save();
	}
	this._insert_mix = function(mix, props){
		if(!this.data.hasOwnProperty(mix)){
			this.data[mix] = {};
			this.data[mix].tracks = {};
		}
		for(var p in props){
			if(props.hasOwnProperty(p)){
				this.data[mix][p] = props[p];
			}
		}
		if(this.isPersistant){
			this.data[mix].STATE = this.STATE;
		}
	}
	this._insert_track = function(mix, artist, name, props){
		if(!this.data.hasOwnProperty(mix)){
			this._insert_mix(mix, {});
		}
		var ldata = this.data[mix].tracks;
		

		if(!ldata.hasOwnProperty(artist)){
			ldata[artist] = {};
		}
		if(!ldata[artist].hasOwnProperty(name)){
			ldata[artist][name] = {};
		}
		
		for(var p in props){
			if(props.hasOwnProperty(p)){
				ldata[artist][name][p] = props[p];
			}
		}
		if(this.isPersistant){
			this.data[mix].STATE = this.STATE;
			ldata[artist].STATE = this.STATE;
			ldata[artist][name].STATE = this.STATE;
		}
	}
	this.addMix = function(mix, props, callback){
		this._insert_mix(mix, props);
		if(callback != null) callback();
	}
	this.addTrack = function(mix, artist, name, props, callback){
		this._insert_track(mix, artist, name, props)
		this.save();

		var that = this;
		this.spotify.search(artist, name, function(data){
			if(data.tracks.length > 0){
				var link = data.tracks[0].href;
				that.data[mix].tracks[artist][name].spotify = {track_id: link};
				/*plist.spotify.createTrackset("8tracks", plist._getSpotify(plist.local), function(){});*/
				that.save();
			}
			if(callback != null) callback();
		})

	}
	this.getSpotify = function(){
		playlist = [];
		var data = this.data;
		for(var mix in data){
			for(var artist in data[mix].tracks){
				for(var track in data[mix].tracks[artist]){
					if(data[mix].tracks[artist][track].hasOwnProperty("spotify")){
						playlist.push(data[artist][track].spotify.track_id);
					}
				}
			}
		}
		return playlist;
	}
	this.getObject = function(){
		return this.data;
	}
	this.getTabDelimited = function(){
		playlist = "";
		playlist = "artist\ttrack\tmixes\tstarred\nspotify\n";
		return playlist;
	}
	this.init(name, isPersistant);


}
