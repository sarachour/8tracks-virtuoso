
//curl --header "X-Api-Key=c7a7a9bf65499f2adb75cc9620ad7364106b86fa" http://8tracks.com/mixes.xml
//curl http://8tracks.com/mixes/1.json?api_key=1234567890
function Scrobbler(){
	
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
	this.getMix = function(id, cbk){
		that = this;
		url = "http://8tracks.com/dp/"+id+".json"
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
	this.playMix = function(mix_id, cbk){
			that = this;
			if(this.isUndefined(this.user_token)){
				console.log("ERROR: no user token.");
				return;
			}
			if(this.isUndefined(this.play_token)){
				console.log("ERROR: no play token.");
				return;
			}
			
			this.getMix(mix_id, function(mixdata){
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
	this.nextTrack = function(cbk){
		url = "http://8tracks.com/sets/"+this.play_token+"/next.json"
		that = this;
		$.get(
			url,
			{
			api_key : that.API_KEY,
			user_token : that.user_token,
			api_version: 3,
			mix_id: that.play_mix.id},
			function(data) {
				cbk(data);
			}
		);	

	}
	this.skipTrack = function(cbk){
		url = "http://8tracks.com/sets/"+this.play_token+"/skip.json"
		that = this;
		$.get(
			url,
			{
			api_key : that.API_KEY,
			user_token : that.user_token,
			api_version: 3,
			mix_id: that.play_mix.id},
			function(data) {
				cbk(data);
			}
		);	

	}
	this.init();

}
scrobbler = new Scrobbler();
