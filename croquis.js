var tabletPlugin = getTabletPlugin();
function getTabletPlugin() {
    return document.querySelector(
        'object[type=\'application/x-wacomtabletplugin\']');
}
function getPenAPI() {
    var plugin = tabletPlugin || getTabletPlugin();
    if (plugin)
        return plugin.penAPI;
    else {
        plugin = document.createElement('object');
        plugin.type = 'application/x-wacomtabletplugin';
        plugin.style.position = 'absolute';
        plugin.style.top = '-1000px';
        document.body.appendChild(plugin);
        return null;
    }
}
var tabletapi = {
    pressure: function () {
        var pen = getPenAPI();
        return (pen && pen.pointerType)? pen.pressure : 1;
    },
    isEraser: function () {
        var pen = getPenAPI();
        return pen? pen.isEraser : false;
    }
}

function Croquis() {
    var self = this;
    var domElement = document.createElement('div');
    domElement.style.clear = 'both';
    domElement.style.setProperty('user-select', 'none');
    domElement.style.setProperty('-webkit-user-select', 'none');
    domElement.style.setProperty('-ms-user-select', 'none');
    domElement.style.setProperty('-moz-user-select', 'none');
    self.getDOMElement = function () {
        return domElement;
    }
    var undoStack = [];
    var redoStack = [];
    var undoLimit = 10;
    var preventPushUndo = false;
    self.getUndoLimit = function () {
        return undoLimit;
    }
    self.setUndoLimit = function (limit) {
        undoLimit = limit;
    }
    self.lockHistory = function () {
        preventPushUndo = true;
    }
    self.unlockHistory = function () {
        preventPushUndo = false;
    }
    function pushUndo(undoFunction) {
        if (preventPushUndo)
            return;
        redoStack = [];
        undoStack.push(undoFunction);
        while (undoStack.length > undoLimit)
            undoStack.shift();
    }
    self.undo = function () {
        if (preventPushUndo)
            throw 'history is locked';
        if (isDrawing || isStabilizing)
            throw 'still drawing';
        try {
            redoStack.push(undoStack.pop()());
        }
        catch (e) {
            throw 'no more undo data';
        }
    }
    self.redo = function () {
        if (preventPushUndo)
            throw 'history is locked';
        if (isDrawing || isStabilizing)
            throw 'still drawing';
        try {
            undoStack.push(redoStack.pop()());
        }
        catch (e) {
            throw 'no more redo data';
        }
    }
    function pushLayerOpacityUndo() {
        var snapshotIndex = layerIndex;
        var snapshotOpacity = self.getLayerOpacity();
        var swap = function () {
            self.lockHistory();
            var currentIndex = layerIndex;
            self.selectLayer(snapshotIndex);
            var temp = self.getLayerOpacity();
            self.setLayerOpacity(snapshotOpacity);
            snapshotOpacity = temp;
            self.selectLayer(currentIndex);
            self.unlockHistory();
            return swap;
        }
        pushUndo(swap);
    }
    function pushLayerVisibleUndo() {
        var snapshotIndex = layerIndex;
        var snapshotVisible = self.getLayerVisible();
        var swap = function () {
            self.lockHistory();
            var currentIndex = layerIndex;
            self.selectLayer(snapshotIndex);
            var temp = self.getLayerVisible();
            self.setLayerVisible(snapshotVisible);
            snapshotVisible = temp;
            self.selectLayer(currentIndex);
            self.unlockHistory();
            return swap;
        }
        pushUndo(swap);
    }
    function pushSwapLayerUndo(layerA, layerB) {
        var swap = function () {
            self.lockHistory();
            self.swapLayer(layerA, layerB);
            self.unlockHistory();
            return swap;
        }
        pushUndo(swap);
    }
    function pushAddLayerUndo(index) {
        var add = function () {
            self.lockHistory();
            self.addLayer(index);
            self.unlockHistory();
            return remove;
        }
        var remove = function () {
            self.lockHistory();
            self.removeLayer(index);
            self.unlockHistory();
            return add;
        }
        pushUndo(remove);
    }
    function pushRemoveLayerUndo(index) {
        var layer = layers[index];
        var layerContext = layer.getContext('2d');
        var w = layer.width;
        var h = layer.height;
        var snapshotData = layerContext.getImageData(0, 0, w, h);
        var add = function () {
            self.lockHistory();
            self.addLayer(index);
            var layer = layers[index];
            var layerContext = layer.getContext('2d');
            layerContext.putImageData(snapshotData, 0, 0);
            self.unlockHistory();
            return remove;
        }
        var remove = function () {
            self.lockHistory();
            self.removeLayer(index);
            self.unlockHistory();
            return add;
        }
        pushUndo(add);
    }
    function pushDirtyRectUndo(x, y, width, height) {
        var index = layerIndex;
        var layer = layers[index];
        var layerContext = layer.getContext('2d');
        var w = layer.width;
        var h = layer.height;
        x = Math.min(w, Math.max(0, x));
        y = Math.min(h, Math.max(0, y));
        width = Math.min(w, Math.max(0, width));
        height = Math.min(h, Math.max(0, height));
        if ((width == 0) || (height == 0)) {
            var doNothing = function () {
                return doNothing;
            }
            pushUndo(doNothing);
        }
        else {
            var swap = function () {
                layer = layers[index];
                layerContext = layer.getContext('2d');
                var tempData = layerContext.getImageData(x, y, width, height);
                layerContext.putImageData(snapshotData, x, y);
                snapshotData = tempData;
                return swap;
            }
            var snapshotData = layerContext.getImageData(x, y, width, height);
            pushUndo(swap);
        }
    }
    function pushContextUndo() {
        var layer = layers[layerIndex];
        pushDirtyRectUndo(0, 0, layer.width, layer.height);
    }
    /*
    외부에서 임의로 내부 상태를 바꾸면 안되므로
    getCanvasSize는 읽기전용 값을 새로 만들어서 반환한다.
    */
    var size = {width: 640, height: 480};
    self.getCanvasSize = function () {
        return {width: size.width, height: size.height};
    }
    self.setCanvasSize = function (width, height) {
        size.width = width = Math.floor(width);
        size.height = height = Math.floor(height);
        paintingLayer.width = width;
        paintingLayer.height = height;
        domElement.style.width = width + 'px';
        domElement.style.height = height + 'px';
        for (var i=0; i<layers.length; ++i) {
            var canvas = layers[i];
            var context = canvas.getContext('2d');
            var imageData = context.getImageData(0, 0, width, height);
            canvas.width = width;
            canvas.height = height;
            context.putImageData(imageData, 0, 0);
        }
    }
    self.getCanvasWidth = function () {
        return size.width;
    }
    self.setCanvasWidth = function (width) {
        self.setCanvasSize(width, size.height);
    }
    self.getCanvasHeight = function () {
        return size.height;
    }
    self.setCanvasHeight = function (height) {
        self.setCanvasSize(size.width, height);
    }
    var layers = [];
    var layerIndex = 0;
    /*
    포토샵 브러시의 opacity와 같은 효과를 주기 위해서
    화면에 그림을 그리는 툴들은 paintingLayer에 먼저 그림을 그린 다음
    마우스를 떼는 순간(up 함수가 호출되는 순간) 레이어 캔버스에 옮겨그린다.
    */
    var paintingLayer = document.createElement('canvas');
    paintingLayer.style.zIndex = 3;
    paintingLayer.style.position = 'absolute';
    domElement.appendChild(paintingLayer);
    var paintingContext = paintingLayer.getContext('2d');
    function layersZIndex() {
        /*
        paintingLayer가 들어갈 자리를 만들기 위해
        레이어의 zIndex는 2부터 시작해서 2 간격으로 설정한다.
        */
        for (var i=0; i<layers.length; ++i)
            layers[i].style.zIndex = i * 2 + 2;
    }
    self.getLayerThumbnail = function (index, width, height) {
        var layer = layers[index];
        var thumbnail = document.createElement('canvas');
        var thumbnailContext = thumbnail.getContext('2d');
        thumbnail.width = width;
        thumbnail.height = height;
        thumbnailContext.drawImage(layer, 0, 0, width, height);
        return thumbnail;
    }
    self.getLayers = function () {
        return layers.concat();
    }
    self.addLayer = function (index) {
        index = index || layers.length;
        pushAddLayerUndo(index);
        var layer;
        layer = document.createElement('canvas');
        layer.style.visibility = 'visible';
        layer.style.opacity = 1;
        layer.width = size.width;
        layer.height = size.height;
        layer.style.position = 'absolute';
        domElement.appendChild(layer);
        layers.splice(index, 0, layer);
        layersZIndex();
        self.selectLayer(layerIndex);
        if (self.onLayerAdded)
            self.onLayerAdded(index);
        return layer;
    }
    self.removeLayer = function (index) {
        index = index || layerIndex;
        pushRemoveLayerUndo(index);
        domElement.removeChild(layers[index]);
        layers.splice(index, 1);
        if (layerIndex == layers.length)
            self.selectLayer(layerIndex - 1);
        layersZIndex();
        if (self.onLayerRemoved)
            self.onLayerRemoved(index);
    }
    self.removeAllLayer = function () {
        while (layers.length)
            self.removeLayer(0);
    }
    self.swapLayer = function (layerA, layerB) {
        pushSwapLayerUndo(layerA, layerB);
        var layer = layers[layerA];
        layers[layerA] = layers[layerB];
        layers[layerB] = layer;
        layersZIndex();
        if (self.onLayerSwapped)
            self.onLayerSwapped(layerA, layerB);
    }
    self.getCurrentLayerIndex = function () {
        return layerIndex;
    }
    self.selectLayer = function (index) {
        if (tool.setContext)
            tool.setContext(null);
        var lastestLayerIndex = layers.length - 1;
        if (index > lastestLayerIndex)
            index = lastestLayerIndex;
        layerIndex = index;
        /*
        paintingLayer는 현재 선택된 레이어의 바로 위에 보여야 하므로
        현재 선택된 레이어보다 zIndex를 1만큼 크게 설정한다.
        */
        paintingLayer.style.zIndex = index * 2 + 3;
        if (tool.setContext)
            /*
            화면에 내용이 없는 paintingLayer에 지우개질을 하면
            의미가 없으므로 지우개 툴일 경우에는
            레이어의 context를 툴에 바로 적용한다.
            */
            if (eraserTool)
                tool.setContext(layers[index].getContext('2d'));
            else
                tool.setContext(paintingContext);
        if (self.onLayerSelected)
            self.onLayerSelected(index);
    }
    self.clearLayer = function () {
        pushContextUndo();
        var layer = layers[layerIndex];
        var context = layer.getContext('2d');
        context.clearRect(0, 0, size.width, size.height);
    }
    self.fillLayer = function (fillColor) {
        pushContextUndo();
        var layer = layers[layerIndex];
        var context = layer.getContext('2d');
        context.fillStyle = fillColor || toolColor;
        context.fillRect(0, 0, layer.width, layer.height);
    }
    self.getLayerOpacity = function () {
        var opacity = parseFloat(
            layers[layerIndex].style.getPropertyValue('opacity'));
        return Number.isNaN(opacity)? 1 : opacity;
    }
    self.setLayerOpacity = function (opacity) {
        pushLayerOpacityUndo();
        layers[layerIndex].style.opacity = opacity;
    }
    self.getLayerVisible = function () {
        var visible = layers[layerIndex].style.getPropertyValue('visibility');
        return visible != 'hidden';
    }
    self.setLayerVisible = function (visible) {
        pushLayerVisibleUndo();
        layers[layerIndex].style.visibility = visible ? 'visible' : 'hidden';
    }
    var tools = new Tools;
    var brush = tools.getBrush();
    var tool = brush;
    var toolName = 'brush';
    var eraserTool = false;
    var toolSize = 10;
    var toolColor = '#000';
    var toolOpacity = 1;
    var toolStabilizeLevel = 0;
    var toolStabilizeWeight = 0.8;
    var stabilizer = null;
    self.getTool = function () {
        return toolName;
    }
    self.setTool = function (name) {
        toolName = name.toLowerCase();
        switch (toolName) {
        case 'brush':
            tool = tools.getBrush();
            eraserTool = false;
            break;
        case 'eraser':
            tool = tools.getEraser();
            eraserTool = true;
            break;
        default:
            break;
        }
        self.setToolSize(toolSize);
        self.setToolColor(toolColor);
        self.selectLayer(layerIndex);
    }
    self.getToolSize = function () {
        return toolSize;
    }
    self.setToolSize = function (size) {
        toolSize = size;
        if (tool.setSize)
            tool.setSize(toolSize);
    }
    self.getToolColor = function () {
        return toolColor;
    }
    self.setToolColor = function (color) {
        toolColor = color;
        if (tool.setColor)
            tool.setColor(toolColor);
    }
    self.getToolOpacity = function () {
        return toolOpacity;
    }
    self.setToolOpacity = function (opacity) {
        toolOpacity = opacity;
    }
    /*
    손떨림 보정을 위한 추적 좌표 갯수를 설정한다.
    단계가 높을 수록 더 부드럽게 따라온다.
    */
    self.getToolStabilizeLevel = function () {
        return toolStabilizeLevel;
    }
    self.setToolStabilizeLevel = function (level) {
        toolStabilizeLevel = level < 0? 0 : level;
    }
    /*
    무게(가중치)라고 하면 가벼운 쪽이 숫자가 작은 게
    직관적일 것 같아 숫자를 뒤집었다.
    내부에서는 원래 가중치(0~1)대로 연산한다.
    보정 무게를 크게 설정할 수록 그림이 늦게 그려진다.
    */
    self.getToolStabilizeWeight = function () {
        return 1 - toolStabilizeWeight;
    }
    self.setToolStabilizeWeight = function (weight) {
        toolStabilizeWeight = 1 - Math.min(1, Math.max(0.05, weight));
    }
    self.getBrushFlow = brush.getFlow;
    self.setBrushFlow = function (flow) {
        brush.setFlow(flow);
    }
    self.getBrushInterval = brush.getInterval;
    self.setBrushInterval = function (interval) {
        brush.setInterval(interval);
    }
    self.getBrushImage = brush.getImage;
    self.setBrushImage = function (image) {
        brush.setImage(image);
    }
    var isDrawing = false;
    var isStabilizing = false;
    function _move(x, y, pressure) {
        if (tool.move)
            tool.move(x, y, pressure);
        if (self.onMoved)
            self.onMoved(x, y, pressure);
    }
    function _up(x, y, pressure) {
        isDrawing = false;
        isStabilizing = false;
        if (tool.up)
            tool.up(x, y, pressure);
        var layer = layers[layerIndex];
        /*
        지우개툴이 아니라면 paintingLayer에 그려진 내용이 있으므로
        현재 선택된 레이어에 paintingLayer를 옮겨 그린 뒤
        paintingLayer의 내용을 지운다.
        */
        if (!eraserTool) {
            var context = layer.getContext('2d');
            context.globalAlpha = toolOpacity;
            context.drawImage(paintingLayer, 0, 0, size.width, size.height);
            paintingContext.clearRect(0, 0, size.width, size.height);
        }
        if (self.onUpped)
            self.onUpped(x, y, pressure);
    }
    self.down = function (x, y, pressure) {
        if (isDrawing)
            return;
        pushContextUndo();
        isDrawing = true;
        pressure = pressure || tabletapi.pressure();
        var down = tool.down;
        var layer = layers[layerIndex];
        paintingLayer.style.opacity = layer.style.opacity * toolOpacity;
        paintingLayer.style.visibility = layer.style.visibility;
        if (toolStabilizeLevel > 0) {
            stabilizer = new Stabilizer;
            stabilizer.init(down, _move,
                toolStabilizeLevel, toolStabilizeWeight, x, y, pressure);
            isStabilizing = true;
        }
        else if (down != null)
            down(x, y, pressure);
        if (self.onDowned)
            self.onDowned(x, y, pressure);
    }
    self.move = function (x, y, pressure) {
        if (!isDrawing)
            return;
        pressure = pressure || tabletapi.pressure();
        if (stabilizer != null)
            stabilizer.move(x, y, pressure);
        else if (!isStabilizing)
            _move(x, y, pressure);
    }
    self.up = function (x, y, pressure) {
        if (!isDrawing)
            return;
        pressure = pressure || tabletapi.pressure();
        if (stabilizer != null)
            stabilizer.up(_up);
        else
            _up(x, y, pressure);
        stabilizer = null;
    }
}
Croquis.createAlphaThresholdBorder = function (brushImage, brushSize,
                                               threshold, antialias) {
    brushSize = brushSize | 0;
    threshold = threshold || 0x80;
    var pointer = document.createElement('canvas');
    var pointerContext = pointer.getContext('2d');
    var width;
    var height;
    if (brushSize == 0) {
        pointer.width = 1;
        pointer.height = 1;
        return pointer;
    }
    if (brushImage == null) {
        var halfSize = (brushSize * 0.5) | 0;
        pointer.width = width = brushSize;
        pointer.height = height = brushSize;
        pointerContext.fillStyle = '#000';
        pointerContext.beginPath();
        pointerContext.arc(halfSize, halfSize, halfSize, 0, Math.PI * 2);
        pointerContext.closePath();
        pointerContext.fill();
    }
    else {
        width = brushSize;
        height = brushSize * (brushImage.height / brushImage.width);
        pointer.width = width;
        pointer.height = height;
        pointerContext.drawImage(brushImage, 0, 0, width, height);
    }
    var pointerData = pointerContext.getImageData(0, 0, width, height);
    var d = pointerData.data;
    function getAlphaIndex(index) {
        return d[index * 4 + 3];
    }
    function setRedIndex(index, red) {
        d[index * 4] = red;
    }
    function getRedXY(x, y) {
        var red = d[((y * width) + x) * 4];
        return red? red : 0;
    }
    function getGreenXY(x, y) {
        var green = d[((y * width) + x) * 4 + 1];
        return green;
    }
    function setColorXY(x, y, red, green, alpha) {
        var i = ((y * width) + x) * 4;
        d[i] = red;
        d[i + 1] = green;
        d[i + 2] = 0;
        d[i + 3] = alpha;
    }
    //threshold
    var pixelCount = (d.length * 0.25) | 0;
    for (var i = 0; i < pixelCount; ++i)
        setRedIndex(i, (getAlphaIndex(i) < threshold)? 0 : 1);
    //outline
    var x;
    var y;
    for (x = 0; x < width; ++x) {
        for (y = 0; y < height; ++y) {
            if (!getRedXY(x, y)) {
                setColorXY(x, y, 0, 0, 0);
            }
            else {
                var redCount = 0;
                var left = x - 1;
                var right = x + 1;
                var up = y - 1;
                var down = y + 1;
                redCount += getRedXY(left, up);
                redCount += getRedXY(left, y);
                redCount += getRedXY(left, down);
                redCount += getRedXY(right, up);
                redCount += getRedXY(right, y);
                redCount += getRedXY(right, down);
                redCount += getRedXY(x, up);
                redCount += getRedXY(x, down);
                if (redCount != 8)
                    setColorXY(x, y, 1, 1, 255);
                else
                    setColorXY(x, y, 1, 0, 0);
            }
        }
    }
    //antialias
    if (antialias) {
        for (x = 0; x < width; ++x) {
            for (y = 0; y < height; ++y) {
                if (getGreenXY(x, y)) {
                    var alpha = 0;
                    if (getGreenXY(x - 1, y) != getGreenXY(x + 1, y))
                        setColorXY(x, y, 1, 1, alpha += 0x40);
                    if (getGreenXY(x, y - 1) != getGreenXY(x, y + 1))
                        setColorXY(x, y, 1, 1, alpha + 0x50);
                }
            }
        }
    }
    pointerContext.putImageData(pointerData, 0, 0);
    return pointer;
}

function Tools()
{
    var brush = new Brush;
    this.getBrush = function () {
        brush.setKnockout(false);
        return brush;
    }
    this.getEraser = function () {
        brush.setKnockout(true);
        return brush;
    }
}

function Stabilizer() {
    var interval = 5;
    var follow;
    var first;
    var last;
    var paramTable;
    var current;
    var moveCallback;
    var upCallback;
    this.init = function (down, move, level, weight, x, y, pressure) {
        follow = weight;
        paramTable = [];
        current = { x: x, y: y, pressure: pressure };
        moveCallback = move;
        upCallback = null;
        for (var i = 0; i < level; ++i)
            paramTable.push({ x: x, y: y, pressure: pressure });
        first = paramTable[0];
        last = paramTable[paramTable.length - 1];
        if (down != null)
            down(x, y, pressure);
        window.setTimeout(_move, interval);
    }
    this.move = function (x, y, pressure) {
        current.x = x;
        current.y = y;
        current.pressure = pressure;
    }
    this.up = function (up) {
        upCallback = up;
    }
    function dlerp(a, d, t) {
        return a + d * t;
    }
    function _move(justCalc) {
        var curr;
        var prev;
        var dx;
        var dy;
        var dp;
        var delta = 0;
        first.x = current.x;
        first.y = current.y;
        first.pressure = current.pressure;
        for (var i = 1; i < paramTable.length; ++i) {
            curr = paramTable[i];
            prev = paramTable[i - 1];
            dx = prev.x - curr.x;
            dy = prev.y - curr.y;
            dp = prev.pressure - curr.pressure;
            delta += Math.abs(dx);
            delta += Math.abs(dy);
            curr.x = dlerp(curr.x, dx, follow);
            curr.y = dlerp(curr.y, dy, follow);
            curr.pressure = dlerp(curr.pressure, dp, follow);
        }
        if (justCalc)
            return delta;
        if (upCallback != null) {
            while(delta > 1) {
                moveCallback(last.x, last.y, last.pressure);
                delta = _move(true);
            }
            upCallback(last.x, last.y, last.pressure);
        }
        else {
            moveCallback(last.x, last.y, last.pressure);
            window.setTimeout(_move, interval);
        }
    }
}

function Brush(canvasRenderingContext) {
    var context = canvasRenderingContext;
    this.clone = function () {
        var clone = new Brush(context);
        clone.setColor(this.getColor());
        clone.setFlow(this.getFlow());
        clone.setKnockout(this.getKnockout());
        clone.setSize(this.getSize());
        clone.setInterval(this.getInterval());
        clone.setImage(this.getImage());
    }
    this.getContext = function () {
        return context;
    }
    this.setContext = function (value) {
        context = value;
    }
    var color = '#000';
    this.getColor = function () {
        return color;
    }
    this.setColor = function (value) {
        color = value;
        transformedImageIsDirty = true;
    }
    var flow = 1;
    this.getFlow = function() {
        return flow;
    }
    this.setFlow = function(value) {
        flow = value;
        transformedImageIsDirty = true;
    }
    var knockout = false;
    var globalCompositeOperation = 'source-over';
    this.getKnockout = function () {
        return knockout;
    }
    this.setKnockout = function (value) {
        knockout = value;
        globalCompositeOperation = knockout? 'destination-out' : 'source-over';
    }
    var size = 10;
    this.getSize = function () {
        return size;
    }
    this.setSize = function (value) {
        size = value < 1 ? 1 : value;
        transformedImageIsDirty = true;
    }
    var interval = 0.05;
    this.getInterval = function () {
        return interval;
    }
    this.setInterval = function (value) {
        interval = value < 0.01 ? 0.01 : value;
    }
    var snapToPixel = false;
    this.getSnapToPixel = function () {
        return sanpToPixel;
    }
    this.setSnapToPixel = function (value) {
        sanpToPixel = value;
    }
    var image = null;
    var transformedImage = null;
    var transformedImageIsDirty = true;
    var imageRatio = 1;
    this.getImage = function () {
        return image;
    }
    this.setImage = function (value) {
        if (value == null) {
            transformedImage = image = null;
            imageRatio = 1;
            drawFunction = drawCircle;
        }
        else if (value != image) {
            image = value;
            imageRatio = image.height / image.width;
            transformedImage = document.createElement('canvas');
            drawFunction = drawImage;
            transformedImageIsDirty = true;
        }
    }
    var delta = 0;
    var prevX = 0;
    var prevY = 0;
    var lastX = 0;
    var lastY = 0;
    var prevScale = 0;
    var drawFunction = drawCircle;
    function transformImage() {
        transformedImage.width = size;
        transformedImage.height = size * imageRatio;
        var brushContext = transformedImage.getContext('2d');
        brushContext.clearRect(0, 0,
            transformedImage.width, transformedImage.height);
        brushContext.drawImage(image, 0, 0,
            transformedImage.width, transformedImage.height);
        brushContext.globalCompositeOperation = 'source-in';
        brushContext.fillStyle = color;
        brushContext.globalAlpha = flow;
        brushContext.fillRect(0, 0,
            transformedImage.width, transformedImage.height);
    }
    function drawCircle(size) {
        var halfSize = size * 0.5;
        context.fillStyle = color;
        context.globalAlpha = flow;
        context.beginPath();
        context.arc(halfSize, halfSize, halfSize, 0, Math.PI * 2);
        context.closePath();
        context.fill();
    }
    function drawImage(size) {
        if (transformedImageIsDirty)
            transformImage();
        try {
            context.drawImage(transformedImage, 0, 0, size, size * imageRatio);
        }
        catch (e) {
            drawCircle(size);
        }
    }
    function drawTo(x, y, size) {
        var halfSize = size * 0.5;
        context.save();
        if (snapToPixel)
            context.translate((x - halfSize) | 0,
                (y - halfSize * imageRatio) | 0);
        else
            context.translate(x - halfSize, y - halfSize * imageRatio);
        drawFunction(size);
        context.restore();
    }
    this.down = function(x, y, scale) {
        if (scale > 0 && context) {
            context.save();
            context.globalCompositeOperation = globalCompositeOperation;
            drawTo(x, y, size * scale);
            context.restore();
        }
        delta = 0;
        lastX = prevX = x;
        lastY = prevY = y;
        prevScale = scale;
    }
    this.move = function(x, y, scale) {
        if (scale > 0 && context) {
            var dx = x - prevX;
            var dy = y - prevY;
            var ds = scale - prevScale;
            var d = Math.sqrt(dx * dx + dy * dy);
            prevX = x;
            prevY = y;
            delta += d;
            var midScale = (prevScale + scale) * 0.5;
            var drawInterval = size * interval * midScale;
            if (drawInterval < 0.5) //not correct, but performance
                drawInterval = 0.5;
            if (delta < drawInterval) { //no need to draw
                prevScale = scale;
                return;
            }
            context.save();
            context.globalCompositeOperation = globalCompositeOperation;
            var scaleInterval = ds * (drawInterval / delta);
            var ldx = x - lastX;
            var ldy = y - lastY;
            var ld = Math.sqrt(ldx * ldx + ldy * ldy);
            if (ld < drawInterval) {
                lastX = x;
                lastY = y;
                prevScale = scale;
                drawTo(lastX, lastY, size * prevScale);
                delta -= drawInterval;
            } else {
                while(delta >= drawInterval) {
                    ldx = x - lastX;
                    ldy = y - lastY;
                    var dir = Math.atan2(ldy, ldx);
                    var tx = Math.cos(dir);
                    var ty = Math.sin(dir);
                    lastX += tx * drawInterval;
                    lastY += ty * drawInterval;
                    prevScale += scaleInterval;
                    drawTo(lastX, lastY, size * prevScale);
                    delta -= drawInterval;
                }
            }
            prevScale = scale;
            context.restore();
        }
        else {
            delta = 0;
            prevX = x;
            prevY = y;
            prevScale = scale;
        }
    }
}
