// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Constructor - no need to invoke directly, call initBackgroundPage instead.
 * @constructor
 * @param {String} url_request_token The OAuth request token URL.
 * @param {String} url_auth_token The OAuth authorize token URL.
 * @param {String} url_access_token The OAuth access token URL.
 * @param {String} consumer_key The OAuth consumer key.
 * @param {String} consumer_secret The OAuth consumer secret.
 * @param {String} oauth_scope The OAuth scope parameter.
 * @param {Object} opt_args Optional arguments.  Recognized parameters:
 *     "app_name" {String} Name of the current application
 *     "callback_page" {String} If you renamed chrome_ex_oauth.html, the name
 *          this file was renamed to.
 */

function SpotifyAuth(consumer_key, consumer_secret, oauth_scope){
  this.client_key = consumer_key;
  this.client_secret = consumer_secret;
  this.scope = oauth_scope;

}


SpotifyAuth.prototype.logout = function(){
  SpotifyAuth.prototype.clearTokens();
}
/**
 * Clears any OAuth tokens stored for this configuration.  Effectively a
 * "logout" of the configured OAuth API.
 */
SpotifyAuth.prototype.clearTokens = function() {
  localStorage.removeItem(this.key()+".user");
  localStorage.removeItem(this.key()+".icon");
  localStorage.removeItem(this.key()+".access");
  localStorage.removeItem(this.key()+".refresh");
};

SpotifyAuth.prototype.unauthorize = function(){
  this.clearTokens();
}

/**
 * Returns whether a token is currently stored for this configuration.
 * Effectively a check to see whether the current user is "logged in" to
 * the configured OAuth API.
 * @return {Boolean} True if an access token exists.
 */
SpotifyAuth.prototype.hasAccessToken = function() {
  return this.getAccessToken() != undefined;
};



SpotifyAuth.prototype.key = function(){
  return 'spotify.'+this.client_key + "." + encodeURI(this.oauth_scope);
}
/**
 * Stores an OAuth token for the configured scope.
 * @param {String} token The token to store.
 */
SpotifyAuth.prototype.setRefreshToken = function(refresh) {
  localStorage[this.key()+".refresh"] = refresh
};
SpotifyAuth.prototype.setAccessToken = function(access) {
  localStorage[this.key()+".access"] = access
};
SpotifyAuth.prototype.setUserInfo = function(name,icon){
  localStorage[this.key()+".user"] = name;
  localStorage[this.key()+".icon"] = icon;
}

SpotifyAuth.prototype.getUserInfo = function(){
  var user = {};
  user.user = localStorage[this.key()+".user"]
  user.icon = localStorage[this.key()+".icon"]
  if(user.icon == "undefined"){
    user.icon = undefined;
  }
  return user;

}
SpotifyAuth.prototype.hasUserInfo = function(){
  return localStorage[this.key()+".user"] != undefined;
}
/**
 * Retrieves any stored token for the configured scope.
 * @return {String} The stored token.
 */
SpotifyAuth.prototype.getRefreshToken = function() {
  return localStorage[this.key()+".refresh"];
};

SpotifyAuth.prototype.getAccessToken = function() {
  return localStorage[this.key()+".access"];
};

SpotifyAuth.prototype.isLoggedIn = function(){
    return this.hasAccessToken() && this.hasUserInfo();
}
SpotifyAuth.prototype.refreshToken = function(cbk){
  var url="https://accounts.spotify.com/api/token";
  var args = {
    grant_type:"refresh_token",
    refresh_token:this.getRefreshToken()
  }
  var code = this.client_key  + ":" + this.client_secret
  var encoded = btoa(code); //encode base64
  $.ajax({
    url:url,
    data:args,
    method:"POST",
    headers: {
      'Authorization': 'Basic ' + encoded
    },
    success:function(resp){
      cbk(resp);
    },
    error:function(err){
      console.log("REFRESH FAILED",err)
      cbk(null,err)
    }
  })
}


SpotifyAuth.prototype.authorize = function(callback) {
  if (!this.hasAccessToken()) {
      var that = this;
      this.getRequestCode(function(code,redir) {
        if(code != null){
          that.requestAccessToken(code,redir,function(data,status){
            if(that.hasAccessToken()){
              console.log("access token granted.")
              that.requestUserInfo(callback)
            }
            else{
              callback(data,status)
            }
          });
        }
        else {
          callback(null,redir)
        }
      });
    
  } else {
    callback(this.getAccessToken());
  }
};



//execute an authenticated request, given a user token
SpotifyAuth.prototype.REQ_SELF = function(type,headers, url,args,succ_cbk,fail_cbk,tries){
      if(!this.isLoggedIn()){
         return fail_cbk("not logged in.");
      }
      var uinfo = this.getUserInfo();
      var full_url = url(uinfo.user);
      if(full_url == undefined){
        console.log("undefined url");
        return null;
      }
      if(tries == undefined){
        tries = 0;
      }
      var that = this;
      var refresh_if_expired = function(error,status){
          if(error.responseText == ""){
            return fail_cbk(null,error,status);
          }
          var resp = $.parseJSON(error.responseText)
          if(resp.error.status == 401 && resp.error.message == "The access token expired" && tries < 1){
            that.refreshToken(function(data,err){
              if(data != null){
                console.log(data)
                that.setAccessToken(data.access_token)
                that.REQ_SELF(type,headers,url,args,succ_cbk,fail_cbk,tries+1)
              }
              else{
                fail_cbk(null,error,status)
              }
            })
          }
          else{
              if(fail_cbk == undefined){
                return;
              }
              fail_cbk(null,error);
          }
      }
      headers["Authorization"] = 'Bearer ' + this.getAccessToken()

      $.ajax({
        url:full_url,
        data:args,
        dataType:"json",
        method:type,
        headers: headers,
        success:function(data){
          console.log(data)
          succ_cbk(data)
        },
        error:function(error,status){
          refresh_if_expired(error,status)
        }
      })

      return true;
}

SpotifyAuth.prototype.GET_USER = function(url,args,succ_cbk,fail_cbk){
  var headers = {};
  headers["Content-Type"] = "application/json"
  this.REQ_SELF("GET",headers,url,args,succ_cbk,fail_cbk)
}

SpotifyAuth.prototype.POST_USER = function(url,args,succ_cbk,fail_cbk){
  var headers = {};
  headers["Content-Type"] = "application/json"
  this.REQ_SELF("POST",headers,url,args,succ_cbk,fail_cbk)
}

SpotifyAuth.prototype.PUT_USER = function(url,args,succ_cbk,fail_cbk){
  var headers = {};
  headers["Content-Type"] = "application/json"
  this.REQ_SELF("PUT",headers,url,args,succ_cbk,fail_cbk)
}
//execute an authenticated request, given a user token
SpotifyAuth.prototype.REQ = function(type,headers,url,args,succ_cbk,fail_cbk,tries){
      if(!this.hasAccessToken()){
         return false;
      }
      if(tries == undefined){
        tries = 0;
      }
      var refresh_if_expired = function(error){
          if(error.responseText == ""){
            return fail_cbk(null,error)
          }
          var resp = $.parseJSON(error.responseText)
          console.log("ERROR",error,resp)
          if(resp.error.status == 401 && resp.error.message == "The access token expired"){
            that.refreshToken(function(data,err){
              if(data != null){
                that.setAccessToken(data.access_token)
                console.log("RESP",data)
                that.REQ(type,headers,url,args,succ_cbk,fail_cbk,tries+1)
              }
              else{
                fail_cbk(null,error)
              }
            })
          }
          else{
              if(fail_cbk == undefined){
                return;
              }
              fail_cbk(null,error);
          }
      }

      

      headers["Authorization"] = 'Bearer ' + this.getAccessToken()

      $.ajax({
        url:url,
        type:type,
        headers: headers,
        success:function(data){
          succ_cbk(data)
        },
        error:function(err){
          refresh_if_expired(err);
        }
        })

      return true;
}

SpotifyAuth.prototype.GET = function(url,args,succ_cbk,fail_cbk){
  var headers = {};
  this.REQ("GET",headers,url,args,succ_cbk,fail_cbk)
}

SpotifyAuth.prototype.POST = function(url,args,succ_cbk,fail_cbk){
  var headers = {};
  this.REQ("POST",headers,url,args,succ_cbk,fail_cbk)
}


SpotifyAuth.prototype.getRequestCode = function(callback) {
  if (typeof callback !== "function") {
    throw new Error("Specified callback must be a function.");
  }
  var url =  "https://accounts.spotify.com/authorize";
  var redirect_url = to_chrome_extension_url("oauth/spotify_auth");
  var args = {
    "client_id":this.client_key,
    "scope":this.scope,
    "redirect_uri": redirect_url,
    "response_type": "code",
    "state": "req-code"
  }
  chrome.identity.launchWebAuthFlow(
    {
      'url': to_url(url,args), 
      'interactive': true
    },
    function(redir_resp) { 
      var args = $.parseURL(redir_resp);
      if(args.state == "req-code"){
        var code = args.code;
        callback(code,redirect_url);
      }
      else{
        callback(null,"waiting for correct response code.")
      }
      /* Extract token from redirect_url */ 
  });
}

SpotifyAuth.prototype.requestAccessToken = function(code,redirect_url,cbk){
  var url = "https://accounts.spotify.com/api/token"
  if(code == undefined || code == null){
      return;
  }
  args = {
    code:code,
    grant_type:"authorization_code",
    redirect_uri:redirect_url,
    client_id:this.client_key,
    client_secret:this.client_secret
  }
  var that = this;
  $.post(url,args,function(args){
    var refresh_token = args.refresh_token;
    var access_token = args.access_token;
    that.setRefreshToken(refresh_token);
    that.setAccessToken(access_token)
    cbk(access_token);
  })
  .fail(function(msg){
    cbk(null,msg);
  })

}

SpotifyAuth.prototype.requestUserInfo = function(cbk){
  var url = "https://api.spotify.com/v1/me";
  var that = this;
  this.GET(url,{},function(data,status){
    that.setUserInfo(data.id,data.images[0])
    console.log("retrieved user info")
    cbk(data,status)
  })
}

