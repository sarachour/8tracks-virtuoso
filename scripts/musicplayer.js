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
	    this.playlist = new Playlist();
	    var that = this;
	    eightTracks.createPlaybackStream(function(data){
			console.log("created playback stream.");
		});
		chrome.extension.onMessage.addListener(
		function(request, sender, sendResponse) {
		  if(request.action == "mix"){
		  		that.mix(request.name, request.artist);
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
		  }
		  else if(request.action == "playlist-text"){
		  	sendResponse({"playlist": that.playlist.getPlain()});
		  }
		  else if(request.action == "playlist-spotify"){
		  	sendResponse({"playlist": that.playlist.getSpotify()});
		  }
		});
		this.player.bind("ended", function () {
	        that.nextTrack();
	    });
	}
	this.getTrackInfo = function(){
		data = {};
		if(this.mix_info == null || this.track_info == null){
			return data;
		}
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
		this.playlist.reload();
	}
	this.play = function(src){
		this.player.attr("src", src);
		$("#player").trigger("play");
		//$("#player").play();
		//this.player.play();
	}
	this.ADD_TRACK_TO_PLAYLIST = function(){
		this.playlist.add(this.track_info.performer, this.track_info.name, this.track_info.faved_by_current_user);
	}
	this.SET_TRACK_INFO = function(data){
		this.track_info = data.set.track;
		this.other_info = {
			isBeginning: data.set.at_beginning,
			isEnd: data.set.at_end,
			isLastTrack: data.set.at_last_track,
			isSkipOk: data.set.skip_allowed,
		};
		this.play(this.track_info.track_file_stream_url );
		this.ADD_TRACK_TO_PLAYLIST();
		chrome.extension.sendMessage({action: "update"})
	}
	this.nextMix = function(){
		mplayer = this;

		eightTracks.playNextMix(this.mix_info.id, function(mixdata, data){
			mplayer.mix_info = mixdata.next_mix;
			mplayer.SET_TRACK_INFO(data);
		});
	}
	this.mix = function(mixname, mixartist){
		mplayer = this;
		eightTracks.playMix(mixname, mixartist, function(mixdata, data){
			mplayer.mix_info = mixdata.mix;
			mplayer.SET_TRACK_INFO(data);
		});
	}
	this.skip = function(){
		eightTracks.skipTrack(this.mix_info.id, function(data){
			mplayer.SET_TRACK_INFO(data);
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
			chrome.extension.sendMessage({action: "update"})
		});
	}
	this.unlikeMix = function(){
		var mplayer = this;
		eightTracks.unlikeMix(mplayer.mix_info.id, function(data){
			mplayer.mix_info.liked_by_current_user = data.mix.liked_by_current_user;
			chrome.extension.sendMessage({action: "update"})
		});
	}
	this.favoriteTrack = function(){
		var mplayer = this;
		eightTracks.favoriteTrack(mplayer.track_info.id, function(data){
			mplayer.track_info.faved_by_current_user = data.track.faved_by_current_user;
			mplayer.ADD_TRACK_TO_PLAYLIST();
			chrome.extension.sendMessage({action: "update"})

		})
	}
	this.unfavoriteTrack = function(){
		var mplayer = this;
		eightTracks.unfavoriteTrack(mplayer.track_info.id, function(data){
			mplayer.track_info.faved_by_current_user = data.track.faved_by_current_user;
			mplayer.ADD_TRACK_TO_PLAYLIST();
			chrome.extension.sendMessage({action: "update"})

		})
	}
	this.nextTrack = function(){
		var mplayer = this;
		if(this.isWellPlayed()){
			//report if song has been played
			eightTracks.report(this.mix_info.id, this.track_info.id);
		}
		if(this.other_info.isEnd == true || this.other_info.isLastTrack == true){
			eightTracks.playNextMix(this.mix_info.id, function(mixdata, data){
				mplayer.mix_info = mixdata.next_mix;
				mplayer.SET_TRACK_INFO(data);
			});
		}
		else{
			eightTracks.nextTrack(this.mix_info.id, function(data){
				if(data == null){
					eightTracks.playNextMix(mplayer.mix_info.id, function(mixdata, data){
						mplayer.mix_info = mixdata.next_mix;
						mplayer.SET_TRACK_INFO(data);
					});
				}
				else{
					mplayer.SET_TRACK_INFO(data);
				}
			});
		}
		
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