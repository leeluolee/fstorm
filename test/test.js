
var expect = require('expect.js');
var async = require('async');
var chalk = require('chalk');
var fstorm = require('../');
var fs = require('fs');



var path = require('path');
require('../benchmark/test.js');

describe( "FileStorm", function(){
  it("only last filecontent should be written", function(done){
    var filename =  path.join(__dirname, './data/it1.txt')
    var writer = fstorm(filename);
    writer.once('end', function(){
      var content = fs.readFileSync(filename, 'utf8');
      expect(content).to.be.equal('999')
      done();
    })
    for(var i = 0; i < 1000; i++ ){
      writer.write(i)
    }
  })

  it("only last callback should be successed", function(done){
    var filename =  path.join(__dirname, './data/it2.txt')
    var writer = fstorm(filename);
    var errorCount = 0;
    var successCount = 0;
    for(var i = 0; i < 1000; i++ ){
      writer.write(i, function(err, status){
        if( status === 0) errorCount++;
        else successCount++;
      })
    }
    writer.once('end', function(){
      var content = fs.readFileSync(filename, 'utf8');
      expect(content).to.be.equal('999')
      expect(successCount).to.equal(1)
      expect(errorCount).to.equal(999)
      done();
    })
  })

  it("should work in async mode", function(done){
    var filename =  path.join(__dirname, './data/it3.txt')
    var writer = fstorm(filename);
    var errorCount = 0;
    var successCount = 0;
    for(var i = 0; i < 1000; i++ ){
      process.nextTick(function(i){
        writer.write(i, function(err, status){
          if( status === 0) errorCount++;
          else successCount++;
        })
      }.bind(this,i))
    }
    writer.once('end', function(){
      var content = fs.readFileSync(filename, 'utf8');
      expect(content).to.be.equal('999')
      expect(successCount).to.equal(1)
      expect(errorCount).to.equal(999)
      done();
    })
  })
  it("should work in async combine with sync mode", function(done){
    var filename =  path.join(__dirname, './data/it4.txt')
    var writer = fstorm(filename);
    var errorCount = 0;
    var successCount = 0;
    for(var i = 0; i < 1000; i++ ){
      if( i % 2){
        writer.write(i)
      }else{
        // last one 
        process.nextTick(function(i){
          writer.write(i)
        }.bind(this,i))
      }
    }
    writer.once('end', function(){
      var content = fs.readFileSync(filename, 'utf8');
      expect(content).to.be.equal('998')
      done();
    })
  })
  after(function(){
    fs.readdir(path.join(__dirname, './data'), function(error, filenames){
      filenames.forEach(function( filename ){
        if(path.extname(filename) === '.txt'){
          fs.unlink( path.join(__dirname, 'data' , filename), function(err){
            if(err) throw err
          })
        }
      })
    }) 
  })

})
