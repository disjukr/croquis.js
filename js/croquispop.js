require(["xpop/croquis/Croquis"],
	function (Croquis) {
		var croquis = new Croquis(500, 500);
		croquis.addLayer();
		document.body.appendChild(croquis.getDomElement());
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