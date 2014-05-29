
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

function KeyHandler(){
    this.SHIFT_MODIFIER = false;
    this.CTRL_MODIFIER = false;
    this.A_MODIFIER = false;
    this.C_MODIFIER = false;
    this.V_MODIFIER = false;
}

function OptionsInterface(){
    this.selection = {};
    this.selection_html = [];
    this.SHIFT_MODIFIER = false;
    this.FILTER_LIKED = false;
    this.FILTER_STARRED = false;
    this.FILTER_RECENT = false;

    this.filter = new Filter();
	this.init = function(){
		this.updateView();
	}
    this.setShiftDown = function(isdown){
        this.SHIFT_MODIFIER = isdown;
    }
    this.updateData = function(){
        var that = this;
        chrome.extension.sendMessage({action: "playlist-get", type:"obj"}, function(resp){
            that.data = resp.playlist;
            that.updateGrid();
        });

    }
    this.clearSelection = function(){
        this.selection = {};
        for(var i=0; i < this.selection_html.length; i++){
            this.selection_html[i].removeClass("selected");
        }
        this.selection_html = [];
    }
    this.select = function(mix, html){
        if(this.SHIFT_MODIFIER == false){
            this.clearSelection();
        }
        html.addClass("selected");
        this.selection_html.push(html);
        for(var artist in mix.tracks){
            if(!this.selection.hasOwnProperty(artist)){
                this.selection[artist] = {};
            }
            for(var track in mix.tracks[artist]){
                if(!this.selection[artist].hasOwnProperty(track)){
                    this.selection[artist][track] = {};
                }
                for(var p in mix.tracks[artist][track]){
                    this.selection[artist][track][p] = mix.tracks[artist][track][p];
                }
            }
        }
    }
    this.updateTracklist = function(){
        var selection = this.selection;
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
        console.log(selection);
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
            html_div.click(function(mymix, myelem){
                return function(){
                    that.select(mymix, myelem);
                    that.updateTracklist();

                } 
              }(cmix, html_div));
            html_div.data("mix", cmix);
            grid.append(html_div);
        }
    

	}
	this.updateView = function(){
		this.updateGrid();
	}
	this.init();
}
optionsInterface = new OptionsInterface();


chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
        if(request.action == "update"){
            optionsInterface.updateData();
            optionsInterface.updateView();
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
    $(document).keydown(function (e) {
        if (e.shiftKey) {
            optionsInterface.setShiftDown(true);
            return true;
        }
    });
    $(document).keyup(function (e) {
        if (optionsInterface.SHIFT_MODIFIER) {
            console.log("keyup");
            optionsInterface.setShiftDown(false);
            return true;
        }
    });
}


function SetupUI(){
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
    	chrome.extension.sendMessage({action: "playlist-get", type:"spotify"}, function(resp){
    		console.log(resp.playlist);
    		optionsInterface.setClipboard(resp.playlist, "copied to clipboard. paste into spotify playlist.");
    	})
    })
    $("#export-text").click(function(){
    	chrome.extension.sendMessage({action: "playlist-get", type:"tab"}, function(resp){
    		console.log(resp.playlist);
    		optionsInterface.setClipboard(resp.playlist, "copied to clipboard. paste into text file.");
    	})
    })
}
document.addEventListener('DOMContentLoaded', function() {
    SetupLayout();
    SetupUI();
    SetupShortcuts();
    optionsInterface.updateData();    
});