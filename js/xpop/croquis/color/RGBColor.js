define(["xpop/croquis/color/Color"],
	function (Color) {
	var RGBColor = function (red, green, blue, alpha)
	{
		var r = red;
		Object.defineProperty(this, "r",{
			get: function(){updateHTMLColor();},
			set: function(value){r = value;}
		});
		var g = green;
		Object.defineProperty(this, "g",{
			get: function(){updateHTMLColor();},
			set: function(value){g = value;}
		});
		var b = blue;
		Object.defineProperty(this, "b",{
			get: function(){updateHTMLColor();},
			set: function(value){b = value;}
		});
		var a = alpha;
		Object.defineProperty(this, "a",{
			get: function(){updateHTMLColor();},
			set: function(value){a = value;}
		});
		var htmlColor;
		updateHTMLColor();
		Object.defineProperty(this, "htmlColor",{
			get: function(){return htmlColor;}
		});
		function updateHTMLColor()
		{
			htmlColor = "rgba(" +
				Math.round(r * 0xFF) + "," +
				Math.round(g * 0xFF) + "," +
				Math.round(b * 0xFF) + "," +
				a + ")";
		}
	};
	RGBColor.prototype = new Color;
	return RGBColor;
});