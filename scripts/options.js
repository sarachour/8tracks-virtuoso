
function Filter(){
    this.FILTER_LIKED = false;
    this.FILTER_STARRED = false;
    this.FILTER_RECENT = false;

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
        if((this.FILTER_STARRED && star_count > 0  || !this.FILTER_STARRED) && 
               (this.FILTER_LIKED && cmix.liked_by_current_user || !this.FILTER_LIKED) &&
               (this.FILTER_RECENT && cmix._IS_NEW || !this.FILTER_RECENT) ){
            return true;
        }
        else
            return false;
    }
    this.filter = function(){
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
            if(idx != null) return ".selected:eq("+idx+")";
            else return ".selected";
        }
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
                            for(var p in mix.tracks[artist][track]){
                                this.selection[artist][track][p] = mix.tracks[artist][track][p];
                            }
                        }
                    }
                }
            }
        }
    }
    this.getSelection = function(){
        return this.selection;
    }
    
}


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
    });
    $(document).bind('keydown', 'ctrl+c meta+c', function(){
        $("#export-status").hide();
        $("#export-overlay").fadeIn(400);
    });
    $(document).bind('keydown', 'esc', function(){
        $("#export-overlay").fadeOut(400);
    });
    
}

function OptionsInterface(){
    this.selector = new Selector();
    this.inputHandler = new GridInputHandler(this.selector);
    this.filter = new Filter();
    this.spotify = new Spotify();
	this.init = function(){
		this.updateView();
	}
    this.updateData = function(){
        var that = this;
        chrome.extension.sendMessage({action: "playlist-get", type:"obj"}, function(resp){
            that.data = resp.playlist;
            that.selector.update();
            that.updateView();
        });

    }
    this.setClipboard = function(text, msg){
        $("#clipboard").css('display', 'block');
        $("#clipboard").text(text);
        $("#clipboard").select();
        document.execCommand('copy',true);
        $("#export-status").fadeIn(300);
        $("#export-status").html(msg)
        $("#clipboard").css('display', 'none');
    }
    this.exportSpotify = function(){
        var sel = this.selector.getSelection();
        var dat = [];
        var str = "";
        for(var artist in sel){
            for(var track in sel[artist]){
                var msel = sel[artist][track];
                if(msel.hasOwnProperty("spotify")){
                    dat.push(msel.spotify.track_id);
                    str += msel.spotify.track_id + "\n";
                }
            }
        }
        if(dat.length <= 10){
            var that = this;
            this.spotify.createTrackset("8tracks-export", dat, function(){
               
            })
            that.setClipboard(str, "Created Playlist. Open Spotify.");
        }
        else{
            this.setClipboard(str, "Copied to clipboard. Now paste into Spotify playlist.");
        }
    }
    this.exportTabDelim = function(){
        var sel = this.selector.getSelection();
        var dat = [];
        dat.push(['track', 'artist', 'starred', 'spotify']);
        for(var artist in sel){
            for(var track in sel[artist]){
                var row = [];
                var msel = sel[artist][track];
                row.push(track);
                row.push(artist);
                row.push(msel.faved_by_current_user);

                if(msel.hasOwnProperty("spotify")){
                    row.push(msel.spotify.track_id);
                }
                else{
                    row.push("");
                }
                dat.push(row);
            }
        }
        var text = "";
        for(var i=0; i < dat.length; i++){
            for(var j=0; j < dat[i].length; j++){
                text += dat[i][j] + "\t";
            }  
            text += "\n";
        }
        this.setClipboard(text, "Copied to clipboard. Paste into spreadsheet.");
    }
    this.updateTracklist = function(){
        var selection = this.selector.getSelection();
        var grid = $("#tracks-table-body");
        grid.empty();
        for(var artist in selection){
            for(var track in selection[artist]){
                var info = selection[artist][track];
                if(artist != "_IS_NEW" && track != "_IS_NEW"){
                    var starred_img_url = "images/star.png"
                    if(info.faved_by_current_user)
                        starred_img_url = "images/star-on.png";

                    var starred_img = $("<div/>").addClass("icon-sm").append(
                        $("<img/>").attr("src", starred_img_url)
                    )
                    var spotify_img_url = "images/spotify-black.png";

                    if(info.spotify != null){
                        spotify_img= $("<div/>").addClass("icon-sm").append($("<a/>")
                            .attr("href", info.spotify.track_id)
                            .append($("<img/>").attr("src", "images/spotify-on.png")))
                    }
                    else{
                         spotify_img= $("<div/>").addClass("icon-sm").append(
                            $("<img/>").attr("src", "images/spotify-black.png")) 
                    }
                    var status = $("<div/>").append(starred_img).append(spotify_img);

                    grid.append($("<tr/>")
                    .append($("<td>").html(track))
                    .append($("<td>").html(artist))
                    .append($("<td>").html(starred_img))
                    .append($("<td>").html(spotify_img))
                    )
                }
            }
        }
    }
	this.updateGrid = function(){
        var grid = $("#mixes-results");
        grid.empty();
        var that = this;
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

            html_div.append(html_img);

            var html_title = $('<div/>').addClass("med").html(cmix.name);
            var html_tags = $('<div/>').addClass("small faint").html(cmix.tag_list_cache);
            var html_desc = $('<div/>').addClass("scrollable").html(cmix.description_html);
            var html_badge = $('<div/>').addClass("icon-sm").append($('<img/>').attr("src", badge_image));
            var html_likes = $('<div/>').addClass("icon-sm").append($('<img/>').attr("src", "images/heart-on.png"));
            var html_plays = $('<div/>').addClass("icon-sm").append($('<img/>').attr("src", "images/play-black.png"));
            var html_tracks = $('<div/>').addClass("icon-sm").append($('<img/>').attr("src", "images/music.png"));
            var html_info = $('<div/>').addClass("result-text");

            html_info.append("<br>",
                html_title, "<br>",
                html_badge, "&nbsp;",
                cmix.likes_count,html_likes,"&nbsp;", 
                cmix.plays_count,html_plays,"&nbsp;", 
                cmix.tracks_count, html_tracks, "<br>",
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

            html_div.append(html_info, html_icon_overlay);
            html_div.click(function(myelem){
                return function(){
                    that.selector.select(myelem);
                    that.updateTracklist();

                } 
              }(html_div));
            html_div.data("mix", cmix);
            grid.append(html_div);
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
  $('#mixes-results').layout();
  var outerContainer = $('#options').layout({resize: false});
  $('.toggle-button').click(function(){
        $(this).toggleClass("down");
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
    $("#export-container").center();
    $("#export-overlay").hide();
    $("#export-status").hide();

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
        }
        else{
            optionsInterface.filter.setFilterLiked(false);
        }
    });
    $("#filter_recent").click(function(){
        if($("#filter_recent").hasClass("down")){
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

    $("#export-spotify").click(function(){
    	optionsInterface.exportSpotify();
    })
    $("#export-text").click(function(){
    	optionsInterface.exportTabDelim();
    })
}
document.addEventListener('DOMContentLoaded', function() {
    SetupLayout();
    SetupUI();
    SetupShortcuts();
    optionsInterface.updateData();    
});