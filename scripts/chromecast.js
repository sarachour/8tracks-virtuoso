


ChromeCaster = function(){
	this.init = function(){
		this.initialized = false;
		this.loaded = false;
	}
	this.init_api = function(cbk) {
	  var that = this;
	  //are there any devices avaliable
	  var receiverListener = function(e) {
		  if( e === chrome.cast.ReceiverAvailability.AVAILABLE) {
		  	console.log(e, " AVAILABLE");
		  }
		}
	  //we were able to establish a connection.
	  var sessionListener = function(e) {
		  session = e;
		  if (session.media.length != 0) {
		    onMediaDiscovered('onRequestSessionSuccess', session.media[0]);
		  }
		  console.log("SESSION",e);
		}
	  var onInitSuccess = function(e){
	  	console.log("SUCCESS ",e);
	  	that.initialized = true;
	  	if(cbk != undefined) 
	  		cbk();
	  }
	  var onError = function(e){
	  	console.log("ERROR ",e)
	  	that.initialized = false;
	  }
      applicationID = "37B7F2AC";
	  var sessionRequest = new chrome.cast.SessionRequest(applicationID);
	  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
	    sessionListener,
	    receiverListener);
	  chrome.cast.initialize(apiConfig, onInitSuccess, onError);
	};
	this.load = function(cbk){
		var that = this;
		var onRequestSessionSuccess = function(e) {
		      session = e;
		      console.log("success ",e);
		      that.loaded = true;
		      if(cbk != undefined) cbk();
		 }
		 var onLaunchError = function(e) {
		 	 that.loaded = false;
		      console.log("error ",e);
		 }
		 var loadReceiver = function(){
		 		chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
		 }
		 if(this.initialized)
			loadReceiver();
		 else
		 	that.init_api(loadReceiver)		
	}
	this.play = function(info){
		var that = this;
		var play_track = function(){
			console.log("play",info);
		}
		if(this.loaded){
			play_track();
		}
		else{
			that.load(play_track);
		}
	}
	this.init();

}

chromeCaster = new ChromeCaster();
