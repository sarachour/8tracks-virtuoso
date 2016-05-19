
function Filter(){
    this.FILTER_LIKED = false;
    this.FILTER_STARRED = false;
    this.FILTER_RECENT = false;
    this.FILTER_KEYWORD = false;
    this.FILTER_NONE = false;
    this.FILTER_TRACK_KEYWORD = false;
    this.FILTER_KEYWORD_PROPS = {
        keyword: "", 
        onTags: true, 
        onArtist: true, 
        onDescription: true,
        onTitle: true,
        trackKeyword: "",
        onTrackTitle: true,
        onTrackArtist: true
    };
    this.setFilterNone = function(v){
        this.FILTER_NONE = v;
    }
    this.setFilterLiked = function(filterLiked){
        this.FILTER_LIKED = filterLiked;
        this.filter();
    }
    this.setFilterStarred = function(filterStarred){
        this.FILTER_STARRED = filterStarred;
        this.filter();
    }
    this.setFilterRecent = function(filterRecent){
        this.FILTER_RECENT = filterRecent;
        this.filter();
    }
    this.setFilterKeyword = function(enabled){
        this.FILTER_KEYWORD = enabled;
        this.filter();
    }
    this.setFilterTrackKeyword = function(enabled){
        this.FILTER_TRACK_KEYWORD = enabled;
        this.filter();
    }
    this.setFilterKeywordProp = function(propname, prop){
        this.FILTER_KEYWORD_PROPS[propname] = prop;
        this.filter();
    }
    this.mixHasKeyword = function(mix){
        function check(s1, s2){
            return s1.toLowerCase().indexOf(s2.toLowerCase()) >= 0;
        }
        var has = false;
        var props = this.FILTER_KEYWORD_PROPS;

        var kw = props.keyword;
        var inName = check(mix.name, kw);
        var inArtist = false;
        var inDescription = check(mix.description, kw);
        var inTags = check(mix.tag_list_cache, kw);

        console.log(props);
        for(var artist in mix.tracks){
            inArtist = inArtist | check(artist, kw);
            for(var name in mix.tracks[artist]){
                inName = inName | check(name, kw);
            }
        }
        has = (inName && props.onTitle);
        has = has | (inArtist && props.onArtist);
        has = has | (inDescription && props.onDescription);
        has = has | (inTags && props.onTags);

        return has;
    }
    this.trackHasKeyword = function(track){
        function check(s1, s2){
            return s1.toLowerCase().indexOf(s2.toLowerCase()) >= 0;
        }
        var props = this.FILTER_KEYWORD_PROPS;

        var kw = props.trackKeyword; 
        var inName = check(track.name, kw);
        var inArtist = check(track.performer, kw);

        var has = false;
        has = has | (props.onTitle && inName) ;
        has = has | (props.onArtist && inArtist);
        return has;
    }
    this.filterMix = function(cmix){
        star_count=0;
        track_count = 0;
        for(var artist in cmix.tracks){
            for(var track in cmix.tracks[artist]){
                if(artist != "_IS_NEW" && track != "_IS_NEW"){
                    track_count+=1;
                    if(cmix.tracks[artist][track].faved_by_current_user){
                        star_count++;
                    }
                }
            }
        }
        if(this.FILTER_NONE){
            return true;
        }
        if(( (this.FILTER_STARRED && star_count > 0)  || !this.FILTER_STARRED) && 
               ((this.FILTER_LIKED && cmix.liked_by_current_user) || !this.FILTER_LIKED) &&
               ((this.FILTER_RECENT && cmix._IS_NEW) || !this.FILTER_RECENT) &&
               ((this.FILTER_KEYWORD &&this.mixHasKeyword(cmix)) || !this.FILTER_KEYWORD) ){
            return true;
        }
        else
            return false;
    }
    this.filterTrack = function(tr){
        if(this.FILTER_NONE){
            return true;
        }
        if(
            ((this.FILTER_STARRED && tr.faved_by_current_user) || !this.FILTER_STARRED)&&
            ((this.FILTER_RECENT && tr._IS_NEW) || !this.FILTER_RECENT) &&
            ((this.FILTER_TRACK_KEYWORD &&this.trackHasKeyword(tr)) || !this.FILTER_TRACK_KEYWORD)
            ){
            return true;
        }
        else{
            return false;
        }
    }
    this.filterTracks = function(){
        var selector = function(idx){
            if(idx != null) return ".result-track:nth-child("+idx+")";
            else return ".result-track";
        }
        var tracks = $(selector(null));
        for(var i=0; i < tracks.length; i++){
            var elem = $(selector(i+1));
            var track = elem.data("track");
            if(this.filterTrack(track)){
                elem.addClass("show");
                elem.removeClass("hide");
            }
            else{
                elem.removeClass("show");
                elem.addClass("hide");
            }
        }
        
    }
    this.filterMixes = function(){
        var selector = function(idx){
            if(idx != null) return ".result:nth-child("+idx+")";
            else return ".result";
        }
        var grid = $(selector(null));
        for(var i=0; i < grid.length; i++){
            var elem = $(selector(i+1));
            var mix = elem.data("mix");
            if(this.filterMix(mix)){
                elem.addClass("show");
                elem.removeClass("hide");
            }
            else{
                elem.removeClass("show");
                elem.addClass("hide");
            }
        }
        
    }
    this.filter = function(){
        this.filterMixes();
        this.filterTracks();
    }
}

function Selector(){
    this.selection = {};
    this.mixes = [];
    this.multiselect = false;
    this.setMulti = function(m){
        this.multiselect = m;
    }
    this.clear = function(){
        this.selection = {};
        this.mixes = [];
        $(".selected").removeClass("selected");
    }
    this.selectPattern = function(pattern){
        if(!this.multiselect){
            this.clear();
        }
        if($(pattern).hasClass("selected")){
            this.selection = {};
            this.mixes = [];
            $(pattern).removeClass("selected");
        }
        $(pattern).addClass("selected");
        this.update();
    }
    this.select = function(elem){
        var isSelected = elem.hasClass("selected");
        if(!this.multiselect){
            this.clear();
        }
        if(isSelected){
            this.selection = {};
            this.mixes = [];
            elem.removeClass("selected");
        }
        else {
            elem.addClass("selected");
        }
        this.update();
    }
    this.update = function(){
        var selector = function(idx){
            if(idx != null) return ".result.show.selected:eq("+idx+")";
            else return ".show.selected";
        }
        this.selection = {};
        var selection = $(selector(null));
        for(var i=0; i < selection.length; i++){
            var mix = $(selector(i)).data("mix");
            for(var artist in mix.tracks){
                if(artist != "_IS_NEW"){
                    if(!this.selection.hasOwnProperty(artist)){
                        this.selection[artist] = {};
                    }
                    for(var track in mix.tracks[artist]){
                        if(track != "_IS_NEW"){
                            if(!this.selection[artist].hasOwnProperty(track)){
                                this.selection[artist][track] = {};
                            }
                            var is_starred = track.faved_by_current_user;
                            for(var p in mix.tracks[artist][track]){
                                this.selection[artist][track][p] = mix.tracks[artist][track][p];
                            }
                            if(is_starred){
                                this.selection[artist][track].faved_by_current_user = is_starred;
                            }
                            var cmix = {};
                            cmix.is_loved = mix.liked_by_current_user
                            cmix.name = mix.name; 
                            cmix.tags = mix.tag_list_cache;
                            cmix.url = "http://8tracks.com/"+mix.web_path;
                            this.selection[artist][track].mix = cmix;
                        }
                    }
                }
            }
        }
    }
    this.getSelection = function(){
        return this.selection;
    }
    this.getSelectionFromHTML = function(){
        var data = {};
        var selector = function(idx){
            if(idx != null) return ".result-track.show:eq("+idx+")";
            else return ".result-track.show";
        }
        var selection = $(selector(null));
        for(var i=0; i < selection.length; i++){
            var track = $(selector(i)).data("track");
            if(!data.hasOwnProperty(track.performer)){
                data[track.performer] = {};
            }
            data[track.performer][track.name] = track;
            
        }
        return data;
    }
    
}

var AlertHandler = function(){


    this._display = function(msg){
        this.rt = $("#alert-status")
        this.rt.fadeIn(300);
        var that = this;
        this.rt.html(msg).click(function(){
            that.rt.fadeOut(500);
        });
        setTimeout(function(){
            that.rt.fadeOut(500);
        },5000)
    }
    this.status =function(msg){
        this.rt = $("#alert-status").addClass("status").removeClass("error")
        this._display(msg);
    }
    this.error =function(error){
        this.rt = $("#alert-status").removeClass("status").addClass("error")
        this._display(error);
    }
}
var alerts = new AlertHandler();


function GridInputHandler(selector){
    this.selector = selector;
    this.keys=[];
    var that = this;
    $(document).bind('keydown', 'shift', function(){
        that.selector.setMulti(true);
    });
    $(document).bind('keyup', 'shift', function(){
        that.selector.setMulti(false);
    });
    $(document).bind('keydown', 'ctrl+a meta+a', function(){
        that.selector.selectPattern(".result");
        optionsInterface.updateTracklist();
        return false;
    });
    $(document).bind('keydown', 'ctrl+c meta+c', function(){
        $("#export-status").hide();
        $("#export-overlay").fadeIn(400);
    });
    $(document).bind('keydown', 'esc', function(){
        $("#export-overlay").fadeOut(400);
    });
    
}



function SpotifyExporter(){
    this.init = function(){
        this.select = "8tracks-select";
        this.session = "8tracks-session";
        this.all = "8tracks-all";
        this.spotify = new Spotify();
        this.playlist_ids = null;
        this.storage_key = "option.html$spotify_playlist_ids";
        this.user_key = "option.html$spotify_username";
        this.load_playlist_ids();
        this.SESSION_CLEARED = false;
        if(this.spotify.oauth.isLoggedIn()){
            this.get_playlists(function(){})
        }

    }
    this.refresh_tracks = function(keys){

    }
    this.refresh_all_tracks = function(){
        this.refresh_tracks([this.select,this.session,this.all])
    }
    this.save_playlist_ids = function(){
        localStorage[this.storage_key] = JSON.stringify(this.playlist_ids);
        localStorage[this.user_key] = this.spotify.oauth.getUserInfo().user;
    }
    this.load_playlist_ids = function(){
        if(this.spotify.oauth.isLoggedIn() && 
            this.user_key in localStorage &&
            this.storage_key in localStorage &&
            this.spotify.oauth.getUserInfo().user == localStorage[this.user_key]){

            this.playlist_ids = JSON.parse(localStorage[this.storage_key]);

        }
        else {
            localStorage.removeItem(this.storage_key)
            localStorage.removeItem(this.user_key)
        }
    }
    this.get_playlists = function(cbk){
        if(this._PENDING || this.playlist_ids != null){
            return;
        }
        var that = this;
        var playlist_ids = {};
        playlist_ids[this.select] = null;
        playlist_ids[this.session] = null;
        playlist_ids[this.all] = null;
        this._PENDING = true;
        var upd = function(pl,id){
            if(pl.name == id){
                playlist_ids[id] = {};
                playlist_ids[id].id = pl.id;
                playlist_ids[id].href = pl.href;
                playlist_ids[id].uri = pl.uri;
                playlist_ids[id].name = pl.name;
                console.log("found-id",id)
                return 1;
            }
            return 0;
        }

        if(this.spotify.oauth.isLoggedIn() == false){
            alerts.error("Virtuoso cannot retrieve Spotify playlists. "+
                "Please log in via the <a href='preferences.html' target='_blank'>preferences</a> page.");
            return;
        }

        this.spotify.getPlaylists(function(lists){
            var N_FOUND = 0;
            console.log("playlists",lists)
            for(idx in lists){
                var pl = lists[idx];
                
                N_FOUND += upd(pl,that.select);
                N_FOUND += upd(pl,that.all);
                N_FOUND += upd(pl,that.session);
            }
            var N_TO_CREATE = 3-N_FOUND;
            var N_CREATED = 0;
            console.log("need to create",N_TO_CREATE)
            for(id in playlist_ids){
                if(playlist_ids[id] == null){
                    console.log("create",id);
                    that.spotify.makePlaylist(id,function(id){return function(data,error){
                        if(data == null){
                            cbk(null,error);
                            return;
                        }
                        upd(data,id);
                        N_CREATED += 1;
                        if(N_CREATED == N_TO_CREATE){
                            that.playlist_ids = playlist_ids;
                            that._PENDING = false;
                            cbk(data);
                        }
                    }}(id))
                }
            }
            if(N_TO_CREATE <= 0){
                console.log("done creating.. setting property.");
                that.playlist_ids = playlist_ids;
                that.save_playlist_ids();
                cbk();
            }
        })
    }
    this.export = function(tracklist,cbk){
        var that = this;
        if(this.spotify.oauth.isLoggedIn() == false){
            alerts.error("Virtuoso cannot retrieve Spotify playlists. "+
                "Please log in via the <a href='preferences.html' target='_blank'>preferences</a> page.");
            return;
        }
        if(this.playlist_ids == null){
            var msg = "Export Failed. Virtuoso is still retrieving playlists from spotify."
            alerts.error(msg)
            this.get_playlists(function(){
                alerts.status("Successfully loaded playlists from Spotify.");
            })
        }
        else{
            var exists_in = function(v,array){
                for(idx in array){
                    var el = array[idx];
                    if(v == el.track.uri){
                        return true;
                    }
                }
                return false;
            }
            var difference = function(tracklist,tracks){
                var to_add = [];
                for(idx in tracklist){
                    var track = tracklist[idx];
                    if(!exists_in(track,tracks)){
                        to_add.push(track)
                    }
                }
                return to_add;
            }
            var add_new = function(kind,playlist,tracklist,tracks,err){
                var to_add = difference(tracklist,tracks);
                var dups = tracklist.length - to_add.length;
                if(to_add.length == 0){
                    cbk({kind:kind,playlist:playlist,tracks:to_add,
                        dups:dups,
                        total:tracklist.length,
                        tracklist:tracks,"data":null},err)
                    return;
                }

                that.spotify.addTracksToPlaylist(playlist.id, to_add, function(data,err){
                    cbk({kind:kind,playlist:playlist,tracks:to_add,
                        dups:dups,total:tracklist.length,tracklist:tracks,"data":null},err)
                })
            }
            var replace_tracks = function(kind,playlist,tracklist){
                that.spotify.replaceTracksInPlaylist(playlist.id,tracklist, function(data,err){
                    cbk({kind:kind,playlist:playlist,tracks:tracklist,tracklist:tracklist,"data":data},err)
                })
            };
                
            
            var playlist = that.playlist_ids[that.select]
            replace_tracks("select",playlist,tracklist,[])

            var playlist = that.playlist_ids[that.session];
            that.spotify.getTracksInPlaylist(playlist.id, function(playlist){return function(tracks,err){
                //only add unadded
                if(that.SESSION_CLEARED == false){
                    replace_tracks("session",playlist,tracklist)
                    that.SESSION_CLEARED =true;
                }
                else{
                    add_new("session",playlist,tracklist,tracks,err)
                }
                
            }}(playlist))
            
            
            var playlist = that.playlist_ids[that.all];
            that.spotify.getTracksInPlaylist(playlist.id, function(playlist){return function(tracks,err){
                    add_new("all",playlist,tracklist,tracks,err)
            }}(playlist))
            
        }
    }
    this.init();

}
var spotifyExporter = new SpotifyExporter();

function OptionsInterface(){
    this.selector = new Selector();
    this.inputHandler = new GridInputHandler(this.selector);
    this.filter = new Filter();
	this.init = function(){
		this.updateView();
	}
    this.updateData = function(){
        var that = this;
        chrome.extension.sendMessage({action: "playlist-get", type:"obj"}, function(resp){
            if(resp == null || resp == undefined){
                return;
            }
            that.data = resp.playlist;
            that.selector.update();
            that.updateView();
        });

    }
    this.clearSelection = function(){
        this.selector.clear();
        this.updateTracklist();
    }
    this.setClipboard = function(text, msg){
        $("#clipboard").css('display', 'block');
        $("#clipboard").text(text);
        $("#clipboard").select();
        document.execCommand('copy',true);
        $("#clipboard").hide();
        alerts.status(msg);

    }
    this.showSpotifyDialog = function(){
        this.closeDialogs();
        var rt= $("#export-spotify-overlay").show();
    }
    this.showPlaintextDialog = function(){
        this.closeDialogs();
        var rt= $("#export-plaintext-overlay").show();
    }
    this.updateSpotifyPlaylistInfo = function(name,data,tracks,newtracks,stats){
        var rt= $("#export-spotify-overlay").show();
        var dv = $("#"+name+"-spotify",rt);
        console.log(data);
        var that = this;
        $("#open",dv).click(function(data){return function(){
            spotifyExporter.spotify.openPlaylist(data.uri);
        }}(data))
        $("#ntracks",dv).html(newtracks.length);
        $("#total",dv).html(tracks.length)
        if(stats.dups != undefined && stats.dups > 0 && stats.total > 0){
            var dups = $("#dups",dv).show()
            $("#ndups",dups).html(stats.dups);
            $("#total",dups).html(stats.total);
        }
        else{
            $("#dups",dv).hide();
        }
    }
    this.updatePlaintextInfo = function(n,text,dat){
        var rt = $("#export-plaintext-overlay");
        var area = $("#copied_text",rt);
        var ntracks = $("#ntracks",rt)
        var that = this;

        var table = $("<table/>");
        var hdr = $("<tr/>")
        for(var j=0; j < dat[0].length; j++){
            var col = $("<th/>").html(dat[0][j]);
            hdr.append(col);
        }  
        table.append(hdr);
        for(var i=1; i < dat.length; i++){
            var row = $("<tr/>")
            for(var j=0; j < dat[i].length; j++){
                var col = $("<td/>").html(dat[i][j]);
                row.append(col);
            }  
            table.append(row);
        }
        area.html(table);
        ntracks.html(n)
        $("#copy_button",rt).click(function(){
            that.setClipboard(text, 
            "copied "+n+" songs. "+
            "Paste (Ctrl+P) into new spreadsheet.");
        })

    }
    this.hideSpotifyDialog = function(){
        var rt = $("#export-spotify-overlay").hide();
    }
    this.hidePlaintextDialog = function(){
        var rt = $("#export-plaintext-overlay").hide();
    }
    this.closeDialogs = function(){
        this.hidePlaintextDialog();
        this.hideSpotifyDialog();
    }
    this.exportSpotify = function(){
        var sel = this.selector.getSelectionFromHTML();
        var dat = [];
        var str = "";
        var ntracks = 0;
        var that = this;
        for(var artist in sel){
            for(var track in sel[artist]){
                var msel = sel[artist][track];
                if(msel.hasOwnProperty("spotify")){
                    dat.push(msel.spotify.track_uri);
                    ntracks += 1;
                }
            }
        }
        spotifyExporter.export(dat,function(data,err){
            that.showSpotifyDialog();
            if(data != null){
                that.updateSpotifyPlaylistInfo(data.kind,data.playlist,data.tracklist,data.tracks,data)
            }
            console.log("Handler",data,err);

        });
    }
    
    this.exportTabDelim = function(){
        var sel = this.selector.getSelectionFromHTML();
        var dat = [];
        var ntracks = 0;
        dat.push(['track-name', 'track-artist', 'track-starred', 
            'track-url', 'track-buy','track-spotify-url',
            'mix-name','mix-tags','mix-loved','mix-url']);
        for(var artist in sel){
            for(var track in sel[artist]){
                var row = [];
                var msel = sel[artist][track];
                row.push(track);
                row.push(artist);
                row.push(msel.faved_by_current_user);
                row.push(msel.url);
                row.push(msel.buy_link);
                if(msel.hasOwnProperty("spotify")){
                    row.push(msel.spotify.track_id);
                }
                else{
                    row.push("");
                }
                row.push(msel.mix.name);
                row.push(msel.mix.tags);
                row.push(msel.mix.is_loved);
                row.push(msel.mix.url);

                dat.push(row);
            }
        }
        var text = "";
        for(var i=0; i < dat.length; i++){
            for(var j=0; j < dat[i].length; j++){
                text += dat[i][j] + "\t";
            }  
            ntracks += 1;
            text += "\n";
        }
        ntracks -= 1;
        this.setClipboard(text, 
            "copied "+ntracks+" songs. "+
            "Paste (Ctrl+P) into new spreadsheet.");


        this.showPlaintextDialog();
        this.updatePlaintextInfo(ntracks,text,dat)

    }
    this.updateTracklist = function(){
        var that = this;
        var selection = this.selector.getSelection();
        var grid = $("#tracks-table-body");
        grid.empty();
        var nrows = 0;
        for(var artist in selection){
            for(var track in selection[artist]){
                var info = selection[artist][track];
                if(artist != "_IS_NEW" && track != "_IS_NEW"){
                    var row = $("<tr/>").addClass("result-track").addClass("show");
                    var starred_img_url = "images/star.png"
                    if(info.faved_by_current_user)
                        starred_img_url = "images/star-on.png";

                    var starred_img = $("<div/>").addClass("icon-sm").append(
                        $("<img/>").attr("src", starred_img_url)
                    )

                    var spotify_img_url = "images/spotify.png";
                    if(info.spotify != null){
                        spotify_img= $("<div/>").addClass("icon-sm").append($("<a/>")
                            .append($("<img/>").attr("src", "images/spotify-on.png")))
                        spotify_img.click(function(info){ return function(){
                            spotifyExporter.spotify.openTrack(info.spotify.track_uri)
                        }}(info))
                    }
                    else{
                        spotify_img= $("<div/>").addClass("icon-sm").append($("<a/>")
                            .append($("<img/>").attr("src", "images/spotify.png")))
                    }

                    var buy_img = $("<div/>").addClass("icon-sm").append($("<a/>")
                            .attr("href", info.buy_link)
                            .attr("target", "_blank")
                            .append($("<img/>").attr("src", "images/buy.png")))

                    var goto_img = $("<div/>").addClass("icon-sm").append($("<a/>")
                            .attr("href", info.url)
                            .attr("target", "_blank")
                            .append($("<img/>").attr("src", "images/goto.png")))



                    var status = $("<div/>").append(starred_img).append(spotify_img);

                    
                    row.append($("<td>").html(track))
                    .append($("<td>").html(artist))
                    .append($("<td>").html(buy_img))
                    .append($("<td>").html(goto_img))
                    .append($("<td>").html(starred_img))
                    .append($("<td>").html(spotify_img))
                    .data("track", selection[artist][track]);
                    nrows += 1;
                    grid.append(row)
                    
                }
            }
        }
        if(nrows == 0 && $("#mixes-hint").is(':hidden')){
            $("#tracks-hint").show();
        }
        else{
            $("#tracks-hint").hide();
            that.filter.filterTracks();
        }
    }
	this.updateGrid = function(){
        var grid = $("#mixes-results");
        grid.empty();
        var that = this;
        var nmixes = 0;
        for(var mix in this.data){
            var cmix = this.data[mix];
            star_count=0;
            track_count = 0;
            for(var artist in cmix.tracks){
                for(var track in cmix.tracks[artist]){
                    if(artist != "_IS_NEW" && track != "_IS_NEW"){
                        track_count+=1;
                        if(cmix.tracks[artist][track].faved_by_current_user){
                            star_count++;
                        }
                    }
                }
            }

            var badge_image = "images/no-rank.png";
            if(mix.certification == "gold"){
                badge_image = "images/gold.png";
            }
            else if(mix.certification == "silver"){
                badge_image = "images/silver.png";
            }
            if(mix.certification == "bronze"){
                badge_image = "images/bronze.png";
            }
            var html_img = $('<img/>').addClass("result-img").attr("src", cmix.cover_urls.sq250);
            var html_div = $('<div/>').addClass("result show").addClass("text black small");


            var html_title = $('<div/>').addClass("med").html(cmix.name);
            var html_tags = $('<div/>').addClass("small").html(cmix.tag_list_cache);
            var html_desc = $('<div/>').addClass("faint scrollable").html(cmix.description_html);
            var html_badge = $('<div/>').addClass("icon-sm").append($('<img/>').attr("src", badge_image));
            var html_likes = $('<div/>').addClass("icon-sm").append($('<img/>').attr("src", "images/heart-on.png"));
            var html_plays = $('<div/>').addClass("icon-sm").append($('<img/>').attr("src", "images/play.png"));
            var html_tracks = $('<div/>').addClass("icon-sm").append($('<img/>').attr("src", "images/music.png"));
            var html_info = $('<div/>').addClass("result-text");

            var sp = "&nbsp;&nbsp;&nbsp;"
            html_info.append("<br>",
                html_title, "<br>",
                html_badge, sp,
                html_likes,cmix.likes_count,sp, 
                html_plays,cmix.plays_count,sp, 
                html_tracks, cmix.tracks_count, "<br>",
                html_tags, "<br>",
                html_desc);

            var html_icon_overlay = $('<div/>').addClass("result-img-overlay");
            if(cmix._IS_NEW  == true){
                var ov_likes = $('<div/>').addClass("icon-sm ll").append($('<img/>').attr("src", "images/dot-ok.png"));
                html_icon_overlay.append(ov_likes)
            }
            if(cmix.liked_by_current_user){
                var ov_likes = $('<div/>').addClass("icon-sm ur").append($('<img/>').attr("src", "images/heart-on.png"));
                html_icon_overlay.append(ov_likes)
            }
            
            if(star_count > 0){
                var ov_stars = $('<div/>').addClass(' ul text-overlay white small')
                    .append($('<div/>').addClass("icon-sm")
                        .append($('<img/>').attr("src", "images/star-on.png")))
                    .append(star_count);
                html_icon_overlay.append(ov_stars)
            }
            var ov_tracks = $('<div/>').addClass("lr white text text-overlay small")
                .append(track_count + "/"+cmix.tracks_count);
            html_icon_overlay.append(ov_tracks)

            html_div.append(html_img, html_info, html_icon_overlay);
            html_div.click(function(myelem){
                return function(){
                    that.selector.select(myelem);
                    that.updateTracklist();
                    return false;
                } 
              }(html_div));
            html_div.data("mix", cmix);
            grid.append(html_div);
            nmixes += 1;
        }
        console.log(nmixes);
        if(nmixes == 0){
            $("#mixes-hint").show();
            $("#tracks-results").hide();
        }
        else{
            $("#mixes-hint").hide();
            $("#tracks-results").show();
        }

	}
	this.updateView = function(){
		this.updateGrid();
        this.updateTracklist();
	}
	this.init();
}
optionsInterface = new OptionsInterface();


chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
        if(request.action == "update"){
            optionsInterface.updateData();
        }
  }
)

function SetupLayout(){
    $('#mixes-results').layout().click(function(){
        optionsInterface.clearSelection();
        optionsInterface.closeDialogs();
        console.log("clearing...");
    });
    var outerContainer = $('#options').layout({resize: false});
    function layout() {
        outerContainer.layout({resize: false});
    }


    $('.toggle-button').click(function(){
        $(this).toggleClass("down");
    });
    $('.layout-outer > .east').resizable({
        handles: 'w',
        stop: layout
    });

    $('.layout-outer > .west').resizable({
        handles: 'e',
        stop: layout
    });
    $( window ).resize(function() {
      $('#options').layout({resize: false});
    });
}

function SetupShortcuts(){
    
}

jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px");
    return this;
}

function SetupUI(){
    $("#alert-status").hide();
    $("#filter_keyword_properties").hide();
    $("#filter_track_keyword_properties").hide();

    $("#filter_starred").click(function(){
        if($("#filter_starred").hasClass("down")){
            optionsInterface.filter.setFilterStarred(true);
        }
        else{
            optionsInterface.filter.setFilterStarred(false);
        }
    });
    $("#filter_liked").click(function(){
        if($("#filter_liked").hasClass("down")){
            optionsInterface.filter.setFilterLiked(true);
            optionsInterface.selector.update();
            optionsInterface.updateTracklist();
        }
        else{
            optionsInterface.filter.setFilterLiked(false);
            optionsInterface.selector.update();
            optionsInterface.updateTracklist();
        }
    });
    $("#filter_played").click(function(){
        if($("#filter_played").hasClass("down")){
            optionsInterface.filter.setFilterRecent(true);
        }
        else{
            optionsInterface.filter.setFilterRecent(false);
        }
    });
	$("#playlist-clear").click(function(){
    	chrome.extension.sendMessage({action: "playlist-clear"}, function(resp){
    		console.log("playlist cleared.");
    	})
    })

    $(".view-overlay").hide();
    $("#close",$("#export-spotify-overlay")).click(function(){
    	optionsInterface.hideSpotifyDialog();
    })
    $("#close",$("#export-plaintext-overlay")).click(function(){
    	optionsInterface.hidePlaintextDialog();
    })
    

     $("#export-spotify-button").click(function(){
        optionsInterface.exportSpotify();
    })
    $("#export-plaintext-button").click(function(){
        optionsInterface.exportTabDelim();
    })

    $("#filter_keyword").click(function(){
        if($("#filter_keyword").hasClass("down")){
            optionsInterface.filter.setFilterKeyword(true);
            optionsInterface.selector.update();
            $("#filter_keyword_properties").fadeIn(200);
        }
        else{
            optionsInterface.filter.setFilterKeyword(false);
            optionsInterface.selector.update();
            $("#filter_keyword_properties").fadeOut(200);
        }
    })
     $("#filter_keyword_text").on('keyup', function(){
        var kw = $('#filter_keyword_text').val();
        console.log(kw);
        optionsInterface.filter.setFilterKeywordProp("keyword", kw);
        optionsInterface.selector.update();
        optionsInterface.updateTracklist();
     });
     $("#filter_tags").change(function() {
        optionsInterface.filter.setFilterKeywordProp("onTags", this.checked);
        optionsInterface.selector.update();
        optionsInterface.updateTracklist();
    });
     $("#filter_description").change(function() {
        optionsInterface.filter.setFilterKeywordProp("onDescription", this.checked);
        optionsInterface.selector.update();
        optionsInterface.updateTracklist();
    });
     $("#filter_title").change(function() {
        optionsInterface.filter.setFilterKeywordProp("onTitle", this.checked);
        optionsInterface.selector.update();
        optionsInterface.updateTracklist();
    });
    
    $("#filter_artist").change(function() {
        optionsInterface.filter.setFilterKeywordProp("onArtist", this.checked);
        optionsInterface.selector.update();
        optionsInterface.updateTracklist();
    });
    $("#select_all").click(function() {
        optionsInterface.selector.selectPattern(".result");
        optionsInterface.updateTracklist();
    });
    $("#filter_track_keyword").click(function(){
        if($("#filter_track_keyword").hasClass("down")){
            optionsInterface.filter.setFilterTrackKeyword(true);
            optionsInterface.selector.update();
            $("#filter_track_keyword_properties").fadeIn(200);
        }
        else{
            optionsInterface.filter.setFilterTrackKeyword(false);
            optionsInterface.selector.update();
            optionsInterface.updateTracklist();
            $("#filter_track_keyword_properties").fadeOut(200);
        }
    })
     $("#filter_track_keyword_text").on('keyup', function(){
        var kw = $('#filter_track_keyword_text').val();
        optionsInterface.filter.setFilterKeywordProp("trackKeyword", kw);
        optionsInterface.selector.update();
     });
     $("#filter_track_title").change(function() {
        optionsInterface.filter.setFilterKeywordProp("onTrackTitle", this.checked);
        optionsInterface.selector.update();
    });
     $("#filter_track_artist").change(function() {
        optionsInterface.filter.setFilterKeywordProp("onTrackArtist", this.checked);
        optionsInterface.selector.update();
    });
    $("#play-mix-button").click(function(){
        console.log("playing mix");
        var sel = $(".selected");
        
        if(sel.length == 1){
            var dat = sel.data("mix");
            var mid = dat.id;
            var msmartid = "similar:"+mid;
            chrome.extension.sendMessage({action: "play", id:mid, smart_id:msmartid}, function(resp){
                displayMessage("playing mix.");
            });
        }       
        else if(sel.length > 1){
            displayMessage("Too many mixes selected. Please select one only.");
        }
        else{
            displayMessage("No mixes selected. Please select one.");
        }
       
    })
    $("#clear-data-button").click(function(){
        var r=confirm("This will clear all the mix data virtuoso has accumulated. Are you sure?");
        if (r) 
        {
            chrome.extension.sendMessage({action: "playlist-clear"});
        } 
    })
}
document.addEventListener('DOMContentLoaded', function() {
    SetupLayout();
    SetupUI();
    SetupShortcuts();
    optionsInterface.updateData();    
});