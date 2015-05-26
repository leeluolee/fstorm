var saveFile = require('../')
var steno = require('steno')
var path = require('path')
var fs = require('fs')
var time = 100000;

function syncWrite(){

  var pre = +new Date
  for (var i = 0; i < time; i++) {
    fs.writeFileSync('file1.txt', i)
  }
  console.log(+new Date - pre, 'sync')
  process.nextTick(asyncWrite)
}

// will throw error
function asyncWrite(){

  var pre = +new Date
  var k = 0;
  for (var i = 0; i < time; i++) {
    fs.writeFile('file2.txt', i, function(){
      if( ++k >= time){
        console.log(+ new Date - pre, 'async')
        process.nextTick(stenoWrite)
      }
    })
  }
}

function stenoWrite(){

  var pre = +new Date
  var k =0
  var sfile = steno('file3.txt')
  for (var i = 0; i < time; i++) {

    sfile.write(i, function(){
      if( ++k >= time){
        console.log(+ new Date - pre, 'steno', k)
        process.nextTick(saveWrite)
      }
    })
  }
}

function saveWrite(){
  var j =0;
  var pre = +new Date;
  for (var i = 0; i < time; i++) {

    saveFile('file4.txt', i, function(){
      if(++j >= time){
         console.log(+new Date - pre, 'save')
      }
    }) 
  }
}


// syncWrite();

// asyncWrite();

// stenoWrite();

// saveWrite()




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

