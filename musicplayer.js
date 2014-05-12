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
		console.log("attempting track info+"+ this.mix_info + ", " +this.track_info);
		data = {};
		if(this.mix_info == null || this.track_info == null){
			return data;
		}
		console.log("getting track info");
		//console.log(this.mix_info);
		//console.log(this.track_info);
		data.mix_name = this.mix_info.name;
		data.mix_cover = this.mix_info.cover_urls.sq250;
		data.track_name = this.track_info.name;
		data.track_artist = this.track_info.performer;
		data.track_album = this.track_info.release_name;
		console.log(data);
		return data;
	}
	this.login = function(uname, pass){
		scrobbler.login(uname, pass, function(data){
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
		scrobbler.createPlaybackStream(function(data){
			console.log("created playback stream.");
		});
		scrobbler.playMix(mixname, function(mixdata, data){
			mplayer.mix_info = mixdata.mix;
			mplayer.track_info = data.set.track;
			mplayer.play(data.set.track.track_file_stream_url);
		});
	}
	this.resume = function(){
		this.player.play();
	}
	this.pause = function(){
		this.player.pause();
	}
	this.nextTrack = function(){
		that = this;
		scrobbler.nextTrack(function(data){
			that.play(data.trackinfo.track_file_stream_url )
		});
	}
	this.init();

}

musicplayer = new MusicPlayer();