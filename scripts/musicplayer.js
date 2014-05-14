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
	    mthat = this;
		chrome.extension.onMessage.addListener(
		function(request, sender, sendResponse) {
		  if(request.action == "mix"){
		  		mthat.mix(request.name, request.artist);
		  }
		  else if(request.action == "login"){
		  		mthat.login(request.username, request.password);
		  }
		  else if(request.action == "resume"){
		  		mthat.resume();
		  }
		  else if(request.action == "pause"){
		  		mthat.pause();
		  }
		  else if(request.action == "next-mix"){
		  		mthat.nextMix();
		  }
		  else if(request.action == "skip"){
		  		mthat.skip();
		  }
		  else if(request.action == "set-time"){
		  		mthat.setTime(request.percent);
		  }
		  else if(request.action == "get-track-info"){
		  		sendResponse(mthat.getTrackInfo());
		  }
		  else if(request.action == "like-mix"){
		  		mthat.likeMix();
		  }
		  else if(request.action == "unlike-mix"){
		  		mthat.unlikeMix();
		  }
		  else if(request.action == "favorite-track"){
		  		mthat.favoriteTrack();
		  }
		  else if(request.action == "unfavorite-track"){
		  		mthat.unfavoriteTrack();
		  }
		});
		this.player.bind("ended", function () {
	        mthat.nextTrack();
	    });
		console.log("init");
	}
	this.getTrackInfo = function(){
		data = {};
		if(this.mix_info == null || this.track_info == null){
			return data;
		}
		console.log(this.mix_info);
		console.log(this.track_info);
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
		data.skip_ok = this.other_info.skip_ok;
		data.is_paused = this.is_paused;
		//data.player = this.player;
		return data;
	}
	this.login = function(uname, pass){
		eightTracks.login(uname, pass, function(data){
			console.log("logged in");
			console.log(data);
		});
	}
	this.play = function(src){
		this.player.attr("src", src);
		$("#player").trigger("play");
		//$("#player").play();
		//this.player.play();
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
		this.playlist.add(this.track_info.performer, this.track_info.name);
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
		eightTracks.createPlaybackStream(function(data){
			console.log("created playback stream.");
		});
		eightTracks.playMix(mixname, mixartist, function(mixdata, data){
			mplayer.mix_info = mixdata.mix;
			mplayer.SET_TRACK_INFO(data);
		});
	}
	this.skip = function(){
		console.log("skipping");
		eightTracks.skipTrack(this.mix_info.id, function(){
			mplayer.SET_TRACK_INFO(data);
		});
	}
	this.resume = function(){
		console.log("playing");
		this.player.trigger("play");
		this.is_paused = false;
	}
	this.pause = function(){
		console.log("pausing");
		this.player.trigger("pause");
		this.is_paused = true;
	}
	this.likeMix = function(){
		mplayer = this;
		eightTracks.likeMix(mplayer.mix_info.id, function(data){
			mplayer.mix_info.liked_by_current_user = data.mix.liked_by_current_user;
			chrome.extension.sendMessage({action: "update"})
		});
	}
	this.unlikeMix = function(){
		mplayer = this;
		eightTracks.unlikeMix(mplayer.mix_info.id, function(data){
			mplayer.mix_info.liked_by_current_user = data.mix.liked_by_current_user;
			chrome.extension.sendMessage({action: "update"})
		});
	}
	this.favoriteTrack = function(){
		mplayer = this;
		eightTracks.favoriteTrack(mplayer.track_info.id, function(data){
			mplayer.track_info.faved_by_current_user = data.track.faved_by_current_user;
			chrome.extension.sendMessage({action: "update"})

		})
	}
	this.unfavoriteTrack = function(){
		mplayer = this;
		eightTracks.unfavoriteTrack(mplayer.track_info.id, function(data){
			mplayer.track_info.faved_by_current_user = data.track.faved_by_current_user;
			chrome.extension.sendMessage({action: "update"})

		})
	}
	this.nextTrack = function(){
		mplayer = this;
		console.log(this.mix_info);
		if(this.other_info.isEnd == true || this.other_info.isLastTrack == true){
			eightTracks.playNextMix(this.mix_info.id, function(mixdata, data){
				mplayer.mix_info = mixdata.next_mix;
				mplayer.SET_TRACK_INFO(data);
			});
		}
		else{
			eightTracks.nextTrack(this.mix_info.id, function(data){
				mplayer.SET_TRACK_INFO(data);
			});
		}
		
	}
	this.setTime = function(pct){
		newtime = pct*parseFloat(this.player[0].duration);
		this.pause();
		this.player[0].currentTime = newtime
		this.resume();
	}
	this.init();

}

musicplayer = new MusicPlayer();