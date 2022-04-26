# fstorm [![Build Status](https://travis-ci.org/leeluolee/fstorm.svg?branch=master)](https://travis-ci.org/leeluolee/fstorm)

> Writing files like a storm in a reliable way

A small idea for writing file more __'safe'__ and __'faster'__. Inspired by steno, but more efficient and sensible.

__fstorm is very suitable when you need to frequently write to the same file.__



## What does fstorm do?

Take `writeFileSync`, `writeFile`, `steno` as an comparison.

You can also find this benchmark in the [benchmark folder](https://github.com/leeluolee/save-file/tree/master/benchmark)

### RESULT:

__10000x__

![image](https://cloud.githubusercontent.com/assets/731333/7897260/88d7268e-0707-11e5-8043-db2bf71cac49.png)


__100000x__

![image](https://cloud.githubusercontent.com/assets/731333/7897263/b8044bd0-0707-11e5-8472-8af75b2aa466.png)


__1000000x__

![image](https://cloud.githubusercontent.com/assets/731333/7897264/cc83038a-0707-11e5-8163-72b0f4a07fd1.png)

Steno is still pending without any response, the same is with `writeFile` and  `writeFileSync`





__About writeFile__

In Steno's page it mentioned that `writeFile` only take 20ms to finish, however it that is wrong. In fact, when you run `fs.writeFile(..)`, it is only saying that it finished, but it hasn't.  Although it is not as fast as expected, but it is still much faster than `fs.writeFileSync`

__About steno__

Steno's setCallback and write(content, callback) are both meanless for seeing the content after writting.


__About writeFileSync__

It is really sloooooooooooooooow..., yet reliable, as it re-executes every time for file writing.

__fstorm!!__

Now there is a more reasonable choice when you need to writing file frequently, __only the last write will be kept__, and it is __insanely fast__ beacuse there are some handy tricks to avoid unnecessary code.


__benchmark source code__

```js
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
  // I try setCallback for steno, it is also fail to get correct content.
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

    fwriter.on('end', cb) // emitted when a squence is over

    for (var i = 0; i < time; i++) {
      fwriter.write(i)
    }
  }

}
```

## Usage

```
npm install fstorm
```

```js
var fstorm  = require('fstorm');

var writer = fstorm('./file3.txt');

writer.on('end', function(){
  assert(fs.readFileSync('./file3.txt') === '7')
})

writer
  .write('1')
  .write('2')
  .write('3')
  .write('4')
  .write('5')
  .write('6')

process.nextTick(function(){
  writer
    .write('7')
})


```

## API



### `fstorm(filename)`

Returns a writer instance

- filename: the destination file's name

```js
var writer = fstorm(filename);
```

### `writer.write( content[, options] [, callback])`

- content: the content you want to write
- options[Optional]: fstorm can use `fs.writeFile(filename, options, callback)`. The options will be passed to it. Default is 'utf8'
- callback(err, status):
  - err: follow the 'node-callback-style', if any errors have occurred, it will run the function.
  - status: If status is 0, this mean that this operation will be ignored beacuse of following writing operations. If status is 1, this means the content has been written successfully.

__Example__


```js

writer.write('1', function(err, status){
  console.log(status)// ===> 0  
})

writer.write('2', function(err, status){
  console.log(status)// ===> 1  
})

```


### builtin event

__FstormWriter is a SubClass of EventEmitter. __

Temporarily， only `end` and `error` is emitted by writer, mean that writer is stable (or no new operation is blocked).

- end

```js

writer.on('end', function(content){
  console.log(content === '2') // true
})

writer.write('1')

writer.write('2')
```

- error

```js

var writer = fstorm('.folder/not/exists/db.json')

writer.on('error', function(err){
  assert(err.code === 'ENOENT')  // true
})

writer.write('2')

```


### Contribution

__benchmark__

```
npm run benchmark
```

__test__

```
npm test
```


### License

**MIT**
