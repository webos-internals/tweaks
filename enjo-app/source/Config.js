enyo.kind({
	name: "Config",
	kind: enyo.VFlexBox,
	className: "basic-back",
	flex: 1,
	
	_ui: "full",
	
	_helpOn: false,
	_lunaOn: false,
	
	_help: {},
	_category: null,

	_pickerItem: null,

	_matchNumeric: /^[0-9]*$/,
	_matchFreeText: /^[-_a-zA-Z0-9 /.:@%~,'{}]*$/,
	
	events: {
		onSelect: ""
	},
	
	components: [
		{name: "dlgLunaRestart", kind: "DialogPrompt", title: "Luna Restart", 
			acceptButtonCaption: "Yes", cancelButtonCaption: "No", onAccept: "handleConfirmRestart", 
				message: "You have made changes that require restarting of Luna which will " +
					"close all your open applications. Do you want to restart Luna now?"}, 

		{name: "dlgServiceError", kind: "ModalDialog", caption: "Unknown Service Error", components: [
			{content: "Configuration could not be saved since the service returned an error!", className: "enyo-text-error"}, 
			{kind: "Button", caption: "OK", onclick: "handleDismissDialog", style: "margin-top: 10px;"}
		]}, 
	
		{name: "dlgNumericError", kind: "ModalDialog", caption: "Unallowed Characters Used", components: [
			{content: "The value you inputted for the numeric text field contains unallowed characters. Allowed characters are: " +
				"0-9", className: "enyo-text-error"}, 
			{kind: "Button", caption: "OK", onclick: "handleDismissDialog", style: "margin-top: 10px;"}
		]}, 
	
		{name: "dlgFreeTextError", kind: "ModalDialog", caption: "Unallowed Characters Used", components: [
			{content: "The value you inputted for the free text field contains unallowed characters. Allowed characters are: " +
				"a-z A-Z 0-9 -_/.:@%~,\'{}", className: "enyo-text-error"}, 
			{kind: "Button", caption: "OK", onclick: "handleDismissDialog", style: "margin-top: 10px;"}
		]}, 
	
		{name: "filePicker", kind: "wi.Picker", multiSelect: true, onSelect: "handlePickerConfirm"},
	
		{name: 'tag', style: "position: absolute; z-index: 3; background: url(images/sliding-tag.png) right center no-repeat;" +
			"height: 50px; width: 26px; left: -26px; margin-top: -2px;display: none;"}, 
		
		{kind: "PageHeader", layoutKind: "VFlexLayout", components: [
			{name: "title", style: "text-transform: capitalize;", content: "Tweak Groups"}
		]}, 
	
		{name: "configScroller", kind: "Scroller", pack: "center", flex: 1, height: "613px;", components: [
			{name: "groups", layoutKind: "HFlexLayout", style: "padding-top: 10px;", width: "100%", components: []}
		]},

		{kind: "Toolbar", pack: "center", className: "enyo-toolbar-light", components: [
			{style: "width: 60px;"}, 
			{kind: "Spacer", flex: 1}, 
			{name: "restart", kind: "Button", caption: "Luna restart required (click here to restart)", style: "display: none;", onclick: "handleLunaRestart"}, 
			{kind: "Spacer", flex: 1}, 
			{kind: "ToolButton", icon: "images/help-toggle.png", toggling: true, style: "margin-right: 8px;", onclick: "handleHelpToggle"}
		]},

		{name: "srvGetFiles", kind: "PalmService", service: "palm://org.webosinternals.tweaks.prefs/", method: "list", 
			onSuccess: "handleGetFiles"},

		{name: "srvSaveTweaks", kind: "DbService", dbKind: "org.webosinternals.tweaks:1", method: "merge", 
			onSuccess: "handleTweaksSaved", onFailure: "handleServiceError"},

		{name: "srvRestartLuna", kind: "PalmService", service: "palm://org.webosinternals.ipkgservice", method: "restartLuna"},

		{name: "srvSetPref", kind: "PalmService", service: "palm://com.palm.systemservice/", method: "setPreferences"},
/* Get Preferences stuff
		{name: "srvGetPref", kind: "PalmService", service: "palm://com.palm.systemservice/", method: "getPreferences", 
			onSuccess: "getPrefsSuccess", onFailure: "getPrefsFailure"}
*/
	],
	
	adjustInterface: function(inSize) {
		if(inSize.w < 640)
			this._ui = "compact";

		this.$.configScroller.applyStyle("height", (inSize.h - 87) + "px");
	},
	
	updateGroups: function(inMarker, inCategory, inGroups) {
		if(inMarker == undefined) {
			this.$.title.setContent("No Available Tweaks");

			return;
		}
	
		this._category = inCategory;

		if(this._ui == "full") {
			this.$.tag.applyStyle('top', inMarker + 'px');

			this.$.tag.show();
		}

		this.$.title.setContent("Available " + inCategory + " Tweaks");

		this.$.configScroller.scrollIntoView(0);

		if(this.$.groupItems)
			this.$.groupItems.destroy();

		if(this._ui == "full") {
			this.$.groups.createComponent({name: "groupItems", layoutKind: "VFlexLayout", flex: 1, style: "padding: 0px 20px 0px 20px;", components: []}, 
				{owner: this});
		} else {
			this.$.groups.createComponent({name: "groupItems", layoutKind: "VFlexLayout", flex: 1, style: "padding: 0px 5px 0px 5px;", components: []}, 
				{owner: this});
		}
		
		for(var group in inGroups) {
			if(inGroups[group].length > 0) {
				var help = [];
				var items = [];
				
				for(var i = 0; i < inGroups[group].length; i++) {
					if(inGroups[group][i].deleted != undefined)
						continue;
/* More Get Preferences stuff
					if(inGroups[group][i].prefserv != "")
					{
						var obj = {keys:[]}
						obj.keys[0] = inGroups[group][i].prefserv;
						this.$.srvGetPref.call(obj);
					}
*/
					if(inGroups[group][i].type == "IntegerPicker") {
						help.push({label: inGroups[group][i].label, help: inGroups[group][i].help});

						items.push({kind: "Item", layoutKind: "HFlexLayout", align: "center", pack: "center", components: [
							{content: inGroups[group][i].label, flex: 1, className: "enyo-label"},
							{name: inGroups[group][i].key, kind: "IntegerPicker", label: "", value: inGroups[group][i].value, 
							min: inGroups[group][i].min, max: inGroups[group][i].max , onChange: "handlePicker"}]});
					}
					else if(inGroups[group][i].type == "ListSelector") {
						var choices = [];
						
						for(var j = 0; j < inGroups[group][i].choices.length; j++)
							choices.push({caption: inGroups[group][i].choices[j].label, value: inGroups[group][i].choices[j].value});

						help.push({label: inGroups[group][i].label, help: inGroups[group][i].help});

						items.push({kind: "Item", layoutKind: "HFlexLayout", align: "center", pack: "center", components: [
							{content: inGroups[group][i].label, flex: 1, className: "enyo-label"},
							{name: inGroups[group][i].key, kind: "ListSelector", value: inGroups[group][i].value, onChange: "handleList", items: choices}]});
					}
					else if(inGroups[group][i].type == "TextField") {
						help.push({label: inGroups[group][i].label, help: inGroups[group][i].help});

						items.push({kind: "Item", layoutKind: "VFlexLayout", components: [
							{layoutKind: "HFlexLayout", pack: "left", components: [
							{content: inGroups[group][i].label, className: "enyo-label"}]},
							{layoutKind: "HFlexLayout", components: [
							{name: inGroups[group][i].key, kind: "Input", flex: 1, alwaysLooksFocused: true, value: inGroups[group][i].value, 
								onkeypress: "handleChars", onchange: "handleInput"}]}]});
					}
					else if(inGroups[group][i].type == "ToggleButton") {
						help.push({label: inGroups[group][i].label, help: inGroups[group][i].help});

						items.push({kind: "Item", layoutKind: "HFlexLayout", align: "center", pack: "center", components: [
							{content: inGroups[group][i].label, flex: 1, className: "enyo-label"},
							{name: inGroups[group][i].key, kind: "ToggleButton", onLabel: "Yes", offLabel: "No", state: inGroups[group][i].value, onChange: "handleToggle"}]});
					}
					else if(inGroups[group][i].type == "FilePicker") {
						help.push({label: inGroups[group][i].label, help: inGroups[group][i].help});

						var files = inGroups[group][i].value.toString();
						
						if(files.length > 13)
							files = files.slice(0, 10) + "...";

						items.push({kind: "Item", layoutKind: "HFlexLayout", align: "center", pack: "center", components: [
							{content: inGroups[group][i].label, flex: 1, className: "enyo-label"},
							{name: inGroups[group][i].key, onclick: "openFilePicker", content: files, className: "enyo-title"}]});
					}
				}

				this._help[group] = help;
				
				this.$.groupItems.createComponent({name: group, kind: "RowGroup", caption: group, components: items, onclick: "handleHelpSelect"}, {owner: this});
			}
		}

		this.$.groups.render();
	},
/* Callback for Getting Preferences
	getPrefsSuccess : function(inSender, inResponse) {
	   enyo.log("getPreferences success, results=" + enyo.json.stringify(inResponse));
	   //Set the item's value to the one in inResponse here, not sure how...
	},
*/
	saveTweaksConfig: function() {
		this.$.srvSaveTweaks.call({objects: [this.owner._config]});
	},

	handleHelpToggle: function(inSender, inEvent){
		if(this._ui == "compact") {
			if(this._helpOn) {
				this._helpOn = false;
			} else {
				this._helpOn = true;
				
				this.doSelect();
			}
		} else {
			this.doSelect();
		}
	},
	
	handleTweaksSaved: function(inSender, inResponse) {
		this.owner._config._rev = inResponse.results[0].rev;
	},

	handleServiceError: function() {
		this.$.dlgServiceError.openAtCenter();
	},

	handleSetPref: function(inPref, inValue) {
		var obj = {};
		obj[inPref] = inValue;
		this.$.srvSetPref.call(obj);
	},

	handleLunaNotify: function(inSender, inEvent) {
		if(this._ui == "compact") {
			if(!this._lunaOn) {
				this._lunaOn = true;

				this.$.dlgLunaRestart.open();

				this.$.restart.setCaption("Luna Restart");
			}
		}
			
		this.$.restart.applyStyle("display", "block");	
	},
	
	handleLunaRestart: function(inSender, inEvent) {
		this.$.dlgLunaRestart.open();
	},

	handleConfirmRestart: function(inSender, inEvent) {
		this.$.srvRestartLuna.call();
	},

	handleDismissDialog: function(inSender, inEvent) {
		this.$.dlgServiceError.close();
		this.$.dlgNumericError.close();
		this.$.dlgFreeTextError.close();
	},
	
	handleHelpSelect: function(inSender, inEvent) {
		if((this._ui == "full") || (this._helpOn == true))
			this.doSelect(inSender.name, this._help[inSender.name]);
	},

	openFilePicker: function(inSender) {
		for(var group in this.owner._config[this._category]) {
			for(var i = 0; i < this.owner._config[this._category][group].length; i++) {
				if(this.owner._config[this._category][group][i].key == inSender.name) {
					var multiSelect = false;
					
					if(this.owner._config[this._category][group][i].select == "multi")
						multiSelect = "single";
					
					this.$.filePicker.setMultiSelect(multiSelect);
					
					this._pickerItem = this.owner._config[this._category][group][i];
					
					this.$.srvGetFiles.call({
						filter: this.owner._config[this._category][group][i].filter,
						path: this.owner._config[this._category][group][i].path});
					
					break;
				}
			}
		}
	},

	handleGetFiles: function(inSender, inResponse) {
		for(var i = 0; i < inResponse.files.length; i++) {
			if(this._pickerItem.value.indexOf(inResponse.files[i].value) != -1)
				inResponse.files[i].selected = true;
		}

		this.$.filePicker.setTitle(this._pickerItem.label);
	
		this.$.filePicker.setItems(inResponse.files);

		this.$.filePicker.openPicker();
	},

	handlePicker: function(inSender) {
		for(var group in this.owner._config[this._category]) {
			for(var i = 0; i < this.owner._config[this._category][group].length; i++) {
				if(this.owner._config[this._category][group][i].key == inSender.name) {
					this.owner._config[this._category][group][i].value = this.$[inSender.name].getValue();
		
					if(this.owner._config[this._category][group][i].prefserv != "")
					{
						this.handleSetPref(
							this.owner._config[this._category][group][i].prefserv,
							this.$[inSender.name].getValue());
					}
					
					if(this.owner._config[this._category][group][i].restart == "luna")
						this.handleLunaNotify();
					
					this.saveTweaksConfig();
					
					break;
				}
			}
		}
	},

	handlePickerConfirm: function(inSender, inFiles) {
		if(inFiles.length > 0) {
			this._pickerItem.value = inFiles;

			var files = inFiles.toString();
			
			if(this._pickerItem.prefserv != "")
			{
				this.handleSetPref(
					this._pickerItem.prefserv,
					files);
			}
			
			if(files.length > 13)
				files = files.slice(0, 10) + "...";
		
			this.$[this._pickerItem.key].setContent(files);
		
			this.saveTweaksConfig();
		}
	},

	handleList: function(inSender) {
		for(var group in this.owner._config[this._category]) {
			for(var i = 0; i < this.owner._config[this._category][group].length; i++) {
				if(this.owner._config[this._category][group][i].key == inSender.name) {
					this.owner._config[this._category][group][i].value = this.$[inSender.name].getValue();
		
					if(this.owner._config[this._category][group][i].prefserv != "")
					{
						this.handleSetPref(
							this.owner._config[this._category][group][i].prefserv,
							this.$[inSender.name].getValue());
					}
					
					if(this.owner._config[this._category][group][i].restart == "luna")
						this.handleLunaNotify();

					this.saveTweaksConfig();
					
					break;
				}
			}
		}
	},

	handleChars: function(inSender, inEvent) {
		for(var group in this.owner._config[this._category]) {
			for(var i = 0; i < this.owner._config[this._category][group].length; i++) {
				if(this.owner._config[this._category][group][i].key == inSender.name) {
					if((!String.fromCharCode(inEvent.keyCode).match(this._matchNumeric)) &&
						((this.owner._config[this._category][group][i].input == "numeric") || 
						(!String.fromCharCode(inEvent.keyCode).match(this._matchFreeText))))
					{
						enyo.stopEvent(inEvent);
						
						break;
					}
				}
			}
		}
	},
	
	handleInput: function(inSender) {
		for(var group in this.owner._config[this._category]) {
			for(var i = 0; i < this.owner._config[this._category][group].length; i++) {
				if(this.owner._config[this._category][group][i].key == inSender.name) {
					if((!this.$[inSender.name].getValue().match(this._matchNumeric)) &&
						((this.owner._config[this._category][group][i].input == "numeric") || 
						(!this.$[inSender.name].getValue().match(this._matchFreeText))))
					{
						if(this.owner._config[this._category][group][i].input == "numeric") 
							this.$.dlgNumericError.openAtCenter();
						else
							this.$.dlgFreeTextError.openAtCenter();
					}
					else {
						this.owner._config[this._category][group][i].value = this.$[inSender.name].getValue();
		
						if(this.owner._config[this._category][group][i].prefserv != "")
						{
							this.handleSetPref(
								this.owner._config[this._category][group][i].prefserv,
								this.$[inSender.name].getValue());
						}
						
						if(this.owner._config[this._category][group][i].restart == "luna")
							this.handleLunaNotify();

						this.saveTweaksConfig();
					}
										
					break;
				}
			}
		}
	},
	
	handleToggle: function(inSender) {
		for(var group in this.owner._config[this._category]) {
			for(var i = 0; i < this.owner._config[this._category][group].length; i++) {
				if(this.owner._config[this._category][group][i].key == inSender.name) {
					this.owner._config[this._category][group][i].value = this.$[inSender.name].getState();
		
					if(this.owner._config[this._category][group][i].prefserv != "")
					{
						this.handleSetPref(
							this.owner._config[this._category][group][i].prefserv,
							this.$[inSender.name].getState());
					}
					
					if(this.owner._config[this._category][group][i].restart == "luna")
						this.handleLunaNotify();

					this.saveTweaksConfig();
					
					break;
				}
			}
		}
	}
});
