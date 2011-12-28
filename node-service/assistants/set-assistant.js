var SetCommandAssistant = function() {
}

//

SetCommandAssistant.prototype.setup = function() {  
}

SetCommandAssistant.prototype.run = function(future) {
	future.nest(prefs.load());

	future.then(this, function(future) {
		var config = future.result;

		if(!this.controller.args.owner)
			future.result = { returnValue: false };	
		else {
			var result = { returnValue: true };

			for(var key in this.controller.args) {
				for(var category in config) {
					for(var group in config[category]) {
						for(var j = 0; j < config[category][group].length; j++) {
							if((config[category][group][j].owner == this.controller.args.owner) &&
								(config[category][group][j].key == key))
							{
								config[category][group][j].value = this.controller.args[key];
							}
						}
					}
				}
			}
		
			future.nest(prefs.save(config));

			future.then(this, function(future) {
				future.result = { returnValue: true };
			});
		}
	});
}

SetCommandAssistant.prototype.cleanup = function() {  
}

