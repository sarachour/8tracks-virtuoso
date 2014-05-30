function UserInterface(){
	this.init = function(){
		this.timer = null;
		if(localStorage.hasOwnProperty("ui_openTab"))
			this.openTab = parseInt(localStorage.ui_openTab);
		else this.openTab = null;
		console.log(this.openTab);
	}
	this.sync = function(){
		function setMix(name, artist){
			eightTracks.getMixByName(artist, name, function(data){
				console.log(data);
				var id = data.mix.id;
				var smartid = "similar:"+id;
				chrome.extension.sendMessage({action: "play", id: id, smart_id: smartid});
			})
		}
		chrome.tabs.getSelected(null,function(tab) {
		    var tablink = tab.url;
		    if(tablink.indexOf("8tracks.com") > -1){
		    	tabarr = tablink.split("/");
		    	mixname = tabarr[tabarr.length-1];
		    	artistname = tabarr[tabarr.length-2];
		    	setMix(mixname, artistname);
		    	return;
		    }
		    chrome.tabs.getAllInWindow(undefined, function(tabs) { 
				for(var i=0; i < tabs.length; i++){
					tab = tabs[i];
					var tablink = tab.url;
				    if(tablink.indexOf("8tracks.com") > -1){
				    	tabarr = tablink.split("/");
				    	mixname = tabarr[tabarr.length-1];
				    	artistname = tabarr[tabarr.length-2];
				    	setMix(mixname, artistname);
				    	return;
				    }
				}

			});
		});

		
	}
	//var RTM_URL_RE_ = /http?\:\/\/www.8tracks.com\//; 

	this.getMixesInfo = function(mixinfo, callback){
		var i=0; max=0;
		var info = [];
		console.log("mixes inf")
		for(var key in mixes){
			var mix = mixes[key];
			max++;
			console.log("getting: "+mix.name);
			eightTracks.getMix(mix.name, mix.artist, function(data){
				console.log(data);
				if(data.hasOwnProperty("mix")){
					info.push(data.mix);
				}
				if(i == max-1){
					callback(info);
				}
				i++;
			});
		} 
	}
	this.findOpenMixes = function(callback){
		mixes = {};
		var that = this;
		chrome.tabs.getAllInWindow(undefined, function(tabs) { 
			for (var i = 0; i < tabs.length; i++) { 
				tab = tabs[i];
				tablink = tab.url;
				if (tablink && tablink.indexOf("8tracks.com") > -1) { 

					tabarr = tablink.split("/");
			    	mixname = tabarr[tabarr.length-1];
			    	artistname = tabarr[tabarr.length-2];
			    	mixes[mixname + ":"+ artistname] = {name: mixname, artist: artistname};
				} 
			}
			console.log(mixes);
			that.getMixesInfo(mixes, function(data){
				console.log("FINAL DATA.");
				console.log(data);
				for(var i=0; i < data.length && i < 10; i++){
					var tile_name = "#tile_"+(i+1);
					var mix = data[i];
					console.log(tile_name);
					$(tile_name).attr("src", mix.cover_urls.sq56);
					$(tile_name).click(function(){
						console.log(mix.id);
					}).data("mix-id",mix.id)
				}
			})
			
			//retrieve album art
			
		})
		//get all info
	}
	this.findSimilarMixes = function(){

	}

	this.openURL = function(newurl){
		var findid = this.openTab;
		if(findid == null){
			chrome.tabs.create({url: newurl}, function(tab){
				this.openTab = tab.id;
				localStorage.ui_openTab= this.openTab;
			});
			return;
		}
		chrome.tabs.get(findid, function(tab){
			if(tab != undefined){
				chrome.tabs.update(tab.id, {url: newurl, selected: true}); 
				return;
			}
			else{
				chrome.tabs.create({url: newurl}, function(tab){
				this.openTab = tab.id;
				localStorage.ui_openTab= this.openTab;
			}); 
				return;
			}
		})
		
	}

	function pad(a,b){return(1e15+a+"").slice(-b)}
	this.updateTime = function(data){
		var tdiff = data.track_duration - data.track_time;
		var tfrac = data.track_time/data.track_duration*100.0;
		$("#player_prog_slider").val(tfrac);
		time_string = Math.floor(tdiff/60) + ":" + pad(Math.floor(tdiff%60),2) 
		$("#player_prog_duration").html(time_string);
	}
	this.updateView = function(){
		var that = this;
		chrome.extension.sendMessage({action: "get-track-info"}, function(data){
			console.log("update view");
	    	$("#mix-title").html(data.mix_name);
			$("#track-title").html(data.track_name);
			$("#track-artist").html(data.track_artist);

			$("#mix-tags").html(data.mix_tag_list);
			$("#mix-likes").html(data.mix_likes_count);
			$("#mix-plays").html(data.mix_plays_count);
			$("#mix-tracks").html(data.mix_tracks_count);
			$("#mix-description").html(data.mix_description);

			$( "#albumart" ).attr( "src", data.mix_cover );
			$("#player_volume_slider").slider('value', data.player_volume*100.0);
			
			if(data.hasOwnProperty("track_time")){
				that.updateTime(data);
			}
			
			if(data.skip_ok){
				$("#player_skip").attr("src", "images/ffwd.png");
				$("#player_skip").click(function(){
			    	chrome.extension.sendMessage({action: "skip"})
			    })
			}
			else{
				$("#player_skip").attr("src", "images/ffwd-disable.png");
				$("#player_skip").click(function(){})
			}
			if(data.is_paused){
	    		$("#player_play").removeClass("playing");
	    		$("#player_play").attr("src", "images/play.png");
	    	}
	    	else{
	    		$("#player_play").addClass("playing");
	    		$("#player_play").attr("src", "images/pause.png");
	    	}
	    	if(data.track_favorite){
	    		$("#player_star_track").addClass("favorite");
	    		$("#player_star_track").attr("src", "images/star-on.png");
	    	}
	    	else{
	    		$("#player_star_track").removeClass("favorite");
	    		$("#player_star_track").attr("src", "images/star.png");
	    	}
	    	if(data.mix_like){
	    		$("#player_like_mix").addClass("like");
	    		$("#player_like_mix").attr("src", "images/heart-on.png");
	    	}
	    	else{
	    		$("#player_like_mix").removeClass("like");
	    		$("#player_like_mix").attr("src", "images/heart.png");
	    	}
	    	$("#player_goto").click(function(){
	    		that.openURL(data.mix_url);
	    	})
	    	$("#player_purchase").click(function(){
	    		that.openURL(data.track_buy);
	    	})
	    	if(data.mix_rank == "gold"){
	    		$("#mix_rank").attr("src", "images/gold.png");
	    	}
	    	else if(data.mix_rank == "silver"){
	    		$("#mix_rank").attr("src", "images/silver.png");
	    	}
	    	else if(data.mix_rank == "bronze"){
	    		$("#mix_rank").attr("src", "images/bronze.png");
	    	}
			if(!data.hasOwnProperty("mix_name")){
				//autoload
				that.sync();
			}
	    });
	    if(this.timer == null){
	    	var that = this;
			this.timer = window.setInterval(function(){
				chrome.extension.sendMessage({action: "get-track-info"}, function(data){
					console.log(data);
					that.updateTime(data);
			    });
			}, 1000);
		}
	}
	this.init();
}
userInterface = new UserInterface();
