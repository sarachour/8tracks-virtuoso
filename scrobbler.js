
//curl --header "X-Api-Key=c7a7a9bf65499f2adb75cc9620ad7364106b86fa" http://8tracks.com/mixes.xml
//curl http://8tracks.com/mixes/1.json?api_key=1234567890
function Scrobbler(){
	this.API_KEY = "5f1ed8e86c7f6792bdd581ce587e996ce8b00ae2"
	this.play_token = localStorage["play_token"]
	this.user_token = localStorage["user_token"]
	this.play_mix = localStorage.play_mix;

	console.log(this.play_mix);
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
		console.log("testing request");
		that = this;
		if(this.user_token !== undefined){
			console.log("login token exists from storage");
			return;
		}
		$.post(
			"https://8tracks.com/sessions.json",
			{api_key : that.API_KEY,
			 login : uname,
			 password: pass,
			 api_version: 3},
			function(data, status) {
			   that.user_token = data.user_token;
			   localStorage["user_token"] = that.user_token;
			   cbk(data);
			   
			}
		);
	}
	this.createPlaybackStream = function(cbk){
		url = "http://8tracks.com/sets/new.json"
		that = this;
		if(this.play_token !== undefined){
			console.log("play token exists in storage");
			return;
		}
		$.get(
			url,
			{
			api_key : this.API_KEY,
			user_token : this.user_token,
			api_version: 3},
			function(data){
				that.play_token = data.play_token;
				localStorage["play_token"] = that.play_token;
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
			
			this.getMix(mix_id, function(data){
				url = "http://8tracks.com/sets/"+that.play_token+"/play.json"
				that.play_mix = {};
				that.play_mix.name = data.mix.name;
				that.play_mix.id = data.mix.id;
				that.play_mix.cover = data.mix.cover_urls.sq100;
				localStorage["play_mix"] = that.play_mix;
				$.get(
					url,
					{
					api_key : that.API_KEY,
					user_token : that.user_token,
					api_version: 3,
					mix_id: data.mix.id},
					function(data) {
					   cbk(data);

					}
				);	
			})
			
	}

}
scrobbler = new Scrobbler();
