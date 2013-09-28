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

Add filled layer and select it to draw:

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

Just define `setContext`, `down`, `move`, `up` and `tick` member,
then you can set your tools to `croquis`.

```javascript
var tool = {
    setContext: function (context) {},
    down: function (x, y, pressure) {},
    move: function (x, y, pressure) {},
    up: function (x, y, pressure) {return dirtyRect},
    tick: function () {}
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
### There is knockout and opacity property already

You don't need considering of erasing function and opacity blending.

It processed in `croquis`'s layer level.

So if you make one tool, then you'll get corresponding eraser tool of it:

```javascript
croquis.setPaintingOpacity(true); // true to erase the canvas
croquis.setPaintingKnockout(0.5); // opacity value, 1 means 100%
```


<!-- vvv -->
### There is stabilizer already

Have you used stabilizer in sai-tool?
It helps to draw the line smoothly.

`croquis.js` have stabilizer implementation,
so you just need to set the value:

```javasript
croquis.setToolStabilizeLevel(10);
// Higher stabilizer level makes lines smoother. integer value.
croquis.setToolStabilizeWeight(0.5);
// Higher weight makes following slower. decimal number [0, 1].
```

So you've got opacity blending, erasing, stabilizing function
without writing any code for tool!


<!-- vvv -->
### You have history function already

Undo and Redo is very important feature in drawing tool.

But don't worry. You just need to call `croquis.undo` and `croquis.redo`.

You can set the limitation of undo by `croquis.setUndoLimit(limit)`.


<!-- >>> -->
## Bonus

Previous slides were just the skeleton of `croquis.js`.

Now let me show you the flesh.


<!-- vvv -->
### Use tool in tool

`croquis.js`'s tool is considered using tool in tool.

`croquis` object calls `tool.setContext` when
called after `croquis.setTool(tool)`.
It serves the context of canvas.

So if you want to use other tool in your tool,
just passing that context directly to sub tool.

```javascript
var tool = {};
var subTool = new AnyTool();
tool.setContext = function (context) {
    subTool.setContext(context);
};
tool.down = function (x, y, pressure) {
    subTool.down(x, y, pressure);
};
tool.move = function (x, y, pressure) {
    subTool.move(x, y, pressure);
};
tool.up = function (x, y, pressure) {
    return subTool.up(x, y, pressure);
    // returns dirty rectangle
};
tool.tick = function () {
    subTool.tick();
};
```


<!-- vvv -->
### Default brush tool

Implementing photoshop-like brush tool in short time is pretty hard.

The brush tool, which offerd by `croquis.js` have
`brush image`, `flow`, `spacing` properties like photoshop brush.

some properties like `spread` are under consideration.


<!-- vvv -->
### Brush pointer

`croquis.js` serves brush pointer to preview the outline of brush:

```javascript
Croquis.createBrushPointer(brushImage, brushSize,
                           threshold, antialias);
// it returns the <canvas> element
```


<!-- vvv -->
### Flood fill

There is no flood fill method in html5 context currently.

So `croquis.js` offers two method to rendering flood fill:

```javascript
croquis.floodFill(x, y, r, g, b, a, index);
// render flood fill on layer
Croquis.createFloodFill(canvas, x, y, r, g, b, a);
// render flood fill on new canvas
```


<!-- vvv -->
### Dirty rect

`croquis` swap the canvas data when called `undo` and `redo`.
dkaskdfasdfjask아 시간 부족 ㅠㅠ


<!-- vvv -->
### Transaction


<!-- >>> -->
## The goal of croquis.js

Make artists making their own drawing tool by `croquis.js`


<!-- >>> -->
## Future plan

 * Port to [Typescript](http://www.typescriptlang.org/)
 * Offer observer pattern event model (using callback currently)
 * Write test cases
 * Make fully customizable