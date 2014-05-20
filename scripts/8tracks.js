
//curl --header "X-Api-Key=c7a7a9bf65499f2adb75cc9620ad7364106b86fa" http://8tracks.com/mixes.xml
//curl http://8tracks.com/mixes/1.json?api_key=1234567890
function EightTracks(){
	
	this.init = function(){
		this.API_KEY = "5f1ed8e86c7f6792bdd581ce587e996ce8b00ae2"
		//this.play_token = localStorage.play_token
		this.user_token = localStorage.user_token
	}
	this.reload = function(){
		this.user_token = localStorage.user_token
	}
	this.isUndefined = function(x){return (x == undefined);}

	this.login = function(uname, pass, cbk){
		sthat = this;
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
	this.createPlaybackStream = function(cbk, forceCreate){
		url = "http://8tracks.com/sets/new.json"
		var that = this;
		/*
		if(!this.isUndefined(this.play_token)){
			console.log("play token exists in storage");
			return;
		}
		*/
		$.get(
			url,
			{
			api_key : that.API_KEY,
			user_token : that.user_token,
			api_version: 3
		},
				function(data){
					that.play_token = data.play_token;
					//localStorage.play_token = data.play_token;
					console.log(that.play_token);
					cbk(data);
				}
			)
	}
	this.getMix = function(id, artist, cbk){
		var that = this;
		url = "http://8tracks.com/"+artist+"/"+id+".json"
		$.get(
			url,
			{
			api_key : that.API_KEY,
			user_token : that.user_token,
			api_version: 3},
			function(data) {
			   cbk(data);
			}
		).fail(function(){ 
  			cbk({});
		});;	
		
	}
	this.getNextMix = function(id, cbk){
		var that= this;
		//http://8tracks.com/sets/111696185/next_mix.xml?mix_id=14
		if(!this.check()){
			return;
		}
		url = "http://8tracks.com/sets/"+this.play_token+"/next_mix.json";
		$.get(
			url,
			{
			api_key : that.API_KEY,
			user_token : that.user_token,
			mix_id:id,
			api_version: 3},
			function(data) {
			   cbk(data);
			}
		);	

	}
	this.check = function(){
		if(this.isUndefined(this.user_token)){
			console.log("ERROR: no user token.");
			return false;
			
		}
		if(this.isUndefined(this.play_token)){
			console.log("ERROR: no play token.");
			return false;
		}
		return true;
	}
	this.playNextMix = function(mid, cbk){
			var that = this;
			if(!this.check()){
				return;
			}
			
			this.getNextMix(mid, function(mixdata){
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
			});
		
	}
	this.playMix = function(mix_name, mix_artist, cbk){
			var that = this;
			if(!this.check()){
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
	this.report = function(mid, tid){
		var that = this;
		var rurl = "http://8tracks.com/sets/"+this.play_token+"/next.json"
		if(!this.check()){
			return;
		}
		$.get(
			rurl,
			{
			api_key : that.API_KEY,
			user_token : that.user_token,
			api_version: 3,
			mix_id: mid,
			track_id: tid},
			function(data) {
				
			}
		).fail(function(){ 
  			cbk(null);
		});	
	}
	this.nextTrack = function(mid, cbk){
		url = "http://8tracks.com/sets/"+this.play_token+"/next.json"
		var that = this;
		if(!this.check()){
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
		).fail(function(){ 
  			cbk(null);
		});	
		
		//TODO report
		//http://8tracks.com/sets/111696185/report.json?track_id=[track_id]&mix_id=[mix_id]

	}
	this.skipTrack = function(mixid, cbk){
		url = "http://8tracks.com/sets/"+this.play_token+"/skip.json"
		var that = this;
		if(!this.check()){
			return;
		}
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
		).fail(function(){ 
  			cbk(null);
		});	

	}
	this._likeMix = function(islike, mixid, cbk){
		if(islike)
			url = "http://8tracks.com/mixes/"+mixid+"/like.json"
		else
			url = "http://8tracks.com/mixes/"+mixid+"/unlike.json"
		var that = this;
		if(!this.check()){
			return;
		}
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
		var that = this;
		if(!this.check()){
			return;
		}
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
