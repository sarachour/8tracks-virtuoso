function MusicPlayer(){
	this.init = function(){
		this.player = $('<audio>', {
	      autoPlay : 'autoplay',
	      controls : 'controls'
	    });
	    this.track_info = null;
	    this.mix_info = null;
	    mthat = this;
		chrome.extension.onMessage.addListener(
		function(request, sender, sendResponse) {
		  if(request.action == "mix"){
		  		mthat.mix(request.name);
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
		  else if(request.action == "skip"){
		  		mthat.skip();
		  }
		  else if(request.action == "getTrackInfo"){
		  		sendResponse(mthat.getTrackInfo());
		  }
		});
		this.player.bind("end", function () {
	        alert("song has ended");
	        that.nextTrack();
	    });
		console.log("init");
	}
	this.getTrackInfo = function(){
		data = {};
		if(this.mix_info == null || this.track_info == null){
			return data;
		}
		//console.log(this.mix_info);
		//console.log(this.track_info);
		data.mix_name = this.mix_info.name;
		data.mix_cover = this.mix_info.cover_urls.sq250;
		data.track_name = this.track_info.name;
		data.track_artist = this.track_info.performer;
		data.track_album = this.track_info.release_name;
		data.track_buy = this.track_info.buy_link;
		data.track_favorite = this.track_info.faved_by_current_user;
		data.track_duration = this.player[0].duration;
		data.track_time = this.player[0].track_time;
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
		console.log(src);
		this.player.attr("src", src);
		this.player.load();
		//this.player.play();
	}
	this.mix = function(mixname){
		mplayer = this;
		eightTracks.createPlaybackStream(function(data){
			console.log("created playback stream.");
		});
		eightTracks.playMix(mixname, function(mixdata, data){
			mplayer.mix_info = mixdata.mix;
			mplayer.track_info = data.set.track;
			mplayer.play(data.set.track.track_file_stream_url);
			console.log(mixdata);
			console.log(data);
			console.log(mplayer.player)
			chrome.extension.sendMessage({action: "update"})
		});
	}
	this.resume = function(){
		this.player.play();
		chrome.extension.sendMessage({action: "pause"})
	}
	this.pause = function(){
		this.player.pause();
		chrome.extension.sendMessage({action: "pause"})
	}
	this.nextTrack = function(){
		that = this;
		eightTracks.nextTrack(function(data){
			that.play(data.trackinfo.track_file_stream_url )
		});
	}
	this.init();

}

musicplayer = new MusicPlayer();