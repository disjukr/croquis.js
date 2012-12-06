var croquispop = function ()
{
	var layers = document.getElementById("layers");
	var canvas = document.createElement("canvas");
	canvas.width = 500;
	canvas.height = 500;
	layers.appendChild(canvas);
	var context = canvas.getContext("2d");
	context.fillStyle = "#FFFFFF";
	context.fillRect(0, 0, canvas.width, canvas.height);
	var drawer = new xpop.croquis.Drawer;
	drawer.drawInterval = 5;
	var brush = new xpop.croquis.paintingtool.Brush(context);
	brush.size = 50;
	brush.interval = 0;
	brush.color = new xpop.croquis.Color(0, 0, 0, 1);
	document.body.addEventListener("mousedown", onMouseDown, false);
	document.addEventListener("mouseup", onMouseUp, false);
	function onMouseDown(e)
	{
		drawer.addDrawData(new xpop.croquis.DrawData(brush, brush.down, [e.clientX, e.clientY, xpop.croquis.tabletapi.pressure()]));
		document.body.addEventListener("mousemove", onMouseMove, false);
	}
	function onMouseMove(e)
	{
		drawer.addDrawData(new xpop.croquis.DrawData(brush, brush.move, [e.clientX, e.clientY, xpop.croquis.tabletapi.pressure()]));
	}
	function onMouseUp(e)
	{
		document.body.removeEventListener("mousemove", onMouseMove, false);
	}
}();