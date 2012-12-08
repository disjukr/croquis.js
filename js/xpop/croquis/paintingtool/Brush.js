define(["xpop/croquis/Color"],
	function (Color) {
	return function (canvasRenderingContext)
	{
		var context = canvasRenderingContext;
		Object.defineProperty(this, "context",{
			get: function(){return context;},
			set: function(value){context = value;}
		});
		var color = new Color(0, 0, 0, 1);
		Object.defineProperty(this, "color",{
			get: function(){return color;},
			set: function(value)
			{
				color = value;
				if(image && coloredImage)
				{
					var brushContext = coloredImage.getContext("2d");
					brushContext.clearRect(0, 0, coloredImage.width, coloredImage.height);
					brushContext.globalCompositeOperation = "source-over";
					brushContext.drawImage(image, 0, 0, coloredImage.width, coloredImage.height);
					brushContext.globalCompositeOperation = "source-in";
					brushContext.fillStyle = color.toString();
					brushContext.fillRect(0, 0, coloredImage.width, coloredImage.height);
				}
			}
		});
		var knockout = false;
		Object.defineProperty(this, "knockout", {
			get: function(){return knockout;},
			set: function(value){knockout = value;}
		});
		var size = 10;
		Object.defineProperty(this, "size", {
			get: function(){return size;},
			set: function(value){size = value < 1 ? 1 : value;}
		});
		var interval = 0.05;
		Object.defineProperty(this, "interval", {
			get: function(){return interval;},
			set: function(value){interval = value < 0.01 ? 0.01 : value;}
		});
		var image = null;
		var coloredImage = null;
		Object.defineProperty(this, "image", {
			get: function(){return image;},
			set: function(value)
			{
				if(value == null)
				{
					coloredImage = image = null;
					drawFunction = drawCircle;
				}
				else
				{
					image = value;
					coloredImage = document.createElement("canvas");
					coloredImage.width = image.width;
					coloredImage.height = image.height;
					var brushContext = coloredImage.getContext("2d");
					brushContext.drawImage(image, 0, 0, coloredImage.width, coloredImage.height);
					brushContext.globalCompositeOperation = "source-in";
					brushContext.fillStyle = color.toString();
					brushContext.fillRect(0, 0, coloredImage.width, coloredImage.height);
					drawFunction = drawImage;
				}
			}
		});
		var delta = 0;
		var prevX = 0;
		var prevY = 0;
		var prevScale = 0;
		var drawFunction = drawCircle;
		function drawCircle(size)
		{
			var halfSize = size * 0.5;
			context.fillStyle = color.toString();
			context.beginPath();
			context.arc(halfSize, halfSize, halfSize, 0, Math.PI * 2);
			context.closePath();
			context.fill();
		}
		function drawImage(size)
		{
			//assume: image is square
			context.drawImage(coloredImage, 0, 0, size, size);
		}
		this.down = function(x, y, scale)
		{
			var halfSize = size * scale * 0.5;
			this.delta = 0;
			if(scale != 0)
			{
				context.save();
				context.globalCompositeOperation = knockout ? "destination-out" : "source-over";
				context.translate(Math.floor(x - halfSize), Math.floor(y - halfSize));
				drawFunction(halfSize + halfSize);
				context.restore();
			}
			prevX = x;
			prevY = y;
			prevScale = scale;
		}
		this.move = function(x, y, scale)
		{
			if(scale > 0)
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
					context.translate(Math.floor(prevX - halfSize), Math.floor(prevY - halfSize));
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