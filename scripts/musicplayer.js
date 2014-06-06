function Toast (){
	this.waitTime = 5000;
	this.nextTrack = function(){
		var ic = "images/ffwd-track.png"
		var not = new Notification("Next Track", 
		   {icon: ic, //"images/play.png"
			body: "skipping to the next track.", 
		});
		var that = this;
		not.onshow = function() {
			setTimeout(function() {not.close();}, that.waitTime);
			//setTimeout(not.close, 1500) 
		}
	}
	this.nextMix = function(){
		var ic = "images/ffwd-mix.png"
		var not = new Notification("Next Mix", 
		   {icon: ic, //"images/play.png"
			body: "skipping to the next mix.", 
		});
		var that = this;
		not.onshow = function() {
			setTimeout(function() {not.close();}, that.waitTime);
			//setTimeout(not.close, 1500) 
		}
	}
	this.favorite = function(cover_url, liked, trackname, trackartist){
		var desc = "unfavorited track"
		var ic = "images/star.png"
		if(liked){
			desc = "favorited track"
			ic = "images/star-on.png"
		}
		var not = new Notification(trackname, 
		   {icon: ic, //"images/play.png"
			body: trackartist, 
			tag: "STAR"
			//tag: "ERROR"
		});
		var that = this;
		not.onshow = function() {
			setTimeout(function() {not.close();}, that.waitTime);
			//setTimeout(not.close, 1500) 
		}
	}
	this.like = function(cover_url, liked, mixname){
		var desc = "unliked mix"
		var ic = "images/heart.png"
		if(liked){
			desc = "liked mix"
			ic = "images/heart-on.png"
		}
		var not = new Notification(mixname, 
		   {icon: ic, //"images/play.png"
			body: "", 
			tag: "LIKE"
			//tag: "ERROR"
		});
		var that = this;
		not.onshow = function() {
			setTimeout(function() {not.close();}, that.waitTime);
			//setTimeout(not.close, 1500) 
		}

	}
	this.error = function(status, message){
		var not = new Notification(status, 
		   {icon: "images/error.png", //"images/play.png"
			body: message, 
			tag: message
			//tag: "ERROR"
		});
		var that = this;
		not.onshow = function() {
			setTimeout(function() {not.close();}, that.waitTime);
			//setTimeout(not.close, 1500) 
		}

	}

	this.track = function(icon, track, artist){
		var not = new Notification(track, 
		   {icon: icon, //"images/play.png"
			body: artist, 
			//tag: "TRACK"
		});
		var that = this;
		not.onshow = function() {
			setTimeout(function() {not.close();}, that.waitTime);
			//setTimeout(not.close, 1500) 
		}
	}



}
toast = new Toast();

function MusicPlayer(){
	this.init = function(){
		this.player = $('<audio>', {
	      autoPlay : 'autoplay',
	      controls : 'controls',
	      id : "player"
	    });
	    this.track_info = null;
	    this.mix_info = null;
	    this.is_paused = false;
	    this.playlist = new Playlist("persist_playlist", true);
	    var that = this;
	    eightTracks.createPlaybackStream(function(data){
			console.log("created playback stream.");
		});
		chrome.runtime.onSuspend.addListener(function(){
			var currentdate = new Date();
			var datetime = "Suspend: " + currentdate.getDay() + "/"+currentdate.getMonth() 
			console.log(this)

		})
		chrome.runtime.onSuspend.addListener(function(){
			var currentdate = new Date();
			var datetime = "Suspend Cancelled: " + currentdate.getDay() + "/"+currentdate.getMonth() 
			console.log(this)

		})
		chrome.runtime.onStartup.addListener(function(){
			var currentdate = new Date();
			var datetime = "Startup: " + currentdate.getDay() + "/"+currentdate.getMonth() 
			console.log(this)

		})

		this.player.error(function(e) { 
               console.log("Logging playback error: ", e); 
               console.log("     ", that.player[0].error);
               toast.error("Playback Error", "the streaming link is broken.")
               eightTracks.reportError(that.track_info.id, function(){
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
						that.likeMix();
					}
					else{
						that.unlikeMix();
					}
					toast.like(cover, !liked, name);
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
					}
					else{
						that.unfavoriteTrack();
					}
					toast.favorite(cover, !liked, name, artist);
				}
			}
			else if(command == "next-mix"){
				toast.nextMix();
				that.nextMix();
			}
			else if(command == "next-track"){
				toast.nextTrack();
				that.skip();
			}
		});
		chrome.extension.onMessage.addListener(
		  function(request, sender, sendResponse) {
			  if(request.action == "play"){
			  		that.mix(request.id, request.smart_id);
			  }
			  else if(request.action == "resume"){
			  		that.resume();
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
			  else if(request.action == "reload"){
			  		that.reload();
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
		this.player.bind("ended", function () {
	        that.nextTrack();
	    });
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
		data.track_duration = this.player[0].duration;
		data.track_time = this.player[0].currentTime;
		data.skip_ok = this.other_info.isSkipOk;
		data.is_paused = this.is_paused;
		data.player_volume = this.player[0].volume;
		//data.player = this.player;
		return data;
	}
	this.reload = function(){
		eightTracks.reload();
	}
	this.play = function(src){
		var that = this;
		this.player.attr("src", src);
		$("#player").trigger("play", function(){
			if(!this.player.hasOwnProperty('duration')){
				console.log("the source appears to be null. loading next.");
				that.nextTrack();
			}
		});
		//$("#player").play();
		//this.player.play();
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
		console.log(setdata);
		this.other_info = {
			isBeginning: setdata.at_beginning,
			isEnd: setdata.at_end,
			isLastTrack: setdata.at_last_track,
			isSkipOk: setdata.skip_allowed,
		};
		toast.track(this.mix_info.cover_urls.sq56, this.track_info.name, this.track_info.performer);
		this.play(this.track_info.track_file_stream_url );
		this.UPDATE_TRACK_INFO();
		
	}
	this.UPDATE_TRACK_INFO = function(){
		this.playlist.addTrack(this.mix_info.name,this.track_info.performer, this.track_info.name, this.track_info,
			function(){
				chrome.extension.sendMessage({action: "update"})
			});
	}
	this.nextMix = function(){
		var mplayer = this;

		eightTracks.playNextMix(this.mix_info.id, this.smart_mix_id, function(mixdata, data, e){
			if(mixdata == null || data == null){
				mplayer.reportError(e);
				return;
			}

			if(mixdata != null)
				mplayer.SET_MIX_INFO(mixdata.next_mix);
			
			if(data != null)
				mplayer.SET_TRACK_INFO(data.set, data.set.track);
			

		});
	}
	this.mix = function(mixid, smartmixid){
		mplayer = this;
		this.smart_mix_id = smartmixid;
		eightTracks.getMix(mixid, function(data, e){
			if(data != null){
				mplayer.SET_MIX_INFO(data.mix);
				eightTracks.playMix(mixid, function(data, e){
					if(data != null){
						mplayer.SET_TRACK_INFO(data.set, data.set.track);
					}
					else{
						mplayer.reportError(e);
					}
				});
			}
			else{
				mplayer.reportError(e);
			}
		})
		
	}
	this.skip = function(){
		eightTracks.skipTrack(this.mix_info.id, function(data, e){
			if(data != null){
				mplayer.SET_TRACK_INFO(data.set, data.set.track);
			}
			else{
				mplayer.reportError(e);
			}
		});
	}
	this.resume = function(){
		this.player.trigger("play");
		this.is_paused = false;
	}
	this.pause = function(){
		this.player.trigger("pause");
		this.is_paused = true;
	}
	this.likeMix = function(){
		var mplayer = this;
		eightTracks.likeMix(mplayer.mix_info.id, function(data){
			mplayer.mix_info.liked_by_current_user = data.mix.liked_by_current_user;
			mplayer.UPDATE_MIX_INFO();
		});
	}
	this.unlikeMix = function(){
		var mplayer = this;
		eightTracks.unlikeMix(mplayer.mix_info.id, function(data){
			mplayer.mix_info.liked_by_current_user = data.mix.liked_by_current_user;
			mplayer.UPDATE_MIX_INFO();
		});
	}
	this.favoriteTrack = function(){
		var mplayer = this;
		eightTracks.favoriteTrack(mplayer.track_info.id, function(data){
			mplayer.track_info.faved_by_current_user = data.track.faved_by_current_user;
			mplayer.UPDATE_TRACK_INFO();

		})
	}
	this.unfavoriteTrack = function(){
		var mplayer = this;
		eightTracks.unfavoriteTrack(mplayer.track_info.id, function(data){
			mplayer.track_info.faved_by_current_user = data.track.faved_by_current_user;
			mplayer.UPDATE_TRACK_INFO();

		})
	}
	this.nextTrack = function(){
		var mplayer = this;
		if(this.isWellPlayed()){
			//report if song has been played
			eightTracks.report(this.mix_info.id, this.track_info.id);
		}
		if(this.other_info.isEnd == true || this.other_info.isLastTrack == true){
			eightTracks.playNextMix(this.mix_info.id, this.smart_mix_id, function(mixdata, data, e){
				mplayer.SET_MIX_INFO(mixdata.next_mix);
				if(data != null  && data.set.track.hasOwnProperty("track_file_stream_url")){
					mplayer.SET_TRACK_INFO(data.set, data.set.track);
				}
				else{
					mplayer.nextTrack();
				}
				if(mixdata == null || data == null){
					mplayer.reportError(e);
				}
			});
		}
		else{
			eightTracks.nextTrack(this.mix_info.id, this.smart_mix_id, function(data, e){
				if(data != null && data.set.track.hasOwnProperty("track_file_stream_url")){
					mplayer.SET_TRACK_INFO(data.set, data.set.track);
				}
				else{
					mplayer.other_info.isEnd = mplayer.other_info.isLastTrack = true;
					mplayer.nextTrack();
					mplayer.reportError(e);
					
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
		this.player[0].volume = pct;
	}
	this.setTime = function(pct){
		newtime = pct*parseFloat(this.player[0].duration);
		this.pause();
		this.player[0].currentTime = newtime
		this.resume();
	}
	this.isWellPlayed = function(){
		var played = this.player[0].played;
		var total = 0;
		for(var i=0; i < played.length; i++){
			total += played.end(i) - played.start(i);
		}
		return (total > 30);
	}
	this.init();

}

musicplayer = new MusicPlayer();