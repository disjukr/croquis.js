var xpop = xpop || {};
xpop.croquis = xpop.croquis || {};
xpop.croquis.DrawData = function (tool, command, arguments)
{
	this.tool = tool;
	//function
	this.command = command;
	//array
	this.arguments = arguments;
}