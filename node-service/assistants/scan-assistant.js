var ScanCommandAssistant = function() {
}

//

ScanCommandAssistant.prototype.setup = function() {  
}

ScanCommandAssistant.prototype.run = function(future) {
	future.nest(prefs.load());

	future.then(this, function(future) {
		var config = future.result;

		var newConfig = {
			_id: config._id,
			_kind: config._kind,
			_rev: config._rev,
			browser: {},
			calendar: {},
			camera: {},
			clock: {},
			contacts: {},
			email: {},
			luna: {},
			messaging: {},
			phone: {},
			system: {}
		};

		var fs = IMPORTS.require('fs');

		try { 
			var files = fs.readdirSync("/media/cryptofs/apps/usr/palm/services/org.webosinternals.tweaks.prefs/preferences");
		}
		catch(error) { 
			future.nest(prefs.save(newConfig));

			future.then(this, function(future) {
				future.result = { returnValue: true };
			});

			return;
		}	
		
		for(var fileIdx = 0; fileIdx < files.length; fileIdx++) {
			if(files[fileIdx].slice(files[fileIdx].length - 5) == ".json") {
				var fileId = files[fileIdx].slice(0, files[fileIdx].length - 5);

				var fileData = fs.readFileSync('/media/cryptofs/apps/usr/palm/services/org.webosinternals.tweaks.prefs/preferences/' + files[fileIdx], 'utf8');

				try { var jsonData = JSON.parse(fileData); } catch(error) { continue; }	

				if(jsonData instanceof Array) {
					for(var i = 0; i < jsonData.length; i++) {
						var category = jsonData[i].category.toLowerCase();
						var owner = jsonData[i].owner || fileId;
			
						if((jsonData[i].prefs) && (jsonData[i].prefs.length)) {
							if(!newConfig[category])
								newConfig[category] = {}; 
						
							for(var j = 0; j < jsonData[i].prefs.length; j++) {
								if(jsonData[i].prefs[j].group) {
									var group = jsonData[i].prefs[j].group.toLowerCase();

									if(newConfig[category][group] == undefined)
										newConfig[category][group] = [];

									if(jsonData[i].prefs[j].key) {
										var key = jsonData[i].prefs[j].key;
			
										var help = "";
										var label = "";
										var restart = "none";
										var prefserv = "";
			
										if(jsonData[i].prefs[j].help)
											help = jsonData[i].prefs[j].help;

										if(jsonData[i].prefs[j].label)
											label = jsonData[i].prefs[j].label;

										if(jsonData[i].prefs[j].restart)
											restart = jsonData[i].prefs[j].restart;

										if(jsonData[i].prefs[j].prefserv)
											prefserv = jsonData[i].prefs[j].prefserv;

										if(jsonData[i].prefs[j].value != undefined) {
											var value = jsonData[i].prefs[j].value;

											// Lets fetch the old value and use it...

											if((config[category]) && (config[category][group])) {
												for(var k = 0; k < config[category][group].length; k++) {
													if((config[category][group][k].owner == owner) &&
														(config[category][group][k].key == key))
													{
														value = config[category][group][k].value;
							
														break;
													}
												}
											}
											
											if(jsonData[i].prefs[j].type == "IntegerPicker") {
												var minValue = 0;
												var maxValue = 100;
				
												if(jsonData[i].prefs[j].min)
													minValue = jsonData[i].prefs[j].min;
				
												if(jsonData[i].prefs[j].max)
													maxValue = jsonData[i].prefs[j].max;

												newConfig[category][group].push({
													owner: owner, type: "IntegerPicker", 
													key: key, restart: restart, prefserv: prefserv,
													help: help, label: label, value: value,
													min: minValue, max: maxValue});
											}
											else if(jsonData[i].prefs[j].type == "ListSelector") {
												if(jsonData[i].prefs[j].choices) {
													var choices = jsonData[i].prefs[j].choices;

													newConfig[category][group].push({
														owner: owner, type: "ListSelector", 
														key: key, restart: restart, prefserv: prefserv,
														help: help, label: label, value: value,
														choices: choices});
												}
											}
											else if(jsonData[i].prefs[j].type == "TextField") {
												var input = "text";
												
												if(jsonData[i].prefs[j].input)
													input = jsonData[i].prefs[j].input;
											
												newConfig[category][group].push({
													owner: owner, type: "TextField", 
													key: key, restart: restart, prefserv: prefserv,
													help: help, label: label, value: value,
													input: input});
											}
											else if(jsonData[i].prefs[j].type == "ToggleButton") {
												newConfig[category][group].push({
													owner: owner, type: "ToggleButton", 
													key: key, restart: restart, prefserv: prefserv,
													help: help, label: label, value: value});
											}
											else if(jsonData[i].prefs[j].type == "FilePicker") {
												var path = "/media/internal/downloads";
												
												if(jsonData[i].prefs[j].path)
													path = jsonData[i].prefs[j].path;

												var filter = "files";
												
												if(jsonData[i].prefs[j].filter)
													filter = jsonData[i].prefs[j].filter;

												var select = "single";
												
												if(jsonData[i].prefs[j].select == true)
													select = jsonData[i].prefs[j].select;
											
												newConfig[category][group].push({
													owner: owner, type: "FilePicker", 
													key: key, restart: restart, prefserv: prefserv,
													help: help, label: label, value: value,
													path: path, filter: filter, select: select});
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}

		future.nest(prefs.save(newConfig));

		future.then(this, function(future) {
			future.result = { returnValue: true};
		});
	});
}

ScanCommandAssistant.prototype.cleanup = function() {  
}

