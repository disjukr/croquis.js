require(["xpop/croquis/Croquis",
		"xpop/croquis/color/RGBColor"],
	function (Croquis, RGBColor) {
		var croquis = new Croquis(500, 500);
		croquis.addFilledLayer(new RGBColor(1, 1, 1, 1));
		croquis.addLayer();
		croquis.selectLayer(1);
		croquis.setTool("brush");
		croquis.setToolSize(10);
		croquis.setToolColor(new RGBColor(0, 0, 0, 1));
		document.body.appendChild(croquis.getDOMElement());
		function onMouseDown(e) {
			croquis.down(e.clientX, e.clientY);
			document.body.addEventListener("mousemove", onMouseMove);
		}
		function onMouseMove(e) {
			croquis.move(e.clientX, e.clientY);
		}
		function onMouseUp(e) {
			croquis.up(e.clientX, e.clientY);
			document.body.removeEventListener("mousemove", onMouseMove);
		}
		document.body.addEventListener("mousedown", onMouseDown);
		document.body.addEventListener("mouseup", onMouseUp);
	}
);