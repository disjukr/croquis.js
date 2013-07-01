init();

var croquis;

function init() {
    croquis = new Croquis(640, 480, true);
    croquis.addFilledLayer('#fff');
    croquis.addLayer();
    croquis.selectLayer(1);
    croquis.setLayerOpacity(1);
    croquis.setLayerVisible(true);
    croquis.setTool('brush');
    croquis.setToolSize(10);
    croquis.setToolColor('#000');
    croquis.setToolOpacity(1);
    croquis.setToolStabilizeLevel(10);
    croquis.setToolStabilizeWeight(0.2);
    var croquisDOMElement = croquis.getDOMElement();
    document.getElementById('canvas-area').appendChild(croquisDOMElement);
    function onMouseDown(e) {
        var mousePosition = getRelativePosition(e.clientX, e.clientY);
        croquis.down(mousePosition.x, mousePosition.y);
        document.addEventListener('mousemove', onMouseMove);
    }
    function onMouseMove(e) {
        var mousePosition = getRelativePosition(e.clientX, e.clientY);
        croquis.move(mousePosition.x, mousePosition.y);
    }
    function onMouseUp(e) {
        var mousePosition = getRelativePosition(e.clientX, e.clientY);
        croquis.up(mousePosition.x, mousePosition.y);
        document.removeEventListener('mousemove', onMouseMove);
    }
    function getRelativePosition(absoluteX, absoluteY) {
        var rect = croquisDOMElement.getBoundingClientRect();
        return {x: absoluteX - rect.left, y: absoluteY - rect.top};
    }
    croquisDOMElement.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
}

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

function Croquis(width, height, makeCheckers) {
    var domElement = document.createElement('div');
    domElement.style.clear = 'both';
    domElement.style.setProperty('user-select', 'none');
    domElement.style.setProperty('-webkit-user-select', 'none');
    domElement.style.setProperty('-ms-user-select', 'none');
    domElement.style.setProperty('-moz-user-select', 'none');
    /*
    배경이 투명하다는 것을 인식시키기 위한 체크무늬를 바닥에 붙인다.
    인터넷 익스플로러에서 zIndex가 0일 경우 제대로 작동하지 않으므로:
    http://brenelz.com/blog/squish-the-internet-explorer-z-index-bug/
    체크무늬의 zIndex를 1로 설정했다.
    */
    if (makeCheckers) {
        var backgroundCheckers = document.createElement('div');
        (function () {
            var backgroundImage = document.createElement('canvas');
            backgroundImage.width = backgroundImage.height = 20;
            var backgroundImageContext = backgroundImage.getContext('2d');
            backgroundImageContext.fillStyle = '#FFFFFF';
            backgroundImageContext.fillRect(0, 0, 20, 20);
            backgroundImageContext.fillStyle = '#CCCCCC';
            backgroundImageContext.fillRect(0, 0, 10, 10);
            backgroundImageContext.fillRect(10, 10, 20, 20);
            backgroundCheckers.style.backgroundImage = 'url(' +
                backgroundImage.toDataURL() + ')';
            backgroundCheckers.style.zIndex = 1;
            backgroundCheckers.style.position = 'absolute';
        })();
        domElement.appendChild(backgroundCheckers);
    }
    this.getDOMElement = function () {
        return domElement;
    }
    /*
    외부에서 임의로 내부 상태를 바꾸면 안되므로
    getCanvasSize는 읽기전용 값을 새로 만들어서 반환한다.
    */
    var size = {width: width, height: height};
    this.getCanvasSize = function () {
        return {width: sizw.width, height: size.height};
    }
    this.setCanvasSize = function (width, height) {
        size.width = width = Math.floor(width);
        size.height = height = Math.floor(height);
        paintingLayer.width = width;
        paintingLayer.height = height;
        domElement.style.width = backgroundCheckers.style.width =
            width + 'px';
        domElement.style.height = backgroundCheckers.style.height =
            height + 'px';
        for (var i=0; i<layers.length; ++i) {
            switch (layers[i].tagName.toLowerCase()) {
            case 'canvas':
                var canvas = layers[i];
                var context = canvas.getContext('2d');
                var imageData = context.getImageData(0, 0, width, height);
                canvas.width = width;
                canvas.height = height;
                context.putImageData(imageData, 0, 0);
                break;
            default:
                continue;
            }
        }
    }
    this.getCanvasWidth = function () {
        return size.width;
    }
    this.setCanvasWidth = function (width) {
        setCanvasSize(width, size.height);
    }
    this.getCanvasHeight = function () {
        return size.height;
    }
    this.setCanvasHeight = function (height) {
        setCanvasSize(size.width, height);
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
    this.setCanvasSize(width, height);
    function layersZIndex() {
        /*
        paintingLayer가 들어갈 자리를 만들기 위해
        레이어의 zIndex는 2 간격으로 설정한다.
        zIndex 1은 체크무늬가 사용하고 있으므로 2부터 시작한다.
        */
        for (var i=0; i<layers.length; ++i)
            layers[i].style.zIndex = i * 2 + 2;
    }
    this.getLayers = function () {
        return layers.concat();
    }
    this.addLayer = function (layerType) {
        var layer;
        layerType = layerType || 'canvas';
        switch (layerType.toLowerCase()) {
        case 'canvas':
            layer = document.createElement('canvas');
            layer.style.visibility = 'visible';
            layer.style.opacity = 1;
            layer.width = size.width;
            layer.height = size.height;
            break;
        default:
            throw 'unknown layer type';
            return null;
        }
        layer.style.position = 'absolute';
        domElement.appendChild(layer);
        layers.push(layer);
        if (layers.length == 1)
            this.selectLayer(0);
        layersZIndex();
        return layer;
    }
    this.addFilledLayer = function (fillColor) {
        var layer = this.addLayer('canvas');
        var context = layer.getContext('2d');
        context.fillStyle = fillColor || '#fff';
        context.fillRect(0, 0, layer.width, layer.height);
        return layer;
    }
    this.removeLayer = function (index) {
        domElement.removeChild(layers[index]);
        layers.splice(index, 1);
        if (layerIndex == layers.length)
            this.selectLayer(--layerIndex);
        layersZIndex();
    }
    this.swapLayer = function (index1, index2) {
        var layer = layers[index1];
        layers[index1] = layers[index2];
        layers[index2] = layer;
        layersZIndex();
    }
    this.selectLayer = function (index) {
        if (tool.setContext)
            tool.setContext(null);
        layerIndex = index;
        /*
        paintingLayer는 현재 선택된 레이어의 바로 위에 보여야 하므로
        현재 선택된 레이어보다 zIndex를 1만큼 크게 설정한다.
        */
        paintingLayer.style.zIndex = index * 2 + 3;
        switch (layers[index].tagName.toLowerCase()) {
        case 'canvas':
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
            break;
        default:
            break;
        }
    }
    this.setLayerOpacity = function (opacity) {
        layers[layerIndex].style.opacity = opacity;
    }
    this.setLayerVisible = function (visible) {
        layers[layerIndex].style.visibility = visible ? 'visible' : 'hidden';
    }
    var tools = new Tools;
    var tool = tools.getBrush();
    var eraserTool = false;
    var toolSize = 10;
    var toolColor = '#000';
    var toolOpacity = 1;
    var toolStabilizeLevel = 0;
    var toolStabilizeWeight = 0.8;
    var stabilizer = null;
    this.setTool = function (toolName) {
        switch (toolName.toLowerCase()) {
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
        this.setToolSize(toolSize);
        this.setToolColor(toolColor);
        this.selectLayer(layerIndex);
    }
    this.getToolSize = function () {
        return toolSize;
    }
    this.setToolSize = function (size) {
        toolSize = size;
        if (tool.setSize)
            tool.setSize(toolSize);
    }
    this.getToolColor = function () {
        return toolColor;
    }
    this.setToolColor = function (color) {
        toolColor = color;
        if (tool.setColor)
            tool.setColor(toolColor);
    }
    this.getToolOpacity = function () {
        return toolOpacity;
    }
    this.setToolOpacity = function (opacity) {
        toolOpacity = opacity;
    }
    /*
    손떨림 보정을 위한 추적 좌표 갯수를 설정한다.
    단계가 높을 수록 더 부드럽게 따라온다.
    */
    this.getToolStabilizeLevel = function () {
        return toolStabilizeLevel;
    }
    this.setToolStabilizeLevel = function (level) {
        toolStabilizeLevel = level < 0? 0 : level;
    }
    /*
    무게(가중치)라고 하면 가벼운 쪽이 숫자가 작은 게
    직관적일 것 같아 숫자를 뒤집었다.
    내부에서는 원래 가중치(0~1)대로 연산한다.
    보정 무게를 크게 설정할 수록 그림이 늦게 그려진다.
    */
    this.getToolStabilizeWeight = function () {
        return 1 - toolStabilizeWeight;
    }
    this.setToolStabilizeWeight = function (weight) {
        toolStabilizeWeight = 1 - Math.min(1, Math.max(0.05, weight));
    }
    this.getBrushFlow = tools.getBrush().getFlow;
    this.setBrushFlow = tools.getBrush().setFlow;
    this.getBrushInterval = tools.getBrush().getInterval;
    this.setBrushInterval = tools.getBrush().setInterval;
    /*
    보이는 모든 레이어를 하나로 합친 이미지 데이터를 반환한다.
    png 파일로 뽑아보기 위해 임시로 만들어졌다.
    */
    this.getMergedImageData = function () {
        var mergedImage = document.createElement('canvas');
        mergedImage.width = size.width;
        mergedImage.height = size.height;
        var context = mergedImage.getContext('2d');
        for (var i=0; i<layers.length; ++i) {
            var layer = layers[i];
            if (layer.style.visible != 'hidden') {
                context.globalAlpha = layer.style.opacity;
                switch (layer.tagName.toLowerCase()) {
                case 'canvas':
                    context.drawImage(layer, 0, 0, size.width, size.height);
                    break;
                default:
                    break;
                }
            }
        }
        return mergedImage.toDataURL();
    }
    var isDrawing = false;
    var isStabilizing = false;
    function _move(x, y, pressure) {
        if (tool.move)
            tool.move(x, y, pressure);
    }
    function _up(x, y, pressure) {
        isDrawing = false;
        isStabilizing = false;
        if (tool.up)
            tool.up(x, y, pressure);
        var layer = layers[layerIndex];
        switch (layer.tagName.toLowerCase()) {
        case 'canvas':
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
            break;
        default:
            break;
        }
    }
    this.down = function (x, y, pressure) {
        if (isDrawing)
            return;
        isDrawing = true;
        pressure = pressure || tabletapi.pressure();
        var down = tool.down;
        paintingLayer.style.opacity =
            layers[layerIndex].style.opacity * toolOpacity;
        paintingLayer.style.visibility = layers[layerIndex].style.visibility;
        if (toolStabilizeLevel > 0) {
            stabilizer = new Stabilizer;
            stabilizer.init(down, _move,
                toolStabilizeLevel, toolStabilizeWeight, x, y, pressure);
            isStabilizing = true;
        }
        else if (down != null)
            down(x, y, pressure);
    }
    this.move = function (x, y, pressure) {
        if (!isDrawing)
            return;
        pressure = pressure || tabletapi.pressure();
        if (stabilizer != null)
            stabilizer.move(x, y, pressure);
        else if (!isStabilizing)
            _move(x, y, pressure);
    }
    this.up = function (x, y, pressure) {
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

function Brush(canvasRenderingContext)
{
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
        else {
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
        brushContext.fillStyle = color.getHTMLColor();
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
        context.drawImage(transformedImage, 0, 0, size, size * imageRatio);
    }
    function drawTo(x, y, size) {
        var halfSize = size * 0.5;
        context.save();
        if (snapToPixel)
            context.translate(Math.floor(x - halfSize),
                Math.floor(y - halfSize * imageRatio));
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