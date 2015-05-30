var async = require('async')
var steno = require('steno')
var chalk = require('chalk')
var fstorm = require('../')
var path = require('path')
var fs = require('fs')

var f = function(filename){
  return  path.join(__dirname, filename);
}

var benchmarks = {
  "writeFileSync": function(time, cb){

    var filename = f("writeFileSync.txt");
    var k = 0;

    function compelete(){
      k++
      if( (k >= time) && cb) cb()
    }
    for (var i = 0; i < time; i++) {
      fs.writeFileSync(filename, i)
      compelete()
    }
  },
  "writeFile": function(time, cb){
    var filename = f("writeFile.txt");
    var k = 0;
    function compelete(){
      k++;
      if( (k >= time) && cb) cb()
    }
    for (var i = 0; i < time; i++) {
      fs.writeFile( filename , i, compelete)
    }

  },
  // I try setCallback for steno, it is also fail to get realtime content.
  "steno": function(time, cb){
    var filename = f("steno.txt");
    var sfile = steno(filename);
    var k =0;

    function compelete(){
      k++;
      if( (k >= time) && cb) cb()
    }
    for (var i = 0; i < time; i++) {
      sfile.write(i, compelete)
    }
  },

  "fstorm": function( time, cb ){

    var filename = f("fstorm.txt");
    var k =0;
    var fwriter = fstorm(filename);

    fwriter.on('end', cb)

    for (var i = 0; i < time; i++) {
      fwriter.write(i) 
    }
  }

}



var run = module.exports = function (tasks, time, cb){
  var index = -1, pre;
  function next(){
    if(index !== -1){
      var filename = tasks[index] + '.txt';
      var fileContent =  fs.readFileSync( f(filename), 'utf8');
      var isError = fileContent !== '' + (time -1);
      console.log( chalk.blue(tasks[index] + ' time ' +  (+new Date - pre) + 'ms') );
      console.log( chalk.white['bg' + (isError? 'Red': 'Green')](isError? 'Fail': 'Success'), filename + ' result is "' + fileContent + '"');
      pre = +new Date;
    }
    if( index === tasks.length-1 ){

      return cb && cb();
    }
    var task = tasks[++index];
    console.log("==================" + task+ "==========================")
    benchmarks[task]( time, next );
  }

  async.forEach(tasks, function( task, cb){
    fs.unlink( f(task +'.txt'), cb)
  }, function(err){
    // if(err) console.log( err );
    pre = +new Date;
    next();
  })
}


var time = parseInt(process.argv[2] || 10000)


run(['fstorm' , 'steno', 'writeFile', 'writeFileSync'  ], time )




// var j =0;
// for (var i = 0; i <= 500; i++) {

//   if(i % 10){
//     fs.writeFile('file3.txt', i, function(err) {
//       if(err) console.log( err )
//     })
//   }else{
//     setImmediate(function(i){
//       fs.writeFile('file3.txt', i, function(err) {
//         if(err){ console.log(err, i) }
//         if(j++ >= 5000 ) console.log(+new Date - now)
//       })
//     }.bind(this, i))
//   }

// }

