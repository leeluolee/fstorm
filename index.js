
var fs =require('fs');
var path =require('path');

var pending = {};


module.exports = function (filename, content, options , callback){

  if(typeof options === 'function') {
    callback = options;
    options = 'utf8'
  }
  
  if(!options) options = 'utf8';

  // make sure one file touch same pending

  filename = path.resolve(filename);


  var preSeed = pending[filename];

  if(preSeed){
    preSeed.content = content
    if(preSeed.callback) preSeed.callback(null, 1);
    preSeed.callback = callback;

    return;
  }

  process.nextTick(function(){

    var content = seed.content;

    seed.status  = 1;

    fs.writeFile( filename, content, options , function(err){
      // after writeFile, you find the result is not the lastContent
      if(err && seed.callback) seed.callback(err);
      delete pending[filename];
      if( content !== seed.content ){
        helper.saveFile(filename, content);
      }
      if(seed.callback) seed.callback(null);
    })
  });

  var seed = pending[ filename ] = {
    status: 0,
    content: content,
    callback: callback
  }
}
