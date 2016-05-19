

function Tracks8Auth(api_key){
  this.api_key = api_key;

}
Tracks8Auth.prototype.GET = function(url,args,success_cbk,fail_cbk){

      if(!this.isLoggedIn()){
         return fail_cbk(null,"not logged in.");
      }
      args.api_key = this.api_key;
      args.user_token = this.getUserToken();
      args.api_version= 3;
      
      $.get(url,args,success_cbk)
      .fail(function(args,status){
         fail_cbk(args,status)
      })
      return true;
}

Tracks8Auth.prototype.GET_STREAM = function(url,args,success_cbk,fail_cbk){   
   args.api_key = this.api_key;
   args.user_token = this.getUserToken();
   args.api_version= 3;
   var that  =this;
   if(!this.isLoggedIn()){
      return fail_cbk(null,"not logged in.")
   }
   else if(!this.isStreaming()){
      //get playback before making request
      this.requestPlaybackToken(function(){
         $.get(url(that.getPlaybackToken()), args, success_cbk)
         .fail(function(args,status){
            fail_cbk(args,status)
         })
      })
   }
   else{
      $.get(url(this.getPlaybackToken()), args, success_cbk)
      .fail(function(args,status){
         fail_cbk(args,status)
      })
   }
}

Tracks8Auth.prototype.isLoggedIn = function(){
   return this.getUserToken() != undefined
}
Tracks8Auth.prototype.isStreaming = function(){
   return this.getPlaybackToken() != undefined;
}
Tracks8Auth.prototype.clearTokens = function(){
   var suffixes = ["user_token","play_token","user","icon","email"];
   for(suff in suffixes){
      console.log(suff)
      localStorage.removeItem(this.key()+"."+suffixes[suff])
   }
}
Tracks8Auth.prototype.key = function(){
   return "8tracks.tokens";
}
Tracks8Auth.prototype.getPlaybackToken = function(){
   return localStorage[this.key()+".play_token"];
}
Tracks8Auth.prototype.getUserInfo = function(){
   var user_info = {};
   user_info.user = localStorage[this.key()+".user"];
   user_info.icon = localStorage[this.key()+".icon"];
   user_info.email = localStorage[this.key()+".email"];
   return user_info;
}
Tracks8Auth.prototype.getUserToken = function(){
   return localStorage[this.key()+".user_token"];
}

Tracks8Auth.prototype.setUserToken = function(user_token){
   localStorage[this.key()+".user_token"] = user_token;
}
Tracks8Auth.prototype.setPlaybackToken = function(playback_token){
   localStorage[this.key()+".play_token"] = playback_token;
}
Tracks8Auth.prototype.setUserInfo = function(user_info){
   localStorage[this.key()+".user"] = user_info.user;
   localStorage[this.key()+".icon"] = user_info.icon;
   localStorage[this.key()+".email"] = user_info.email;
}


Tracks8Auth.prototype.login = function(username, password, cbk){
      that = this;
      $.post(
         "https://8tracks.com/sessions.json",
         {api_key : this.api_key,
          login : username,
          password: password,
          api_version: 3},
            function(data, status) {
               if(data != null){
                  var args = {};
                  args.user = data.user.login;
                  args.icon = data.user.avatar_urls.sq56; 
                  args.email = data.user.email;
                  that.setUserToken(data.user.user_token);
                  that.setUserInfo(args);

                  that.requestPlaybackToken(function(data,status){
                     cbk(data, status)
                  })
               }
               else {
                  cbk(null,status)
               }
         }
      ).fail(function(e){ 
            cbk(null, e);
      });
}

Tracks8Auth.prototype.requestPlaybackToken = function(cbk){
      var url = "http://8tracks.com/sets/new.json"
      var that = this;
      $.get(
            url,
            {
               api_key : that.api_key,
               user_token : that.user_token,
               api_version: 3
            },
            function(data,status){
               that.setPlaybackToken(data.play_token);
               cbk(data,status);
            }
         )
      .fail(function(status){
         cbk(null,status)
      })
}


Tracks8Auth.prototype.logout = function(){
   this.clearTokens();
}