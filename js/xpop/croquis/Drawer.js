define(function () {
	return function ()
	{
		var drawInterval = 5;
		this.getDrawInterval = function () {
			return drawInterval;
		}
		this.setDrawInterval = function (value) {
			drawInterval = value;
		}
		var queue = [];
		var dead = false;
		draw();
		function draw()
		{
			if(queue.length != 0)
			{
				var drawData = queue.shift();
				drawData.getCommand().apply(drawData.getTool(), drawData.getToolArguments());
			}
			if(!dead)
				window.setTimeout(draw, drawInterval);
		}
		this.addDrawData = function(drawData)
		{
			queue.push(drawData);
		}
		this.kill = function()
		{
			isDead = true;
		}
	}
});