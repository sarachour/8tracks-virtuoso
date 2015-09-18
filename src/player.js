var Player = function(){
   this.init = function(){
      this.elem = $('<audio>', {
        autoPlay : 'autoplay',
        controls : 'controls',
        id : "player"
      });

      this.ctx = new AudioContext();
      this.gain = this.ctx.createGain();
      //this.src = this.ctx.createMediaElementSource(this.elem[0]);
   }
   this.setTime = function(time){
      this.elem[0].currentTime = time;
   }
   this.getDuration = function(){
      return this.elem[0].duration;
   }
   this.getTime = function(){
      return this.elem[0].currentTime;
   }
   this.getVolume = function(){
      return this.elem[0].volume;
   }
   this.onError = function(cbk){
      this.elem.error(cbk);
   }
   this.on = function(name,cbk){
      this.elem.bind(name,cbk);
   }
   this.load = function(src){
      console.log("load",src);
      this.elem.attr("src",src);
   }
   this.play = function(cbk){
      console.log("playing");
      this.elem.trigger("play",cbk);
   }
   this.pause = function(){
      this.elem.trigger("pause");
   }

   this.init();

}