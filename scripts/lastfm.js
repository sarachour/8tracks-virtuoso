function LastFM()	{
	this.init = function(){
		this.api_key = "667a40643c70595f0ba14ba570508668"
		this.secret = "65ada44426c3182dd33ecbac4aae7b44"

	}
	this.login = function(cbk){
		var url="http://www.last.fm/api/auth/"
		var that = this;
		$.get(
			url,
			{
				api_key : that.api_key
			},
			function(data) {
				cbk(data);
			}
		).fail(function(e){ 
			cbk(null, e);
		});		
	}
	this.love = function(track, artist){
		//http://www.last.fm/api/show/track.love
	}
	this.scrobble = function(track, artist){
		//http://www.last.fm/api/show/track.updateNowPlaying
		//http://www.last.fm/api/show/track.scrobble
	}
	this.init();

}