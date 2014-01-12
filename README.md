croquis.js
==========

The library for making web drawing tool.


croquis.js is porting to TypeScript now
---------------------------------------
[![travis](https://travis-ci.org/disjukr/croquis.js.png)](https://travis-ci.org/disjukr/croquis.js)

__Prerequisites__:

* [TypeScript](http://www.typescriptlang.org/) 0.9.5 or greater
* [CasperJS](http://casperjs.org/) 1.1 or greater

`tsc @tsc-args.txt` to compile

`npm test` to test


Features
--------

 * Layer
 * History
 * Stabilizer
 * Brush pointer
 * Tablet pressure
 * No dependencies


Basic example: sketch pad
-------------------------

```javascript
/**
You can sketch on screen by dragging.
If you drawing on wacom tablet then line size is controlled by tablet pressure.
*/

// initialization
var croquis = new Croquis();
croquis.setCanvasSize(400, 300);
croquis.addLayer();
croquis.fillLayer('#abc');

// croquis dom element
document.body.appendChild(croquis.getDOMElement());

// mouse event
document.addEventListener('mousedown', function (e) {
    croquis.down(e.clientX, e.clientY);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});
function onMouseMove(e) {
    croquis.move(e.clientX, e.clientY);
}
function onMouseUp(e) {
    croquis.up(e.clientX, e.clientY);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}
```
You can find more examples on [here](https://github.com/crosspop/Croquispop)


Projects using croquis.js
-------------------------

### [Crosspop croquis](https://crosspop.in/croquis/)
[![Crosspop croquis](http://i.imgur.com/I9fFZMs.png)](https://crosspop.in/croquis/)


License
-------

Distributed under BSD license