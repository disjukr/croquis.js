define(["xpop/croquis/color/Color"],
	function (Color) {
	var RGBColor = function (r, g, b)
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
		var htmlColor;
		this.getHTMLColor = function () {
			return htmlColor;
		}
		updateHTMLColor();
		function updateHTMLColor()
		{
			htmlColor = "rgb(" +
				Math.round(r * 0xFF) + "," +
				Math.round(g * 0xFF) + "," +
				Math.round(b * 0xFF) + ")";
		}
	}
	RGBColor.prototype = new Color;
	return RGBColor;
});