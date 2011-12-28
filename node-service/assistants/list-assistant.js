var ListCommandAssistant = function() {
}

//

ListCommandAssistant.prototype.setup = function() {  
}

ListCommandAssistant.prototype.run = function(future) {
	var path = "/media/internal/downloads";
	
	var filter = "files";

	if(this.controller.args.path)
		path = this.controller.args.path;

	if(this.controller.args.filter)
		filter = this.controller.args.filter;

	var fs = IMPORTS.require('fs');

	var exec = IMPORTS.require('child_process').exec;

	try { 
		var files = fs.readdirSync(path);
	} catch(error) { 
		future.result = { returnValue: false, 'exception': error };

		return;
	}

	var items = [];

	for(var fileIdx = 0; fileIdx < files.length; fileIdx++) {		
		var stat = fs.statSync(path + "/" + files[fileIdx]);

		if((stat) && (((filter == "files") && (stat.isFile())) || 
			((filter == "dirs") && (stat.isDirectory()))))
		{
			items.push({label: files[fileIdx], value: path + "/" + files[fileIdx]});
		}
	}

	future.result = { returnValue: false, 'files': items };
}

ListCommandAssistant.prototype.cleanup = function() {  
}

