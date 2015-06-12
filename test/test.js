
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

  it("should emit 'end' seperate when after", function( done ){
    var filename =  path.join(__dirname, './data/it4.txt')
    var writer = fstorm(filename);
    var endCount = 0;

    writer.on('end', function(){
      endCount++;

      if(endCount === 2){
        var content = fs.readFileSync(filename, 'utf8');
        expect(content).to.be.equal('2');
        done();
      }
    })

    writer.write('1', function(err, status){
      setTimeout(function(){
        writer.write('2');
      },0)
      
    })

  })
  it("should emit 'error' if any errors occurred", function( done ){
    var filename =  path.join(__dirname, './data/xxx/it4.txt') // dir is not exist
    var writer = fstorm(filename);
    var endCount = 0;

    writer.on('error', function(err){
      expect(err.code).to.equal('ENOENT')
      done();
    })

    writer.write('1')

  })

  it('writer.destroy should remove the instance from cache', function(){
    var filename =  path.join(__dirname, './data/xxx/it5.txt') // dir is not exist
    var writer1 = fstorm(filename);
    var writer2 = fstorm(filename);
    expect(writer1).to.equal(writer2);

    writer1.destroy();

    var writer3 = fstorm(filename);
    expect(writer3).to.not.equal(writer1)
  })

  it('writer.write accept function as content', function(done){
    var filename =  path.join(__dirname, './data/it6.txt')
    var writer = fstorm(filename);
    var endCount = 0;

    writer.on('end', function(){

      var content = fs.readFileSync(filename, 'utf8');

      expect( content ).to.eql(JSON.stringify({code:5}));

      done();
    })

    writer.write(function(){return JSON.stringify({code:2})})
    writer.write(function(){return JSON.stringify({code:3})})

    process.nextTick(function(){
      writer.write(function(){return JSON.stringify({code:4})})
      process.nextTick(function(){
        writer.write(function(){return JSON.stringify({code:5})})
      })
      
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
