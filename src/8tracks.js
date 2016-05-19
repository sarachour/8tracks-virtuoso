
//curl --header "X-Api-Key=c7a7a9bf65499f2adb75cc9620ad7364106b86fa" http://8tracks.com/mixes.xml
//curl http://8tracks.com/mixes/1.json?api_key=1234567890
function Tracks8(){
	
	this.init = function(){
		this.auth = new Tracks8Auth(GLOBALS["8tracks-api-key"])
	}
	this.isUndefined = function(x){return (x == undefined);}

	this.login = function(uname, pass, cbk){
		this.auth.login(uname,pass,cbk);
	}
	this.search = function(type, slug, sort, page, cbk){
		url="http://8tracks.com/mix_sets/"+type+":"
		if(slug != null){
			url+=slug.replace(/ /g, "_")+":"
		}
		url+=sort+".json?include=mixes+pagination&per_page=12";
		if(page != undefined) url += "&page="+page;

		this.auth.GET(url,{},
				function(data){cbk(data);},
				function(e){cbk(null, e);}
		);
	}
	this.getMixByName = function(artist, name, cbk){
		var url = "http://8tracks.com/"+artist+"/"+name+".json"
		this.auth.GET(url,{},
				function(data){cbk(data);},
				function(e){cbk(null, e);}
		);	
	}
	this.getMix = function(id, cbk){
		var url = "http://8tracks.com/mixes/"+id+".json"
		this.auth.GET(url,{},
				function(data){cbk(data);},
				function(e){cbk(null, e);}
		);	
		
	}
	this.getNextMix = function(id, smartid, cbk){
		var url = function(tok){
			return "http://8tracks.com/sets/"+tok+"/next_mix.json";
		}
		var args = {
			smart_id:smartid,
			mix_id:id
		}
		this.auth.GET_STREAM(url,args,
				function(data){cbk(data);},
				function(e){cbk(null, e);}
		)
	}

	this.playNextMix = function(mid, smartid, cbk){
			var that = this;
			var url = function(tok){
				return "http://8tracks.com/sets/"+tok+"/play.json"
			}
			that.getNextMix(mid, smartid, function(mixdata, e){
				console.log(mixdata)
				var args = {
					mix_id: mixdata.next_mix.id,
					smart_id: smartid
				}
				that.auth.GET_STREAM(url,args, 
					function(data){cbk(mixdata,data)},
					function(e){cbk(mixdata,null,e)}
				)	
			});
	
	}
	this.playMix = function(mix_id, cbk){
			var url = function(tok){
				return "http://8tracks.com/sets/"+tok+"/play.json"
			}
			var args = {mix_id:mix_id}
			this.auth.GET_STREAM(url,args,
				function(data){cbk(data);},
				function(e){cbk(null, e);}
			)
			
			
	}
	this.report = function(mid, tid, cbk){
		var that = this;
		var url = function(tok){
			return "http://8tracks.com/sets/"+tok+"/next.json"
		}
		var args = {
			mix_id: mid,
			track_id: tid
		}
		this.auth.GET_STREAM(url,args,
				function(data){cbk(data);},
				function(e){cbk(null, e);}
		)
	}

	this.reportError = function(track_id, cbk){
		var that = this;
		url = "http://8tracks.com/tracks/"+track_id+"/report_error"
		var args = {format:"jsonh"}
		this.auth.GET(url,args,
				function(data){cbk(data);},
				function(e){cbk(null, e);}
		)
	}
	this.nextTrack = function(mid, smartid, cbk){
		var url = function(tok){
			return "http://8tracks.com/sets/"+tok+"/next.json"
		}
		var args = {mix_id : mid}
		this.auth.GET_STREAM(url,args,
				function(data){cbk(data);},
				function(e){cbk(null, e);}
		)	
		
		//TODO report
		//http://8tracks.com/sets/111696185/report.json?track_id=[track_id]&mix_id=[mix_id]

	}
	this.skipTrack = function(mixid, cbk){
		var url = function(tok){
			return "http://8tracks.com/sets/"+tok+"/skip.json"
		}
		var args = {mix_id : mixid}
		this.auth.GET_STREAM(url,args,
				function(data){cbk(data);},
				function(e){cbk(null, e);}
		)	
	}
	this._likeMix = function(islike, mixid, cbk){
		if(islike)
			url = "http://8tracks.com/mixes/"+mixid+"/like.json"
		else
			url = "http://8tracks.com/mixes/"+mixid+"/unlike.json"

		this.auth.GET(url,{},
				function(data){cbk(data);},
				function(e){cbk(null, e);}
		)

	}
	this._favoriteTrack = function(isfav, trackid, cbk){
		if(isfav)
			url = "http://8tracks.com/tracks/"+trackid+"/fav.json"
		else
			url = "http://8tracks.com/tracks/"+trackid+"/unfav.json"

		this.auth.GET(url,{},
				function(data){cbk(data);},
				function(e){cbk(null, e);}
		)		
	}
	this.getTags = function(key, cbk){
		var that = this;
		url = "http://8tracks.com/tags.json";
		var args = {q:key}
		this.auth.GET(url,args,
				function(data){cbk(data);},
				function(e){cbk(null, e);}
		)	
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
tracks8 = new Tracks8();
