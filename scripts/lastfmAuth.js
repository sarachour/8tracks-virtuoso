
chrome.extension.sendMessage({
		action: "login", 
		type: "lastfm",
		stage: "session"
	}, 
	function(d, e){
		alert("logged in")
		console.log(d,e);
	}
);