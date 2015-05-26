
var fs =require('fs');
var pending = {};

module.exports = function (filename, content, callback){

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

    fs.writeFile( filename, content, 'utf8', function(err){
      // after writeFile, you find the result is not the lastContent
      if(err && seed.callback) seed.callback(err);
      pending[ filename ] = null;
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
