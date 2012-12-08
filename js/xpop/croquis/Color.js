define(function () {
	return function (r, g, b, a)
	{
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
		this.clone = function()
		{
			return new Color(this.r, this.g, this.b, this.a);
		}
		this.toString = function()
		{
			return "rgba(" +
				Math.round(this.r * 0xFF) + "," +
				Math.round(this.g * 0xFF) + "," +
				Math.round(this.b * 0xFF) + "," +
				this.a + ")";
		}
	}
});