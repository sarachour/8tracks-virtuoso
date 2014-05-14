
//curl --header "X-Api-Key=c7a7a9bf65499f2adb75cc9620ad7364106b86fa" http://8tracks.com/mixes.xml
//curl http://8tracks.com/mixes/1.json?api_key=1234567890
function EightTracks(){
	
	this.init = function(){
		this.API_KEY = "5f1ed8e86c7f6792bdd581ce587e996ce8b00ae2"
		this.play_token = localStorage.play_token
		this.user_token = localStorage.user_token
		console.log("init")
		console.log(localStorage)
	}
	this.isUndefined = function(x){return (x == undefined);}
	this.test = function(cbk){
		url = "http://8tracks.com/mixes.xml";
		console.log("testing");
		$.get(
			"http://8tracks.com/mixes.xml",
			{api_key : this.API_KEY},
			function(data) {
			   cbk(data);
			}
		);	
	}
	this.login = function(uname, pass, cbk){
		sthat = this;
		if(!this.isUndefined(this.user_token)){
			console.log("login token exists from storage");
			return;
		}
		$.post(
			"https://8tracks.com/sessions.json",
			{api_key : sthat.API_KEY,
			 login : uname,
			 password: pass,
			 api_version: 3},
			function(data, status) {
			   	sthat.user_token = data.user.user_token;
			   	localStorage.user_token = data.user.user_token;
			   	cbk(data);
			   
			}
		);
	}
	this.createPlaybackStream = function(cbk){
		url = "http://8tracks.com/sets/new.json"
		sthat = this;
		if(!this.isUndefined(this.play_token)){
			console.log("play token exists in storage");
			return;
		}
		$.get(
			url,
			{
			api_key : sthat.API_KEY,
			user_token : sthat.user_token,
			api_version: 3},
				function(data){
					sthat.play_token = data.play_token;
					localStorage.play_token = data.play_token;
					cbk(data);
				}
			)
	}
	this.getMix = function(id, artist, cbk){
		that = this;
		url = "http://8tracks.com/"+artist+"/"+id+".json"
		$.get(
			url,
			{
			api_key : that.API_KEY,
			api_version: 3},
			function(data) {
			   cbk(data);
			}
		);	
		
	}
	this.getNextMix = function(id, cbk){
		//http://8tracks.com/sets/111696185/next_mix.xml?mix_id=14
		url = "http://8tracks.com/sets/"+this.play_token+"/next_mix.json";
		$.get(
			url,
			{
			api_key : that.API_KEY,
			mix_id:id,
			api_version: 3},
			function(data) {
			   cbk(data);
			}
		);	
	}
	this.playNextMix = function(id, cbk){
			that = this;
			if(this.isUndefined(this.user_token)){
				console.log("ERROR: no user token.");
				return;
			}
			if(this.isUndefined(this.play_token)){
				console.log("ERROR: no play token.");
				return;
			}
			
			this.getNextMix(id, function(mixdata){
				url = "http://8tracks.com/sets/"+that.play_token+"/play.json"
				console.log(mixdata)
				$.get(
					url,
					{
					api_key : that.API_KEY,
					user_token : that.user_token,
					api_version: 3,
					mix_id: mixdata.next_mix.id},
					function(data) {
						cbk(mixdata, data);
					}
				);	
			})
	}
	this.playMix = function(mix_name, mix_artist, cbk){
			that = this;
			if(this.isUndefined(this.user_token)){
				console.log("ERROR: no user token.");
				return;
			}
			if(this.isUndefined(this.play_token)){
				console.log("ERROR: no play token.");
				return;
			}
			
			this.getMix(mix_name, mix_artist, function(mixdata){
				url = "http://8tracks.com/sets/"+that.play_token+"/play.json"
				console.log(mixdata.mix)
				$.get(
					url,
					{
					api_key : that.API_KEY,
					user_token : that.user_token,
					api_version: 3,
					mix_id: mixdata.mix.id},
					function(data) {
						cbk(mixdata, data);
					}
				);	
			})
			
	}
	this.nextTrack = function(mid, cbk){
		url = "http://8tracks.com/sets/"+this.play_token+"/next.json"
		that = this;
		if(this.isUndefined(this.user_token)){
			console.log("ERROR: no user token.");
			return;
		}
		if(this.isUndefined(this.play_token)){
			console.log("ERROR: no play token.");
			return;
		}
		$.get(
			url,
			{
			api_key : that.API_KEY,
			user_token : that.user_token,
			api_version: 3,
			mix_id: mid},
			function(data) {
				cbk(data);
			}
		);	

	}
	this.skipTrack = function(mixid, cbk){
		url = "http://8tracks.com/sets/"+this.play_token+"/skip.json"
		that = this;
		$.get(
			url,
			{
			api_key : that.API_KEY,
			user_token : that.user_token,
			api_version: 3,
			mix_id: mixid},
			function(data) {
				cbk(data);
			}
		);	

	}
	this._likeMix = function(islike, mixid, cbk){
		if(islike)
			url = "http://8tracks.com/mixes/"+mixid+"/like.json"
		else
			url = "http://8tracks.com/mixes/"+mixid+"/unlike.json"
		that = this;
		$.get(
			url,
			{
			api_key : that.API_KEY,
			user_token : that.user_token,
			api_version: 3},
			function(data) {
				console.log(data);
				cbk(data);
			}
		);	
	}
	this._favoriteTrack = function(isfav, trackid, cbk){
		if(isfav)
			url = "http://8tracks.com/tracks/"+trackid+"/fav.json"
		else
			url = "http://8tracks.com/tracks/"+trackid+"/unfav.json"
		that = this;
		$.get(
			url,
			{
			api_key : that.API_KEY,
			user_token : that.user_token,
			api_version: 3},
			function(data) {
				console.log(data);
				cbk(data);
			}
		);	
	}
	this.likeMix = function(mixid, cbk){
		this._likeMix(true, mixid, cbk);
	}
	this.unlikeMix = function(mixid, cbk){
		this._likeMix(false, mixid, cbk);
	}
	this.favoriteTrack = function(trackid, cbk){
		this._favoriteTrack(true, trackid, cbk);
	}
	this.unfavoriteTrack = function(trackid, cbk){
		this._favoriteTrack(false, trackid, cbk);
	}
	this.init();

}
eightTracks = new EightTracks();
