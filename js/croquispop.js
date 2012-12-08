require(["xpop/croquis/Color",
		"xpop/croquis/DrawData",
		"xpop/croquis/Drawer",
		"xpop/croquis/tabletapi",
		"xpop/croquis/paintingtool/Brush"],
	function (Color, DrawData, Drawer, tabletapi, Brush)
	{
		var layers = document.getElementById("layers");
		var canvas = document.createElement("canvas");
		canvas.width = 500;
		canvas.height = 500;
		layers.appendChild(canvas);
		var context = canvas.getContext("2d");
		context.fillStyle = "#FFFFFF";
		context.fillRect(0, 0, canvas.width, canvas.height);
		var drawer = new Drawer;
		drawer.drawInterval = 5;
		var brush = new Brush(context);
		brush.size = 50;
		brush.interval = 0;
		brush.color = new Color(0, 0, 0, 1);
		document.body.addEventListener("mousedown", onMouseDown, false);
		document.addEventListener("mouseup", onMouseUp, false);
		function onMouseDown(e)
		{
			drawer.addDrawData(new DrawData(brush, brush.down, [e.clientX, e.clientY, tabletapi.pressure()]));
			document.body.addEventListener("mousemove", onMouseMove, false);
		}
		function onMouseMove(e)
		{
			drawer.addDrawData(new DrawData(brush, brush.move, [e.clientX, e.clientY, tabletapi.pressure()]));
		}
		function onMouseUp(e)
		{
			document.body.removeEventListener("mousemove", onMouseMove, false);
		}
	}
);