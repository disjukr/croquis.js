define(["xpop/croquis/color/Color"],
	function (Color) {
	var RGBColor = function (r, g, b, a)
	{
		var r = r;
		this.getR = function () {
			return r;
		}
		var g = g;
		this.getG = function () {
			return g;
		}
		var b = b;
		this.getB = function () {
			return b;
		}
		var a = a;
		this.getA = function () {
			return a;
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