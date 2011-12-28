var GetCommandAssistant = function() {
}

//

GetCommandAssistant.prototype.setup = function() {  
}

GetCommandAssistant.prototype.run = function(future) {
	future.nest(prefs.load());

	future.then(this, function(future) {
		var config = future.result;

		if(!this.controller.args.owner)
			future.result = { returnValue: false };	
		else if((!this.controller.args.key) && (!this.controller.args.keys))
			future.result = { returnValue: false };	
		else {
			var keys = [];
			
			if(this.controller.args.key)
				keys.push(this.controller.args.key);
			else
				keys = this.controller.args.keys;
			
			var result = { returnValue: true };
			
			for(var i = 0; i < keys.length; i++) {
				for(var category in config) {
					for(var group in config[category]) {
						for(var j = 0; j < config[category][group].length; j++) {
							if((config[category][group][j].owner == this.controller.args.owner) &&
								(config[category][group][j].key == keys[i]))
							{
								result[keys[i]] = config[category][group][j].value;
							}
						}
					}
				}
			}
			
			future.result = result;
		}
	});
}

GetCommandAssistant.prototype.cleanup = function() {  
}

