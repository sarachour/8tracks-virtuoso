function Spotify(){
	this.init = function(){
		this.client_id =
		this.oauth = new SpotifyAuth(
			GLOBALS["spotify-api-key"],GLOBALS["spotify-api-secret"],GLOBALS["spotify-scope"]
		);
		this._error_msg = null;
		
	}
	this.login = function(cbk){
		this.oauth.authorize(function(data,status){
			cbk(data,status)
		})
	}

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
		console.log("open: \n"+url)
		
		chrome.tabs.create({url: url, selected: false}, function(tab){
			var opentab = tab.id;
			setTimeout(function(){
				chrome.tabs.remove(opentab, function(){})
			}, 1000)
		}); 


		
	}

	this.openTrack = function(listname, trackurl, cbk){
		var win = window.open($(this).data('mailto'));
		
	}
	this.saveTracks = function(tracks){
			"https://api.spotify.com/v1/me/tracks?ids={ids}"
	}
	this.makePlaylist = function(name,cbk){
		var url = function(userid){
			return "https://api.spotify.com/v1/users/"+userid+"/playlists"
		}
		var args = {
			name:name,
			public:false
		}
		var stargs = JSON.stringify(args)
		if(cbk == undefined){
			cbk = function(){}
		}
		this.oauth.POST_USER(url,stargs,
			function(data){
				console.log(data)
				cbk(data)
			},
			function(err,status){
				console.log(err,status)
				
			})
	}
	this.addTracksToPlaylist = function(playlistid,tracks,cbk){
		var url = function(userid){
			return "https://api.spotify.com/v1/users/"+userid+"/playlists/"+playlistid+"/tracks"
		}
		var args = {
			uris:tracks
		}
		if(cbk == undefined){
			cbk = function(){}
		}
		var sargs = JSON.stringify(args);
		this.oauth.POST_USER(url,sargs,
			function(data){
				console.log(data);
				cbk(data)
			},
			function(errmsg){
				cbk(null,errmsg);
			})
	}
	this.replaceTracksInPlaylist = function(playlistid,tracks,cbk){
		var url = function(userid){
			return "https://api.spotify.com/v1/users/"+userid+"/playlists/"+playlistid+"/tracks"
		}
		var that  =this;
		if(cbk == undefined){
			cbk = function(){}
		}
		var make_args = function(tracks){
			var args = {
					uris:tracks
			}
			return JSON.stringify(args)
		}
		var commit_next = function(data){
			if(data.length > 100){
				var seg = data.splice(0, 100);
				var rest = data;
				that.oauth.PUT_USER(url,make_args(seg), function(){
					commit_next(rest);
				}, 
				function(err){cbk(null,err)})
			}
			else{
				that.oauth.PUT_USER(url,make_args(data),function(data){
					cbk(data)
				},
				function(errmsg){
					cbk(null,errmsg);
				})
			}
		}
		commit_next(tracks)
	}
	this.getTracksInPlaylist = function(playlistid,cbk){
		var url = function(userid){
			return "https://api.spotify.com/v1/users/"+userid+"/playlists/"+playlistid+"/tracks"
		}
		var tracks = [];
		var that  =this;
		var append_next = function(data){
				console.log("response",data);
				tracks = tracks.concat(data.items)
				if(data.next != null){
					that.oauth.GET(data.next,{},function(data){
						append_next(data);
					})
				}
				else{
					cbk(tracks)
				}
		}
		this.oauth.GET_USER(url,{},
			function(data){
				append_next(data);
			},
			function(errmsg){
				cbk(null,errmsg);
			})
	}
	this.getPlaylists = function(cbk){
		var url = function(userid){
			return "https://api.spotify.com/v1/users/"+userid+"/playlists"
		}
		var playlists = [];
		var that  =this;
		var append_next = function(data){
				console.log("response",data);
				playlists = playlists.concat(data.items)
				if(data.next != null){
					that.oauth.GET(data.next,{},function(data){
						append_next(data);
					})
				}
				else{
					console.log("invoke callback");
					cbk(playlists)
				}
		}
		this.oauth.GET_USER(url,{},
			function(data){
				append_next(data);
			},
			function(errmsg){
				cbk(null,errmsg)}
			)
	}
	this._open = function(lnk){
		console.log(lnk)
		chrome.tabs.getCurrent(function(tab){
			var currtab = tab;
	
	      var check_update = function(monitor){
	      	return function(){
		      	chrome.tabs.get(monitor.id, function(tabdata){
	          		console.log("checked status:",tabdata)
	          		if(tabdata.status == "complete"){
	          			console.log("closing monitor tab.",tabdata)
	          			chrome.tabs.remove(tabdata.id,function(){
			       			console.log("removed",monitor)
			       		});
	          		}
	          		else{
	          			setTimeout(check_update(monitor),200);
	          		}
	          	})
	      	}
	      }
			chrome.tabs.create({"url":lnk},function(created_tab){
                console.log("created tab:",created_tab)
                chrome.tabs.update(currtab.id, {active:true},function(){
	             	check_update(created_tab)();
                	
	            })
                
         })
		})
	}
	this.openPlaylist = function(playlistid){
		this._open(playlistid)
	}
	this.openTrack = function(trackid){
		this._open(trackid)
	}
	this.search = function(artist, name, cbk){
		//var url="http://ws.spotify.com/search/1/track.json";
		var url="https://api.spotify.com/v1/search"
		//query="track:"+name+"+artist:"+artist
		query=name+" "+artist
		$.get(
			url,
			{q : query,type:"track"},
			function(data) {
				console.log("Spotify-Data:",data)
			   cbk(data);
			}
		);
	}

	this.init()

}