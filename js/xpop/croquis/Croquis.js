define(["xpop/croquis/tabletapi",
		"xpop/croquis/color/Color",
		"xpop/croquis/paintingtool/Tools"],
	function (tabletapi, Color, Tools) {
	var Croquis = function (width, height) {
		var domElement = document.createElement("div");
		var backgroundCheckers = document.createElement("div");
		(function () {
			var backgroundImage = document.createElement("canvas");
			backgroundImage.width = backgroundImage.height = 20;
			var backgroundImageContext = backgroundImage.getContext("2d");
			backgroundImageContext.fillStyle = "#FFFFFF";
			backgroundImageContext.fillRect(0, 0, 20, 20);
			backgroundImageContext.fillStyle = "#CCCCCC";
			backgroundImageContext.fillRect(0, 0, 10, 10);
			backgroundImageContext.fillRect(10, 10, 20, 20);
			backgroundCheckers.style.backgroundImage = "url(" + backgroundImage.toDataURL() + ")";
			backgroundCheckers.style.zIndex = 1;
			backgroundCheckers.style.position = "absolute";
		})();
		domElement.appendChild(backgroundCheckers);
		this.getDomElement = function () {
			return domElement;
		}
		var size = {width: width, height: height};
		this.getCanvasSize = function () {
			return {width: sizw.width, height: size.height};
		}
		this.setCanvasSize = function (width, height) {
			size.width = width = Math.floor(width);
			size.height = height = Math.floor(height);
			domElement.style.width = backgroundCheckers.style.width = width + "px";
			domElement.style.height = backgroundCheckers.style.height = height + "px";
			for(var i=0; i<layers.length; ++i)
			{
				switch(layers[i].tagName.toLowerCase())
				{
					case "canvas":
						var canvas = layers[i];
						var context = canvas.getContext("2d");
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
		this.setCanvasSize(width, height);
		function layersZIndex() {
			for(var i=0; i<layers.length; ++i)
				layers[i].style.zIndex = i + 2;
		}
		this.getLayers = function () {
			return layers.concat();
		}
		this.addLayer = function (layerType) {
			var layer;
			switch(layerType || "canvas")
			{
				case "canvas":
					layer = document.createElement("canvas");
					layer.width = size.width;
					layer.height = size.height;
					break;
				default:
					throw "unknown layer type";
					return;
			}
			layer.style.position = "absolute";
			domElement.appendChild(layer);
			layers.push(layer);
			if(layers.length == 1)
				this.selectLayer(0);
			layersZIndex();
		}
		this.removeLayer = function (index) {
			domElement.removeChild(layers[index]);
			layers.splice(index, 1);
			if(layerIndex == layers.length)
				--layerIndex;
			layersZIndex();
		}
		this.swapLayer = function (index1, index2) {
			var layer = layers[index1];
			layers[index1] = layers[index2];
			layers[index2] = layer;
			layersZIndex();
		}
		this.selectLayer = function (index) {
			layerIndex = index;
			switch(layers[index].tagName.toLowerCase())
			{
				case "canvas":
					if(tool.setContext)
						tool.setContext(layers[index].getContext("2d"));
					break;
				default:
					break;
			}
		}
		this.setLayerOpacity = function (opacity) {
			layers[layerIndex].style.opacity = opacity;
		}
		this.setLayerVisible = function (visibile) {
			layers[layerIndex].style.visibility = visible ? "visible" : "hidden";
		}
		var tools = new Tools;
		var tool = tools.getBrush();
		var toolSize = 10;
		var toolColor = new Color;
		this.setTool = function (toolName) {
			switch(toolName)
			{
				case "brush":
					tool = tools.getBrush();
					break;
				case "eraser":
					tool = tools.getEraser();
					break;
				default:
					break;
			}
			setToolSize(toolSize);
			setToolColor(toolColor);
		}
		this.getToolSize = function () {
			return toolSize;
		}
		this.setToolSize = function (size) {
			toolSize = size;
			if(tool.setSize)
				tool.setSize(toolSize);
		}
		this.getToolColor = function () {
			return toolColor;
		}
		this.setToolColor = function (color) {
			toolColor = color;
			if(tool.setColor)
				tool.setColor(toolColor);
		}
		this.getMergedImageData = function () {
			//TODO: implement
		}
		this.down = function (x, y) {
			if(tool.down)
				tool.down(x, y, tabletapi.pressure());
		}
		this.move = function (x, y) {
			if(tool.move)
				tool.move(x, y, tabletapi.pressure());
		}
		this.up = function (x, y) {
			if(tool.up)
				tool.up(x, y, tabletapi.pressure());
		}
	}
	return Croquis;
});