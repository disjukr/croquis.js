var xpop = xpop || {};
xpop.croquis = xpop.croquis || {};
xpop.croquis.Drawer = function ()
{
	var drawInterval = 5;
	Object.defineProperty(this, "drawInterval",{
		get: function(){return drawInterval;},
		set: function(value){drawInterval = value;}
	});
	var queue = [];
	var isDead = false;
	draw();
	function draw()
	{
		if(queue.length != 0)
		{
			var drawData = queue.shift();
			drawData.command.apply(drawData.tool, drawData.arguments);
		}
		if(!isDead)
			window.setTimeout(draw, drawInterval);
	}
	this.addDrawData = function(drawData)
	{
		queue.push(drawData);
	}
	this.killMe = function()
	{
		isDead = true;
	}
}