
function MusicPlayer(){
	this.init_prefs = function(){
		var that = this;
		if(localStorage.hasOwnProperty("prefs")){
			console.log("parsing cached preferences");
			this.default_pref = JSON.parse(localStorage["prefs"]);
		}
		else{
			this.default_pref = {};
			this.default_pref["idle-pause"] = false;
			this.default_pref["autoplay"] = true;
			this.default_pref["toast-notify"] = true;
			this.default_pref["time-to-wait"] = 180;
			this.default_pref["is-casting"] = false;
			this.default_pref["curr-mix"] = {id:null, smart_id:null}
			var str = JSON.stringify(this.default_pref);
			localStorage["prefs"] = str;
		}

		this.prefs = {};
	   this.prefs["autoplay"] = {};
	   this.prefs["autoplay"].val = this.default_pref["autoplay"];
	   this.prefs["autoplay"].set_val = function(x){
	   	that.autoplay = x;
	   };
	   
	   this.prefs["idle-pause"] = {};
	   this.prefs["idle-pause"].val = this.default_pref["idle-pause"];
	   this.prefs["idle-pause"].set_val = function(x){
	   	that.pause_on_idle = x;
	   };

	   this.prefs["toast-notify"] = {};
	   this.prefs["toast-notify"].val = this.default_pref["toast-notify"];
	   this.prefs["toast-notify"].set_val = function(x){
	   	toast.disabled = !x
	   };

	   this.prefs["is-casting"] = {};
	   this.prefs["is-casting"].val = this.default_pref["is-casting"];
	   this.prefs["is-casting"].set_val = function(x){
	   	that.is_casting = x;
	   }

	   this.prefs["time-to-wait"] = {};
	   this.prefs["time-to-wait"].val = this.default_pref["time-to-wait"];
	   this.prefs["time-to-wait"].set_val = function(x){
	   	chrome.idle.setDetectionInterval(x);
	   }

	   this.prefs["curr-mix"] = {};
	   this.prefs["curr-mix"].val = this.default_pref["curr-mix"];
	   this.prefs["curr-mix"].set_val =function(x){
	   	if(x.id != null && x.smart_id != null && 
	   		(that.curr_mix_id != x.id || that.smart_mix_id != x.smart_id)) {
	   		console.log('autoplay?',that.get_pref("autoplay"))
	   		that.mix(x.id, x.smart_id,that.get_pref("autoplay"));
	   	}
	   }


	   for(k in this.prefs){
	   	this.prefs[k].set_val(this.prefs[k].val)
	   }
		


	}
	this.get_pref = function(k){
		return this.prefs[k].val;
	}
	this.get_prefs = function(){
		var ps = {};
		for(p in this.prefs){
			ps[p] = this.prefs[p].val;
		}
		return ps;
	}
	this.set_pref = function(k,v){
		if(k in this.prefs){
			this.prefs[k].val = v;
			this.prefs[k].set_val(v);
			/* save local copy of preferences. */
			localStorage["prefs"] = JSON.stringify(this.get_prefs());
			return {action:"set-pref-status",status:"success"};
		}
		else {
			return {action:"set-pref-status",status:"failure", msg:"preference doesn't exist."}
		}
	}


	this.init = function(){
		this.player = new Player();
	   this.track_info = null;
	   this.mix_info = null;
	   this.idle_pause = this.is_paused = false;

	   this.init_prefs();
	   this.playlist = new Playlist("persist_playlist", true);
	   var that = this;

		
	   chrome.idle.onStateChanged.addListener(function(kind){
	   	//is not paused and is presently not idle.
	   	if(kind == "active"){
	   		toast.disabled = false;
	   	}
	   	else {
	   		toast.disabled = !that.get_pref("toast-notify");
	   	}

	   	if(that.is_paused == false && that.idle_pause == false && 
	   		(kind == "locked" || (kind == "idle" && that.pause_on_idle) )
	   		){
	   		that.idle_pause = true;
	   		that.pause();
	   		toast.pause(that.mix_info.cover_urls.sq56);
	   	}
	   	//if we are pausing on idle
	   	if(that.idle_pause && kind == "active"){
	   		that.resume();
	   		toast.resume(that.mix_info.cover_urls.sq56);
	   		that.idle_pause = false;
	   	}
	   })

	   //this.player.error
	   this.player.onError(function(e) { 
               console.log("Logging playback error: ", e); 
               console.log("     ", that.player[0].error);
               console.log(that.player[0].src);
               toast.error("Playback Error", "the streaming link is broken.")
               tracks8.reportError(that.track_info.id, function(){
               		that.nextTrack();
               })
		})
		chrome.commands.onCommand.addListener(function(command) {
			if(command == "like-mix"){
				if(that.mix_info.hasOwnProperty("liked_by_current_user")){
					var liked = that.mix_info.liked_by_current_user;
					var name = that.mix_info.name;
					var cover = that.mix_info.cover_urls.sq56;
					if(!liked){
						var message = "Liked Mix"
						that.likeMix();
					}
					else{
						var message = "Unliked Mix"
						that.unlikeMix();
					}
					toast.track(that.mix_info.cover_urls.sq56, message, 
					that.mix_info.name);
				}
			}
			else if(command == "fav-track"){
				if(that.track_info.hasOwnProperty("faved_by_current_user")){
					var liked = that.track_info.faved_by_current_user;
					var name = that.track_info.name;
					var cover = that.mix_info.cover_urls.sq56;
					var artist = that.track_info.performer;
					if(!liked){
						that.favoriteTrack();
						var message = "Favorited Track"
					}
					else{
						that.unfavoriteTrack();
						var message = "Unfavorited Track"
					}
					toast.track(that.mix_info.cover_urls.sq56, message, 
					"\'"+that.track_info.name+"\' by "+that.track_info.performer);
				}
			}
			else if(command == "pause-play-track"){

				if(that.is_paused){
					var message = "Resumed Track";
					that.resume();
				}
				else {
					var message = "Paused Track";
					that.pause();
				}
				toast.track(that.mix_info.cover_urls.sq56, message, 
					"\'"+that.track_info.name+"\' by "+that.track_info.performer);
			}
			else if(command == "next-track"){
				var message = "Skipping Track"
				toast.track(that.mix_info.cover_urls.sq56, message, 
					"\'"+that.track_info.name+"\' by "+that.track_info.performer);
				that.skip();
			}
		});

		
		chrome.extension.onMessage.addListener(
		  function(request, sender, sendResponse) {
			  if(request.action == "play"){
			  		that.mix(request.id, request.smart_id);
			  }
			  else if(request.action == "cast"){
			  		that.cast(request);
			  }
			  else if(request.action == "resume"){
			  		that.resume();
			  }
			  else if(request.action == "set-pref"){
			  		console.log("set",request)
			  		sendResponse(that.set_pref(request.key, request.value));
			  }
			  else if(request.action == "get-prefs"){
			  		sendResponse(that.get_prefs());
			  }
			  else if(request.action == "get-pref"){
			  		sendResponse(that.get_pref(request.key));
			  }
			  else if(request.action == "pause"){
			  		that.pause();
			  }
			  else if(request.action == "next-mix"){
			  		that.nextMix();
			  }
			  else if(request.action == "skip"){
			  		that.skip();
			  }
			  else if(request.action == "set-time"){
			  		that.setTime(request.percent);
			  }
			  else if(request.action == "set-volume"){
			  		that.setVolume(request.percent);
			  }
			  else if(request.action == "get-track-info"){
			  		sendResponse(that.getTrackInfo());
			  }
			  else if(request.action == "like-mix"){
			  		that.likeMix();
			  }
			  else if(request.action == "unlike-mix"){
			  		that.unlikeMix();
			  }
			  else if(request.action == "favorite-track"){
			  		that.favoriteTrack();
			  }
			  else if(request.action == "unfavorite-track"){
			  		that.unfavoriteTrack();
			  }
			  else if(request.action == "playlist-clear"){
			  		that.playlist.clear();
			  		that.UPDATE_MIX_INFO();
			  		that.UPDATE_TRACK_INFO();
			  }
			  else if(request.action == "playlist-get"){
			  	if(request.type == "spotify")
			  		sendResponse({"playlist": that.playlist.getSpotify()});
			  	else if(request.type == "tab")
			  		sendResponse({"playlist": that.playlist.getTabDelimited()});
			  	else if(request.type == "obj")
			  		sendResponse({"playlist": that.playlist.getObject()});
			  }
			});

			//this.player.bind("ended", function () {
			this.player.on("ended", function() {
		        that.nextTrack();
		   });
	}
	
	this.cast = function(obj){
		this.is_casting = !this.is_casting;
		if(this.is_casting){
			chromeCaster.play({mix:this.mix_info, track:this.track_info});
		}
		console.log("cast",this.is_casting);
	}


	this.getTrackInfo = function(){
		if(this.mix_info == null || this.track_info == null){
			return null;
		}
		var data = {};
		data.mix_rank = this.mix_info.certification; //gold, silver, platinum
		data.mix_description = this.mix_info.description;
		data.mix_likes_count = this.mix_info.likes_count;
		data.mix_plays_count = this.mix_info.plays_count;
		data.mix_tag_list = this.mix_info.tag_list_cache;
		data.mix_tracks_count = this.mix_info.tracks_count;
		data.mix_url = "http://www.8tracks.com"+this.mix_info.path;
		data.mix_name = this.mix_info.name;
		data.mix_cover = this.mix_info.cover_urls.sq250;
		data.mix_like = this.mix_info.liked_by_current_user;
		data.track_name = this.track_info.name;
		data.track_artist = this.track_info.performer;
		data.track_album = this.track_info.release_name;
		data.track_buy = this.track_info.buy_link;
		data.track_favorite = this.track_info.faved_by_current_user;
		data.track_duration = this.player.getDuration();
		data.track_time = this.player.getTime();
		data.skip_ok = this.other_info.isSkipOk;
		data.is_paused = this.is_paused;
		data.player_volume = this.player.getVolume();
		//data.player = this.player;
		return data;
	}
	this.play = function(src){
		var that = this;
		this.player.load(src);
		this.player.play(function(){
			if(!this.player.hasOwnProperty('duration')){
				console.log("the source appears to be null. loading next.");
				that.nextTrack();
			}
		});
	}
	this.SET_MIX_INFO = function(mixdata){
		this.mix_info = mixdata;
		this.UPDATE_MIX_INFO();
	}
	this.UPDATE_MIX_INFO = function(){
		this.playlist.addMix(this.mix_info.name,this.mix_info, function(){
			chrome.extension.sendMessage({action: "update"})
		});
	}
	this.SET_TRACK_INFO = function(setdata, trackdata){
		this.track_info = trackdata;
		this.other_info = {
			isBeginning: setdata.at_beginning,
			isEnd: setdata.at_end,
			isLastTrack: setdata.at_last_track,
			isSkipOk: setdata.skip_allowed,
		};
		toast.track(this.mix_info.cover_urls.sq56, "Now Playing",
			"\'"+this.track_info.name+"\' by "+ this.track_info.performer);
		this.play(this.track_info.track_file_stream_url );
		this.UPDATE_TRACK_INFO();
		if(this.is_casting){ // cast next track.
			chromeCaster.play({mix:this.mix_info, track:this.track_info});
		}
		
		
	}
	this.UPDATE_TRACK_INFO = function(){
		this.playlist.addTrack(this.mix_info.name,this.track_info.performer, this.track_info.name, this.track_info,
			function(){
				chrome.extension.sendMessage({action: "update"})
		});
	}
	this.nextMix = function(){
		var that = this;

		tracks8.playNextMix(that.mix_info.id, that.smart_mix_id, function(mixdata, data, e){
			if(mixdata == null || data == null){
				that.reportError(e);
				return;
			}

			if(mixdata != null)
				that.SET_MIX_INFO(mixdata.next_mix);
			
			if(data != null)
				that.SET_TRACK_INFO(data.set, data.set.track);
		

		});
	}
	this.mix = function(mixid, smartmixid,playonload){
		var that = this;
		this.smart_mix_id = smartmixid;
		this.curr_mix_id = mixid;
		that.set_pref("curr-mix",{smart_id:smartmixid, id:mixid})
		
		tracks8.getMix(mixid, function(data, e){
			if(data != null){
				that.SET_MIX_INFO(data.mix);
				tracks8.playMix(mixid, function(data, e){
					if(data != null){
						console.log(data);
						that.SET_TRACK_INFO(data.set, data.set.track);
						if(playonload == false){
							that.pause();
						}
					}
					else{
						that.reportError(e);
					}
				});
			}
			else{
				that.reportError(e);
			}
		})
	}
	this.skip = function(){
		var that = this;
		tracks8.skipTrack(this.mix_info.id, function(data, e){
			if(data != null){
				that.SET_TRACK_INFO(data.set, data.set.track);
			}
			else{
				that.reportError(e);
			}
		});
	}
	this.resume = function(){
		//this.player.trigger("play");
		this.player.play();
		this.is_paused = false;
	}
	this.pause = function(){
		//this.player.trigger("pause");
		this.player.pause();
		this.is_paused = true;
	}
	this.likeMix = function(){
		var that = this;
		tracks8.likeMix(that.mix_info.id, function(data){
			that.mix_info.liked_by_current_user = data.mix.liked_by_current_user;
			that.UPDATE_MIX_INFO();
		});
		
	}
	this.unlikeMix = function(){
		var that = this;
		tracks8.unlikeMix(that.mix_info.id, function(data){
			that.mix_info.liked_by_current_user = data.mix.liked_by_current_user;
			that.UPDATE_MIX_INFO();
		});
		
	}
	this.favoriteTrack = function(){
		var that = this;
		tracks8.favoriteTrack(that.track_info.id, function(data){
			that.track_info.faved_by_current_user = data.track.faved_by_current_user;
			that.UPDATE_TRACK_INFO();

		})
	}
	this.unfavoriteTrack = function(){
		var that = this;
		tracks8.unfavoriteTrack(that.track_info.id, function(data){
			that.track_info.faved_by_current_user = data.track.faved_by_current_user;
			that.UPDATE_TRACK_INFO();

		})
	}
	this.nextTrack = function(){
		var that = this;
		if(this.isWellPlayed()){
			//report if song has been played
			tracks8.report(that.mix_info.id, that.track_info.id, function(data, status){
				if(data != null){
					console.log("REPORT: ", data);
				}
				else{
					console.log("REPORT ERROR: ", data)
				}
			});
		}
		if(that.other_info.isEnd == true || that.other_info.isLastTrack == true){
			tracks8.playNextMix(that.mix_info.id, that.smart_mix_id, function(mixdata, data, e){
				that.SET_MIX_INFO(mixdata.next_mix);
				if(data != null  && data.set.track.hasOwnProperty("track_file_stream_url")){
					that.SET_TRACK_INFO(data.set, data.set.track);
				}
				else{
					that.nextTrack();
				}
				if(mixdata == null || data == null){
					that.reportError(e);
				}
			});
		}
		else{
			tracks8.nextTrack(this.mix_info.id, this.smart_mix_id, function(data, e){
				if(data != null && data.set.track.hasOwnProperty("track_file_stream_url")){
					that.SET_TRACK_INFO(data.set, data.set.track);
				}
				else{
					that.other_info.isEnd = that.other_info.isLastTrack = true;
					that.nextTrack();
					that.reportError(e);
					
				}
			});
		}
		
	}
	this.reportError = function(e){
		console.log("REPORT ERROR", e);
		var status = e.responseJSON.status;
		var msg = "";
		if(e.responseJSON.errors != null) msg= e.responseJSON.errors;
		else if(e.responseJSON.notices != null) msg= e.responseJSON.notices;
		toast.error(status, msg);
	}
	this.setVolume = function(pct){
		//this.player[0].volume = pct;
		this.player.setVolume(pct);
	}
	this.setTime = function(pct){
		//newtime = pct*parseFloat(this.player[0].duration);
		newtime = pct*parseFloat(this.player.getDuration());
		this.pause();
		//this.player[0].currentTime = newtime
		this.player.setTime(newtime);
		this.resume();
	}
	this.isWellPlayed = function(){
		//var played = this.player[0].played;
		var played = this.player.getPlayedSegments();
		var total = 0;
		for(var i=0; i < played.length; i++){
			total += played.end(i) - played.start(i);
		}
		return (total > 30);
	}
	this.init();

}

musicplayer = new MusicPlayer();