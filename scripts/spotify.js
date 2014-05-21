function Spotify(){

	this.createTrackset = function(listname, trackurls, cbk){
		url="spotify:trackset:"+listname+":";
		for(var i=0; i < trackurls.length; i++){
			var trackurl = trackurls[i];
			var trackid = trackurl.split(":")[2];
		}
		$.get(
			url,
			function(data) {
			   cbk(data);
			}
		);
	}
	this.openTrack = function(listname, trackurl, cbk){
		$.get(
			trackurl,
			function(data) {
			   cbk(data);
			}
		);
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