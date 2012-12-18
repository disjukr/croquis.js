require(["xpop/croquis/DrawData",
		"xpop/croquis/Drawer",
		"xpop/croquis/tabletapi",
		"xpop/croquis/color/RGBColor",
		"xpop/croquis/paintingtool/Brush"],
	function (DrawData, Drawer, tabletapi, RGBColor, Brush)
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
		drawer.setDrawInterval(5);

		var brush = new Brush(context);
		brush.setSize(30);
		brush.setInterval(0);
		brush.setColor(new RGBColor(0.5, 0.5, 1, 1));

		var brushSizeSlider = document.getElementById("brushSizeSlider");
		brushSizeSlider.value = brush.getSize();
		brushSizeSlider.addEventListener("mousedown", function(e){
			e.stopPropagation();
		});
		brushSizeSlider.addEventListener("change", function(){
			drawer.addDrawData(new DrawData(brush, brush.setSize, [brushSizeSlider.value]));
		});

		var brushColorRSlider = document.getElementById("brushColorRSlider");
		brushColorRSlider.value = brush.getColor().getR()*0xFF;
		brushColorRSlider.addEventListener("mousedown", function(e){
			e.stopPropagation();
		});
		brushColorRSlider.addEventListener("change", function(){
			var brushColor = brush.getColor();
			drawer.addDrawData(new DrawData(brush, brush.setColor, [new RGBColor(
				brushColorRSlider.value/0xFF,
				brushColor.getG(),
				brushColor.getB(),
				brushColor.getA())]));
		});

		var brushColorGSlider = document.getElementById("brushColorGSlider");
		brushColorGSlider.value = brush.getColor().getG()*0xFF;
		brushColorGSlider.addEventListener("mousedown", function(e){
			e.stopPropagation();
		});
		brushColorGSlider.addEventListener("change", function(){
			var brushColor = brush.getColor();
			drawer.addDrawData(new DrawData(brush, brush.setColor, [new RGBColor(
				brushColor.getR(),
				brushColorGSlider.value/255,
				brushColor.getB(),
				brushColor.getA())]));
		});

		var brushColorBSlider = document.getElementById("brushColorBSlider");
		brushColorBSlider.value = brush.getColor().getB()*0xFF;
		brushColorBSlider.addEventListener("mousedown", function(e){
			e.stopPropagation();
		});
		brushColorBSlider.addEventListener("change", function(){
			var brushColor = brush.getColor();
			drawer.addDrawData(new DrawData(brush, brush.setColor, [new RGBColor(
				brushColor.getR(),
				brushColor.getG(),
				brushColorBSlider.value/0xFF,
				brushColor.getA())]));
		});

		document.body.addEventListener("mousedown", onMouseDown);
		document.addEventListener("mouseup", onMouseUp);
		function onMouseDown(e)
		{
			drawer.addDrawData(new DrawData(brush, brush.down, [e.clientX, e.clientY, tabletapi.pressure()]));
			document.body.addEventListener("mousemove", onMouseMove);
		}
		function onMouseMove(e)
		{
			drawer.addDrawData(new DrawData(brush, brush.move, [e.clientX, e.clientY, tabletapi.pressure()]));
		}
		function onMouseUp(e)
		{
			document.body.removeEventListener("mousemove", onMouseMove);
		}
	}
);