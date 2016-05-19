
function Toast (){
   this.waitTime = 5000;
   this.disabled = false;
   this.nextTrack = function(){
      if(this.disabled) return;
      var ic = "images/ffwd-track.png"
      var not = new Notification("Next Track", 
         {icon: ic, //"images/play.png"
         body: "skipping to the next track.", 
      });
      var that = this;

      not.onshow = function() {
         setTimeout(function() {not.close();}, that.waitTime);
         //setTimeout(not.close, 1500) 
      }
   }
   this.nextMix = function(){
      if(this.disabled) return;
      var ic = "images/ffwd-mix.png"
      var not = new Notification("Next Mix", 
         {icon: ic, //"images/play.png"
         body: "skipping to the next mix.", 
      });
      var that = this;
      not.onshow = function() {
         setTimeout(function() {not.close();}, that.waitTime);
         //setTimeout(not.close, 1500) 
      }
   }
   this.pause = function(cover_url){
      if(this.disabled) return;
      var desc = ""
      var ic = cover_url
      var not = new Notification("Track Paused", 
         {icon: ic,
         body: desc
         //tag: "ERROR"
      });
      var that = this;
      not.onshow = function() {
         setTimeout(function() {not.close();}, that.waitTime);
         //setTimeout(not.close, 1500) 
      }
   }
   this.resume = function(cover_url){
      if(this.disabled) return;
      var desc = ""
      var ic = cover_url
      var not = new Notification("Track Resumed", 
         {icon: ic,
         body: desc
         //tag: "ERROR"
      });
      var that = this;
      not.onshow = function() {
         setTimeout(function() {not.close();}, that.waitTime);
         //setTimeout(not.close, 1500) 
      }
   }
   this.favorite = function(cover_url, liked, trackname, trackartist){
      if(this.disabled) return;
      var desc = "unfavorited track"
      var ic = "images/star.png"
      if(liked){
         desc = "favorited track"
         ic = "images/star-on.png"
      }
      var not = new Notification(trackname, 
         {icon: ic, //"images/play.png"
         body: trackartist, 
         tag: "STAR"
         //tag: "ERROR"
      });
      var that = this;
      not.onshow = function() {
         setTimeout(function() {not.close();}, that.waitTime);
         //setTimeout(not.close, 1500) 
      }
   }
   this.like = function(cover_url, liked, mixname){
      if(this.disabled) return;
      var desc = "unliked mix"
      var ic = "images/heart.png"
      if(liked){
         desc = "liked mix"
         ic = "images/heart-on.png"
      }
      var not = new Notification(mixname, 
         {icon: ic, //"images/play.png"
         body: "", 
         tag: "LIKE"
         //tag: "ERROR"
      });
      var that = this;
      not.onshow = function() {
         setTimeout(function() {not.close();}, that.waitTime);
         //setTimeout(not.close, 1500) 
      }

   }
   this.error = function(status, message){
      if(this.disabled) return;
      var not = new Notification(status, 
         {icon: "images/error.png", //"images/play.png"
         body: message, 
         tag: message
         //tag: "ERROR"
      });
      var that = this;
      not.onshow = function() {
         setTimeout(function() {not.close();}, that.waitTime);
         //setTimeout(not.close, 1500) 
      }

   }

   this.track = function(icon, track, artist){
      if(this.disabled) return;
      var not = new Notification(track, 
         {icon: icon, //"images/play.png"
         body: artist, 
         //tag: "TRACK"
      });
      var that = this;
      not.onshow = function() {
         setTimeout(function() {not.close();}, that.waitTime);
         //setTimeout(not.close, 1500) 
      }
   }



}
toast = new Toast();
