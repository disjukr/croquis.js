define(["xpop/croquis/color/Color"],
	function (Color) {
	var RGBColor = function (r, g, b, a)
	{
		var r = r;
		this.getR = function () {
			return r;
		}
		this.setR = function (value) {
			r = value;
			updateHTMLColor();
		}
		var g = g;
		this.getG = function () {
			return g;
		}
		this.setG = function (value) {
			g = value;
			updateHTMLColor();
		}
		var b = b;
		this.getB = function () {
			return b;
		}
		this.setB = function (value) {
			b = value;
			updateHTMLColor();
		}
		var a = a;
		this.getA = function () {
			return a;
		}
		this.setA = function (value) {
			a = value;
			updateHTMLColor();
		}
		var htmlColor;
		this.getHTMLColor = function () {
			return htmlColor;
		}
		updateHTMLColor();
		function updateHTMLColor()
		{
			htmlColor = "rgba(" +
				Math.round(r * 0xFF) + "," +
				Math.round(g * 0xFF) + "," +
				Math.round(b * 0xFF) + "," +
				a + ")";
		}
	}
	RGBColor.prototype = new Color;
	return RGBColor;
});