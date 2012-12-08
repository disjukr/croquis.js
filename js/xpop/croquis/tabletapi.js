define(function () {
	return {
		pressure: function ()
		{
			var plugin = document.querySelector('object[type="application/x-wacomtabletplugin"]');
			if(plugin)
			{
				return plugin.penAPI && plugin.penAPI.pressure || 1;
			}
			else
			{
				plugin = document.createElement("object");
				plugin.type = "application/x-wacomtabletplugin";
				plugin.style.position = "absolute";
				plugin.style.top = "-1000px";
				document.body.appendChild(plugin);
			}
		}
	}
});