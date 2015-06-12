
var EventEmitter = require('eventemitter3');
var util =require('util');
var path =require('path');
var fs =require('fs');


// simple FIFO Queue for avoiding memory leak
function getCache (max) {
  max = max || 1000;
  var cache = {}, keys = [];

  return {
    set: function( key, value ) {
      if ( keys.length > max ) delete cache[ keys.shift() ];
      keys.push(key);
      return (cache[key] = value);
    },
    get: function(key) {
      return cache[key];
    },
    del: function(key){
      var index = keys.indexOf( key );
      if(~index){ keys.splice(index, 1) }
      delete cache[key]
    }
  };
}

var FileStorm = function( filename ){
  EventEmitter.call(this);
  this.filename = path.resolve( filename );
  this.status = FileStorm.IDLE;
  this.pending = {
    content: null,
    callback: null,
    options: null
  }
}

util.inherits(FileStorm, EventEmitter); 

var IDLE = 1;
var PENDING = 2;
var WRITING = 3;

var fo = FileStorm.prototype;

fo.write = function( content, options, callback ){

  var filename = this.filename;

  if( typeof options === 'function' ) {
    callback = options;
    options = 'utf8';
  }

  if( !options ) options = 'utf8';

  var status = this.status;
  var pending = this.pending;
  var self = this;

  if( status  === PENDING || status === WRITING ){

    if( pending.callback ) pending.callback(null, 0)

    pending.content = content;
    pending.callback = callback;
    pending.options = options;

    return this;
  }

  this.status = PENDING;

  pending.content = content;
  pending.callback = callback;
  pending.options = options;

  process.nextTick( function(){


    var callback = pending.callback;

    var content = pending.content;
    // avoid call twice
    pending.callback = null;

    self.status = WRITING;

    fs.writeFile( filename, typeof content === 'function'? content(): content, pending.options , function(err){
      self.status = IDLE;
      callback && callback(err, 1);
      if(err) self.emit('error', err)
      
      // after writeFile, you find the result is not the lastContent
      if( content !== pending.content ){
        self.write( pending.content, pending.options,  pending.callback);
      }else{ 
        // TODO:  we may need to notify developer when filewriter is over.
        self.emit('end', content);
      }
    })
  });
}


fo.destroy = function(){
  cache.del(this.filename);
}


var cache = FileStorm.cache = getCache(1000);

module.exports = function (filename){
  // make sure one file touch same pending
  filename = path.resolve(filename);

  return cache.get(filename) || cache.set(filename, new FileStorm(filename))

}

module.exports.FileStorm = FileStorm;

