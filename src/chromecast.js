

DummyChromeCaster = function(){
	this.init = function(){

	}
	this.init_api = function(){

	}
	this.load = function(){

	}
	this.play = function(){

	}
}
RealChromeCaster = function(){
	this.init = function(){
		this.initialized = false;
		this.loaded = false;
	}
	this.init_api = function(cbk) {
	  var that = this;
	  //are there any devices avaliable
	  var receiverListener = function(e) {
		  if( e === chrome.cast.ReceiverAvailability.AVAILABLE) {
		  	console.log("RECIEVELISTENER: available");
		  	if(cbk != undefined) {
		  		cbk();
		  	}
		  }
		}
	  //we were able to establish a connection.
	  var sessionListener = function(e) {
		  that.session = e;
		  console.log("SESSION LISTENER: found");
		  if (session.media.length != 0) {
		    onMediaDiscovered('onRequestSessionSuccess', session.media[0]);
		  }
		}
	  var onInitSuccess = function(e){
	  	console.log("INIT: Success ");
	  	that.initialized = true;
	  }
	  var onError = function(e){
	  	console.log("INIT: Failure")
	  	that.initialized = false;
	  }
      var applicationID = "37B7F2AC";
	  var sessionRequest = new chrome.cast.SessionRequest(applicationID);
	  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
	    sessionListener,
	    receiverListener);
	  chrome.cast.initialize(apiConfig, onInitSuccess, onError);
	};
	this.load = function(cbk){
		var that = this;
		var onRequestSessionSuccess = function(e) {
		      that.session = e;
		      console.log("session success ",e);
		      that.loaded = true;
		      if(cbk != undefined) cbk();
		 }
		 var onLaunchError = function(e) {
		 	 that.loaded = false;
		     console.log("session error ",e);
		 }
		 var loadReceiver = function(){
		 		console.log("SESSION-REQUEST: opening");
		 		chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
		 }
		 if(this.initialized){
		 	console.log("loading reciever");
			loadReceiver();
		}
		 else{
		 	console.log("loading receiver and initializing api");
		 	that.init_api(loadReceiver)	
		 }	
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
ChromeCaster = DummyChromeCaster
chromeCaster = new ChromeCaster();
