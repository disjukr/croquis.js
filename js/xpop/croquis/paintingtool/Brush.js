define(["xpop/croquis/color/Color"],
	function (Color) {
	return function (canvasRenderingContext)
	{
		var context = canvasRenderingContext;
		this.getContext = function () {
			return context;
		}
		this.setContext = function (value) {
			context = value;
		}
		var color = new Color;
		this.getColor = function () {
			return color;
		}
		this.setColor = function (value) {
			color = value;
			transformedImageIsDirty = true;
		}
		var knockout = false;
		this.getKnockout = function () {
			return knockout;
		}
		this.setKnockout = function (value) {
			knockout = value;
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
		var image = null;
		var transformedImage = null;
		var transformedImageIsDirty = true;
		var imageRatio = 1;
		this.getImage = function () {
			return image;
		}
		this.setImage = function (value) {
			if(value == null)
			{
				transformedImage = image = null;
				imageRatio = 1;
				drawFunction = drawCircle;
			}
			else
			{
				image = value;
				imageRatio = image.height / image.width;
				transformedImage = document.createElement("canvas");
				drawFunction = drawImage;
				transformedImageIsDirty = true;
			}
		}
		var delta = 0;
		var prevX = 0;
		var prevY = 0;
		var prevScale = 0;
		var drawFunction = drawCircle;
		function transformImage()
		{
			transformedImage.width = size;
			transformedImage.height = size * imageRatio;
			var brushContext = transformedImage.getContext("2d");
			brushContext.clearRect(0, 0, transformedImage.width, transformedImage.height);
			brushContext.drawImage(image, 0, 0, transformedImage.width, transformedImage.height);
			brushContext.globalCompositeOperation = "source-in";
			brushContext.fillStyle = color.getHTMLColor();
			brushContext.fillRect(0, 0, transformedImage.width, transformedImage.height);
		}
		function drawCircle(size)
		{
			var halfSize = size * 0.5;
			context.fillStyle = color.getHTMLColor();
			context.beginPath();
			context.arc(halfSize, halfSize, halfSize, 0, Math.PI * 2);
			context.closePath();
			context.fill();
		}
		function drawImage(size)
		{
			if(transformedImageIsDirty)
				transformImage();
			context.drawImage(transformedImage, 0, 0, size, size * imageRatio);
		}
		this.down = function(x, y, scale)
		{
			var halfSize = size * scale * 0.5;
			this.delta = 0;
			if(scale > 0 && context)
			{
				context.save();
				context.globalCompositeOperation = knockout ? "destination-out" : "source-over";
				context.translate(Math.floor(x - halfSize), Math.floor(y - halfSize * imageRatio));
				drawFunction(halfSize + halfSize);
				context.restore();
			}
			prevX = x;
			prevY = y;
			prevScale = scale;
		}
		this.move = function(x, y, scale)
		{
			if(scale > 0 && context)
			{
				var dx = x - prevX;
				var dy = y - prevY;
				delta += Math.sqrt(dx * dx + dy * dy);
				if(delta == 0)
					return;
				var drawInterval = size * interval * ( prevScale + scale ) * 0.5;
				if(drawInterval < 0.5)
					drawInterval = 0.5;
				var drawStep = drawInterval / delta;
				var xInterval = dx * drawStep;
				var yInterval = dy * drawStep;
				var scaleInterval = (scale - prevScale) * drawStep;
				context.save();
				context.globalCompositeOperation = knockout ? "destination-out" : "source-over";
				while(delta > drawInterval)
				{
					prevScale += scaleInterval;
					prevX += xInterval;
					prevY += yInterval;
					context.save();
					var halfSize = size * prevScale * 0.5;
					context.translate(Math.floor(prevX - halfSize), Math.floor(prevY - halfSize * imageRatio));
					drawFunction(halfSize + halfSize);
					context.restore();
					delta -= drawInterval;
				}
				context.restore();
			}
			else
			{
				delta = 0;
				prevX = x;
				prevY = y;
				prevScale = scale;
			}
		}
	}
});