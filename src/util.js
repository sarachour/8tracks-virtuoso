(function($) {
var re = /([^&=]+)=?([^&]*)/g;
var decodeRE = /\+/g;  // Regex for replacing addition symbol with a space
var decode = function (str) {return decodeURIComponent( str.replace(decodeRE, " ") );};
$.parseParams = function(query) {
    var params = {}, e;
    while ( e = re.exec(query) ) { 
        var k = decode( e[1] ), v = decode( e[2] );
        if (k.substring(k.length - 2) === '[]') {
            k = k.substring(0, k.length - 2);
            (params[k] || (params[k] = [])).push(v);
        }
        else params[k] = v;
    }
    return params;
};
$.parseURL = function(url){
  return $.parseParams(url.split('?')[1])
}
})(jQuery);

var to_chrome_extension_url = function(relative){
  return chrome.identity.getRedirectURL(relative)
}
var to_url = function(base,args){
  var sargs=$.param(args)
  var full= base+"?"+sargs;
  return full;
}
var get_args  =function(url){
  var queries = {};
  $.each(document.location.search.substr(1).split('&'), function(c,q){
      var i = q.split('=');
      queries[i[0].toString()] = i[1].toString();
  });
}