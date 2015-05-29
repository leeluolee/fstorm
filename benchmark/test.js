var saveFile = require('../')
var async = require('async')
var steno = require('steno')
var chalk = require('chalk')
var path = require('path')
var fs = require('fs')


var benchmarks = {

  "writeFileSync": function (time, cb){
    var pre = +new Date;
    var filename = "writeFileSync.txt";
    for (var i = 0; i < time; i++) {
      fs.writeFileSync(filename, i)
    }
    console.log('writeFile time: ' + (+new Date - pre) + 'ms')
    cb && cb();
  },
  "writeFile": function(time, cb){
    var filename = "writeFile.txt";
    var pre = +new Date
    var k = 0;
    for (var i = 0; i < time; i++) {
      fs.writeFile( filename , i, function(){
        if( ++k >= time){
          console.log( 'writeFile time ' +  (+new Date - pre) + 'ms' );
          cb && cb();
        }
      })
    }
  },
  "steno": function(time, cb){
    var pre = +new Date;
    var filename = "steno.txt";
    var sfile = steno(filename);
    var k =0;
    for (var i = 0; i < time; i++) {

      sfile.write(i, function(){
        if( ++k >= time){
          console.log( 'steno time ' +  (+new Date - pre) + 'ms' );
          cb && cb();
        }
      })
    }
  },
  "save-file": function( time, cb ){
    var pre = +new Date;
    var filename = "save-file.txt";
    var k =0;
    for (var i = 0; i < time; i++) {

      saveFile( filename, i, function(){
        if( ++k >= time){
          console.log( 'save-file time ' +  (+new Date - pre) + 'ms' );
          cb && cb();
        }
      }) 

    }
  }

}



var run = module.exports = function (tasks, time, cb){
  var index = -1;
  function next(){
    if(index !== -1){
      var filename = tasks[index] + '.txt';

      var fileContent =  fs.readFileSync(filename, 'utf8');
      var isError = fileContent !== '' + (time-1);
      console.log( chalk.white['bg' + (isError? 'Red': 'Green')](isError? 'Fail': 'Success'), ' result is "' + fileContent + '"');
    }
    if( index === tasks.length-1 ) return cb && cb();
    var task = tasks[++index];
    console.log("==================" + task+ "==========================")
    benchmarks[task]( time, next );
  }

  async.forEach(tasks, function( task, cb){
    fs.unlink( task +'.txt', cb)
  }, function(err){
    // if(err) console.log( err );
    next();
  })
}


var time = parseInt(process.argv[2] || 10000)


run(['save-file' , 'steno', 'writeFile', 'writeFileSync'  ], time )




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

