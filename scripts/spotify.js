function Spotify(){

	this.search = function(artist, name, cbk){
		url="http://ws.spotify.com/search/1/track.json"
		$.get(
			url,
			{q : name+" "+artist},
			function(data) {
			   cbk(data);
			}
		);
	}



}