define(["xpop/croquis/paintingtool/Brush"],
	function (Brush) {
	var Tools = function ()
	{
		var brush = new Brush;
		this.getBrush = function () {
			brush.setKnockout(false);
			return brush;
		}
		this.getEraser = function () {
			brush.setKnockout(true);
			return brush;
		}
	}
	return Tools;
});