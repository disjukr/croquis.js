define(function () {
	var Color = function ()
	{
		Object.defineProperty(this, "htmlColor",{
			get: function(){return "rgba(0, 0, 0, 1)";}
		});
	};
	return Color;
});