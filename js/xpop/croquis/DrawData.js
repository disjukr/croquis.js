define(function () {
	return function (tool, command, toolArguments)
	{
		var tool = tool;
		this.getTool = function() {
			return tool;
		}
		this.setTool = function(value) {
			tool = value;
		}
		var command = command;
		this.getCommand = function() {
			return command;
		}
		this.setCommand = function(value) {
			command = value;
		}
		var toolArguments = toolArguments;
		this.getToolArguments = function() {
			return toolArguments;
		}
		this.setToolArguments = function(value) {
			toolArguments = value;
		}
	}
});