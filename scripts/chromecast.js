


ChromeCaster = function(){
	this.init_api = function() {
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
	  }
	  var onError = function(e){
	  	console.log("ERROR ",e)
	  }
      applicationID = "37B7F2AC";
	  var sessionRequest = new chrome.cast.SessionRequest(applicationID);
	  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
	    sessionListener,
	    receiverListener);
	  chrome.cast.initialize(apiConfig, onInitSuccess, onError);
	};
	this.load = function(){
		var onRequestSessionSuccess = function(e) {
		      session = e;
		      console.log("success ",e);
		 }
		 var onLaunchError = function(e) {
		      console.log("error ",e);
		 }
		chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);		
	}


}

chromeCaster = new ChromeCaster();
