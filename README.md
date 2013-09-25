# croquis.js

### The library for making web drawing tool.

_(hit spacebar to see next page)_


<!-- >>> -->
## Am I need to use croquis.js?

If you have no much time but want beaut function
like __layer__, __history(undo and redo)__, __photoshop-like brush__, etc...
then __yes__.

`croquis.js` supports cross browser and
provides many useful function to develop drawing tool.


<!-- >>> -->
## Then how to using croquis.js?

First, you need to make the instance of `Croquis`:

```javascript
var croquis = new Croquis();
croquis.setCanvasSize(400, 300);
```

and append `croquis`'s dom element on document:

```javascript
var domElement = croquis.getDOMElement();
document.body.appendChild(domElement);
```


<!-- vvv -->
### Add & Select layer

You can see nothing now because there is no layer at first.

so add filled layer and select for drawing like this:

```javascript
croquis.addLayer();
croquis.fillLayer('#fff');
croquis.selectLayer(0); // layer index is starting from 0
```


<!-- vvv -->
### Draw on canvas

To draw on `croquis`, you need to call
`croquis.down(x, y)`, `croquis.move(x, y)`, `croquis.up(x, y)` sequentially.

Call `down` just one time at the beginning and call `up` at the ending.

```javascript
var mouseX, mouseY;
// Assume these are the local coordinate on canvas

document.addEventListener('mousedown', function () {
    croquis.down(mouseX, mouseY);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});
function onMouseMove() {
    croquis.move(mouseX, mouseY);
}
function onMouseUp() {
    croquis.up(mouseX, mouseY);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}
```


<!-- vvv -->
### Make your own tool

Just define `setContext`, `down`, `move`, `up` member,
then you can set your tools to `croquis`.

```javascript
var tool = {
    setContext: function (context) {},
    down: function (x, y, pressure) {},
    move: function (x, y, pressure) {},
    up: function (x, y, pressure) {return dirtyRect}
};
croquis.setTool(tool);
```


<!-- vvv -->
`setContext(context: CanvasRenderingContext2D)`

called after `croquis.setTool(tool)`.
It provides the context to paint.

<br>
`tick()`

called when every `tick`.
You can set the interval of `tick` by `croquis.setTickInterval(interval)`.

<br>
`down(x: number, y: number, pressure: number)`

called after `croquis.down(x, y, pressure)`.
x, y is the local coordinate of canvas,
and pressure is tablet pen pressure value in range of [0, 1].

<br>
`move(x: number, y: number, pressure: number)`

Same as `down`.

<!-- vvv -->
<br>
`up(x: number, y: number, pressure: number)`

If it returns dirty rectangle information(consist of x, y, width, height),
then `croquis` saves history data only in the rect.

Rest of it is same as `down`.


<!-- vvv -->
### You have history function already

Undo and Redo is very important feature in drawing tool.

But don't worry. You just need to call `croquis.undo` and `croquis.redo`.

You can set the limitation of undo by `croquis.setUndoLimit(limit)`.


<!-- vvv -->
### Adding stabilizer easily


<!-- >>> -->
## bonus

### default brush tool

### use tool in tool

### brush pointer

### flood fill

### dirty rect

### transaction


<!-- >>> -->
## The goal of croquis.js

Make artists making their own drawing tool by `croquis.js`


<!-- >>> -->
## Future plan

 * Port to [Typescript](http://www.typescriptlang.org/)
 * Make fully customizable