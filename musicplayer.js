function MusicPlayer(){
	this.init = function(){
		this.player = document.createElement('audio');
		this.player.setAttribute("preload", "auto");
		this.player.autobuffer = true;

		that = this;
		chrome.extension.onMessage.addListener(
		function(request, sender, sendResponse) {
		  if (request.action == "play"){
		  		that.play(request.source);
		  }
		  else if(request.action == "resume"){
		  		that.resume();
		  }
		  else if(request.action == "pause"){
		  		that.pause();
		  }
		});
		console.log("init");
	}
	this.play = function(src){
		console.log(src);
		this.player.src = src;
		this.player.load;
		this.player.play();
	}
	this.resume = function(){
		this.player.play();
	}
	this.pause = function(){
		this.player.pause();
	}
	this.init();

}

musicplayer = new MusicPlayer();
console.log("created new");