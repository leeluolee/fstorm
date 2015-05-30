# fstorm

> writing file like a storm , but always get the desired result

A very very small idea for writing file more __'safety'__ and __'fast'__, inspired by steno, but more efficient and sensible.

## Usage

```
npm install fstrom
```

```js
var fstrom  = require('fstorm');

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





## What fstrom do?

I will take `writeFileSync`, `writeFile`, `steno` for comparison.

You can find this benchmark in [benchmark folder](https://github.com/leeluolee/save-file/tree/master/benchmark)

__source code__

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


### RESULT:

__10000x__

![image](https://cloud.githubusercontent.com/assets/731333/7858861/80452858-056e-11e5-87b6-3f1e7928f179.png)


__100000x__

![image](https://cloud.githubusercontent.com/assets/731333/7859015/b377e318-056f-11e5-9d69-f3702197a009.png)

__1000000x__

steno will pending without any response, the same as `writeFile` and  `writeFileSync` the same.



__About writeFile__

In steno's page. It mentioned that `writeFile` only take 20ms to writeFile, It is compeletely wrong.  In fact, when you run `fs.writeFile(..)`, It is only represent that the code is over, but file haven't been compelete yet.  Althought not fast as expected, but it is still much faster than `fs.writeFileSync`

__About steno__

steno's setCallback and write(content, callback) are both meanless for hook the content after writting.


__About writeFileSync__

It is really sloooooooooooooooow..., but it is really reliable, beacuse it execute every file writing one by one..

__fstorm!!__

Now, There is a more reasonable choice when you need to writing a file frequent, __only the last one will be kept__, and it is __dead fast__ beacuse some trick to avoid all unnecessary writing operation. 


## API

### `fstrom(filename)`

return a writer instance

- filename: the dest file's name

```js
var wirter = fstrom(filename);
```

### `writer.write( content[, options] [, callback])`

- content: the content you want to write
- options[Optional]: fstrom use `fs.writeFile(filename, options, callback)`. the options will be passed to it. default is 'utf8'
- callback(err, status): 
  - err: follow the 'node-callback-style', if any error is occurred, it will be return.
  - status: if status is 0, mean that this operation will be ignored beacuse of following writing operations . if status is 1, the content has been written successfully.

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

Temporary， only 'end' is emitted by writer, mean that writer is stable (or no new operation is blocked).

- end

```js

writer.on('end', function(content){
  console.log(content === '2') // true 
})

writer.write('1')

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

MITTTTTTTTTTTTTTTTTT.

