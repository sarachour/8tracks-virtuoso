function LastFM()	{
	this.isUndefined = function(x){return (x == undefined);}

	this.init = function(){
		this.api_key = "667a40643c70595f0ba14ba570508668"
		this.secret = "65ada44426c3182dd33ecbac4aae7b44"
		this.token = null;
		this.session_key = null;
		if(!this.isUndefined(localStorage["LASTFM_SESSION_KEY"])){
			this.session_key = localStorage["LASTFM_SESSION_KEY"];
		}


	}

	this.gen_sig = function(args){
		var s = "";
		var sargs = Object.keys(args).sort();
		for(var i=0; i < sargs.length; i++){
			var key = sargs[i];
			s += key+args[key];
		}
		s += this.secret;
		var hash= CryptoJS.MD5(s).toString(CryptoJS.enc.Hex);
		return hash;
	}
	this._permission = function(cbk){
		if(this.token == null) return;
		var url="http://www.last.fm/api/auth?";
		var args={
			api_key: this.api_key,
			token: this.token
		}
		args.api_sig = this.gen_sig(args);
		for(var arg in args){
			url += arg + "=" + args[arg]+"&";
		}
		var that = this;
		chrome.tabs.create({
			active:true,
			url: url
		},
		function(tab){
			if(cbk != undefined) cbk(tab);
		});	
	}
	this._auth = function(cbk){
		var that = this;
		var url = "https://ws.audioscrobbler.com/2.0/"
		var args = {
				method:"auth.getToken",
				api_key: this.api_key,
				format: "json"
		}
		args.api_sig = this.gen_sig(args);
		
		$.get(
			url,
			args,
			function(data){
				that.token = data.token;
				if(cbk != undefined) cbk(data);
			})

	}
	this.isLoggedIn = function(){
		if(this.session_key != null){
			return true;
		}
		else{
			return false;
		}
	}
	this.session = function(cbk){
		if(this.token == null) return;
		var that = this;

		var url = "https://ws.audioscrobbler.com/2.0/"
		//must be alphabetized
		var args = {
				api_key: this.api_key,
				method:"auth.getSession",
				token: this.token
		}
		args.api_sig = this.gen_sig(args);
	
		$.get(
			url,
			args,
			function(data){
				that.user_name = data.getElementsByTagName("name")[0].innerHTML;
				that.session_key = data.getElementsByTagName("key")[0].innerHTML;
				localStorage["LASTFM_SESSION_KEY"] = that.session_key;
				console.log(data);
				if(cbk != undefined) cbk(data);
			})
		.fail(function(e){ 
			console.log(e);
			if(cbk != undefined) cbk(null, e);
		});	

	}
	this.auth = function(){
		var that = this;
		this._auth(function(){
			that._permission(function(){
				console.log("opened permission.");
			})
		});
	}
    this.scrobble = function(track, artist){
		//http://www.last.fm/api/show/track.love
		if(this.session_key == null) return;
		var time = Math.round(Date.now()/1000);
		console.log(time);
		//var url = "http://www.last.fm/api/show/track.love"
		var url = "https://ws.audioscrobbler.com/2.0/"
		var args = {
			method: "track.scrobble",
			artist: artist,
			track: track,
			timestamp: time,
			api_key: this.api_key,
			sk: this.session_key
		}
		args.api_sig = this.gen_sig(args);
		var that = this;
		$.post(
			url,
			args,
			function(data){
				console.log(data);
				that.data = data;
			})
	}
    this.unlove = function(track, artist){
		//http://www.last.fm/api/show/track.love
		if(this.session_key == null) return;
		//var url = "http://www.last.fm/api/show/track.love"
		var url = "https://ws.audioscrobbler.com/2.0/"
		var args = {
			method: "track.unlove",
			artist: artist,
			track: track,
			api_key: this.api_key,
			sk: this.session_key
		}
		args.api_sig = this.gen_sig(args);
		var that = this;
		$.post(
			url,
			args,
			function(data){
				console.log(data);
				that.data = data;
			})
	}
	this.love = function(track, artist){
		//http://www.last.fm/api/show/track.love
		if(this.session_key == null) return;
		//var url = "http://www.last.fm/api/show/track.love"
		var url = "https://ws.audioscrobbler.com/2.0/"
		var args = {
			method: "track.love",
			artist: artist,
			track: track,
			api_key: this.api_key,
			sk: this.session_key
		}
		args.api_sig = this.gen_sig(args);
		var that = this;
		$.post(
			url,
			args,
			function(data){
				console.log(data);
				that.data = data;
			})
	}
	this.init();

}

var lastFm = new LastFM();