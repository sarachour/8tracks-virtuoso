function Spotify(){

	this.createTrackset = function(listname, trackurls, cbk){
		if(trackurls.length == 0) return;
		var trackurl = trackurls[0];
		var trackid = trackurl.split(":")[2];
		url="spotify:trackset:"+listname+":"+trackid;

		for(var i=1; i < trackurls.length; i++){
			var trackurl = trackurls[i];
			var trackid = trackurl.split(":")[2];
			url += ","+trackid;
		}
		var that = this;
		console.log("open: "+url)
		
		chrome.tabs.create({url: url, selected: false}, function(tab){
			var opentab = tab.id;
			setTimeout(function(){
				chrome.tabs.remove(opentab, function(){})
			}, 1000)
		}); 


		
	}
	this.openTrack = function(listname, trackurl, cbk){
		var win = window.open($(this).data('mailto'));
		/*
		$.get(
			trackurl,
			function(data) {
			   cbk(data);
			}
		);
*/
	}
	this.search = function(artist, name, cbk){
		url="http://ws.spotify.com/search/1/track.json"
		//query="track:"+name+"+artist:"+artist
		query=name+" "+artist
		$.get(
			url,
			{q : query},
			function(data) {
			   cbk(data);
			}
		);
	}



}