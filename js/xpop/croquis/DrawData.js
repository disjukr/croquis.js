define(function () {
	return function (tool, command, arguments)
	{
		this.tool = tool;
		//function
		this.command = command;
		//array
		this.arguments = arguments;
	}
});