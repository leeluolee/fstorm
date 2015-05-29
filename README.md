# save-file

A very very small idea for writing file more __'safety'__ and __'fast'__, inspired by steno, but more efficient and sensible.

## Usage

```
npm install save-file
```

```js
var saveFile = require('save-file');

saveFile('./file3.txt', '1');
saveFile('./file3.txt', '2');
saveFile('./file3.txt', '3');
saveFile('./file3.txt', '4');
saveFile('./file3.txt', '5');
saveFile('./file3.txt', '6');

```


### API: `saveFile(filename, content [, callback])`

- filename: the file your need to write
- content: the content you want to write
- callback(err, status):
  - err: if any error is occurs, it will be return.
  - status: if status



The content will be always the last one that passed to saveFile and the operation is really fast beacuse of some tricks that I will mentioned later.


## what save-file do?

I will take `writeFileSync`, `writeFile`, `steno` for comparison.

First try, we assign `time` to `10000`;

you can find this benchmark in [https://github.com/leeluolee/save-file/tree/master/benchmark](https://github.com/leeluolee/save-file/tree/master/benchmark)

- writeFileSync

  ```js
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

  ```




- writeFile

> In steno's page. It mentioned that `writeFile` only take 2ms to writeFile, It is totally wrong.  In fact, when you run `fs.writeFile(..)`, It is only represent that the code is over, but file haven't been compelete yet.  Althought not fast as expected, but it is still much faster than `fs.writeFileSync`

```
```

RESULT

- steno


- save-file



### RESULT:

__10000x__

![image](https://cloud.githubusercontent.com/assets/731333/7858861/80452858-056e-11e5-87b6-3f1e7928f179.png)


__100000x__

![image](https://cloud.githubusercontent.com/assets/731333/7859015/b377e318-056f-11e5-9d69-f3702197a009.png)

__1000000x__

steno will pending without any response. `writeFile` and  `writeFileSync` the same.
