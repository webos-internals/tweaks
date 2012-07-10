/*
 *    MainAssistant - Mode Launcher's Default Configuration Scene
 */

function MainAssistant(params) {
	/* This is the creator function for your scene assistant object. It will be passed all the 
	 * additional parameters (after the scene name) that were passed to pushScene. The reference
	 * to the scene controller (this.controller) has not be established yet, so any initialization
	 * that needs the scene controller should be done in the setup function below. 
	 */

	this.DB_KIND = "org.webosinternals.tweaks:1";

	this.appControl = Mojo.Controller.getAppController();
	this.appAssistant = this.appControl.assistant;

	this.params = params;

	this.categories = [];
}    

MainAssistant.prototype.setup = function() {
	/* This function is for setup tasks that have to happen when the scene is first created
	 * Use Mojo.View.render to render view templates and add them to the scene, if needed.
    * Setup widgets and add event handlers to listen to events from widgets here. 
    */

	var date = new Date();

	if((date.getMonth() < 6) && (date.getFullYear() == "2011"))
		this.controller.get("subTitle").innerHTML = "Buy <a href=\"http://www.webos-internals.org/wiki/User:Sconix\">sconix</a> a Veer (by <a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=7A4RPR9ZX3TYS&lc=FI&item_name=For%20mode%20switcher%20and%20advanced%20patches&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted\">donating</a>)";
	else if(this.appAssistant.isNewOrFirstStart)
		this.controller.get("subTitle").innerHTML = "Have you already <a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ZFYPT3NYR36YJ\">donated</a>?";

	this.controller.get("version").innerHTML = "v" + Mojo.Controller.appInfo.version;

	this.modelWaitSpinner = { spinning: false };

	this.controller.setupWidget('wait-spinner', {spinnerSize: Mojo.Widget.spinnerLarge}, this.modelWaitSpinner);

	this.itemsCommandMenu = [{},{'label': $L("Luna Restart Required"), 'command': "restart", 'width': 320},{}];

	this.modelCommandMenu = {'visible': false, 'items': this.itemsCommandMenu};

	this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, this.modelCommandMenu);

	this.modelCategoriesList = {items: this.categories, disabled: true};
	
	this.controller.setupWidget("CategoriesList", {
		itemTemplate: 'templates/categories-item',
		swipeToDelete: false,
		autoconfirmDelete: false,
		reorderable: false},
		this.modelCategoriesList);

	this.controller.listen(this.controller.get('CategoriesList'), Mojo.Event.listTap, 
		this.handleCategoryListTap.bind(this));

	this.loadTweaksConfig();
}

//

MainAssistant.prototype.updatePreferences = function(response) {
}

//

MainAssistant.prototype.handleCategoryListTap = function(event) {
	if (event.item.count > 0) {
		var category = event.item.name.toLowerCase();
		
		var widgets = {listSelectors: 0, textFields: 0, toggleButtons: 0, integerPickers: 0, 
			listChoices:[], listLabels: [], pickerLabels: [], lowLimits: [], highLimits: [], textInputs: []};
		
		var list = [];
		var prefs = {};
		
		if(this.config[category] != undefined) {
			for(var group in this.config[category]) {
				list.push({group: group, elements: ""});

				for(var i = 0; i < this.config[category][group].length; i++) {
					if(this.config[category][group][i].deleted != undefined)
						continue;

					if((i == 0) && (this.config[category][group].length == 1))
						list[list.length - 1].elements += "<div class='palm-row single'>";
					else if(i == 0)
						list[list.length - 1].elements += "<div class='palm-row first'>";
					else if(i == (this.config[category][group].length - 1))
						list[list.length - 1].elements += "<div class='palm-row last'>";
					else
						list[list.length - 1].elements += "<div class='palm-row'>";
	
					list[list.length - 1].elements += "<div class='palm-row-wrapper'>";
	
					if(this.config[category][group][i].type == "ToggleButton") {
						var id = widgets.toggleButtons++;
					
						prefs["ToggleButton" + id] = this.config[category][group][i];
										
						list[list.length - 1].elements += "<div class='help-overlay' id='helpToggleButton" + id + "'></div>" +
							"<div name='ToggleButton" + id + "' x-mojo-element='ToggleButton'></div>" + 
							"<div class='title left'>" + this.config[category][group][i].label + "</div>";		
							
						list[list.length - 1]["valueToggleButton" + id] = this.config[category][group][i].value;
					}
					else if(this.config[category][group][i].type == "TextField") {
						var id = widgets.textFields++;
	
						prefs["TextField" + id] = this.config[category][group][i];
	
						widgets.textInputs.push(this.config[category][group][i].input);
																
						list[list.length - 1].elements += "<div class='help-overlay' id='helpTextField" + id + "'></div>" +
							"<div class='title left'>" + this.config[category][group][i].label + "</div>" +
							"<div class='palm-row single' style='padding-left:10px;padding-right:10px;margin-top:-10px;padding-bottom:10px;'>" + 
							"<div class='textfield-group' x-mojo-focus-highlight='true'><div class='title'>" +
							"<div name='TextField" + id + "' class='focused' x-mojo-element='TextField'></div></div></div></div>";	
	
						list[list.length - 1]["valueTextField" + id] = this.config[category][group][i].value;
					}
					else if(this.config[category][group][i].type == "ListSelector") {
						var id = widgets.listSelectors++;
	
						prefs["ListSelector" + id] = this.config[category][group][i];
										
						widgets.listChoices.push(this.config[category][group][i].choices);
						widgets.listLabels.push(this.config[category][group][i].label);
	
						list[list.length - 1].elements += "<div class='help-overlay' id='helpListSelector" + id + "'></div>" +
							"<div name='ListSelector" + id + "' x-mojo-element='ListSelector'></div>";	
	
						list[list.length - 1]["valueListSelector" + id] = this.config[category][group][i].value;
					}
					else if(this.config[category][group][i].type == "IntegerPicker") {
						var id = widgets.integerPickers++;
	
						prefs["IntegerPicker" + id] = this.config[category][group][i];
	
						widgets.pickerLabels.push(this.config[category][group][i].label);
						widgets.lowLimits.push(this.config[category][group][i].min);
						widgets.highLimits.push(this.config[category][group][i].max);
	
						list[list.length - 1].elements += "<div class='help-overlay' id='helpIntegerPicker" + id + "'></div>" +
							"<div name='IntegerPicker" + id + "' x-mojo-element='IntegerPicker'></div>";	
						
						list[list.length - 1]["valueIntegerPicker" + id] = this.config[category][group][i].value;
					}
					
					list[list.length - 1].elements += "</div></div>";				
				}
				
				if(list[list.length - 1].elements == "")
					list.pop();
			}
		}

		this.controller.stageController.pushScene("config", event.item.name, widgets, this.config, prefs, list, this.modelCommandMenu.visible);
	}
}

MainAssistant.prototype.loadTweaksConfig = function() {
	this.modelWaitSpinner.spinning = true;

	this.controller.modelChanged(this.modelWaitSpinner, this);

	this.controller.serviceRequest("palm://org.webosinternals.tweaks.prefs", {method: "scan", parameters: {},
		onSuccess: function(response) {
			this.controller.serviceRequest("palm://com.palm.db", {method: "find", parameters: {
				query: {from: this.DB_KIND, limit: 2 }},
				onSuccess: this.handleTweaksConfig.bind(this),
				onFailure: this.handleTweaksConfig.bind(this)});
		}.bind(this),
		onFailure: function(response) {
			this.modelWaitSpinner.spinning = false;

			this.controller.modelChanged(this.modelWaitSpinner, this);
		
			this.controller.showAlertDialog({
				allowHTMLMessage:	true,
				preventCancel: true,
				title: 'Tweaks',
				message:	"<div style='text-align:justify;'>Failed to scan available tweaks. The possible reasons for this are that there was an installation error or an unknown service error.</div>",
				choices:	[{label:$L("Ok"), value:'ok'}]
			});
		}.bind(this)});
}

MainAssistant.prototype.handleTweaksConfig = function(response) {
	this.modelWaitSpinner.spinning = false;

	this.controller.modelChanged(this.modelWaitSpinner, this);

	if (response.returnValue === false) {
		this.errorMessage('<b>Service Error (db8 find):</b><br>'+response.errorText);
		this.config = [];
	}
	else if (response.results.length === 0) {
		Mojo.Log.error("No preferences objects found.");
		this.config = [];
	}
	else if (response.results.length > 1) {
		Mojo.Log.error("More than 1 preferences object found, using first response");
		this.config = response.results[0];
	}
	else {
		this.config = response.results[0];
	}

	this.categories.clear();

	var totalCount = 0;

	for(var category in this.config) {
	    if(category.slice(0,1) == "_")
		continue;
		
	    var count = 0;

	    if(this.config[category] != undefined) {
		for(var group in this.config[category]) {
		    for(var j = 0; j < this.config[category][group].length; j++) {
			if((this.config[category][group][j].deleted == undefined) && 
			   ((this.config[category][group][j].type == "TextField") ||
				 (this.config[category][group][j].type == "ToggleButton") ||
			    (this.config[category][group][j].type == "ListSelector") ||
			    (this.config[category][group][j].type == "IntegerPicker")))
			    {
				count++;
				totalCount++;
			    }
		    }
		}
	    }

	    this.categories.push({name: category, count: count, rowClass: (count == 0 ? 'disabled' : '')});
	}
		
	var cookie = new Mojo.Model.Cookie('tweaks');

	var data = cookie.get();
		
	if(!data)
	    data = {total: 0};
			
	var appController = Mojo.Controller.getAppController();
		
	if((totalCount - data.total) == 0)
	    appController.showBanner($L("No new tweaks since last start"), {});
	else if((totalCount - data.total) < 0)
	    appController.showBanner((data.total - totalCount) + $L(" tweak(s) were removed"), {});
	else if((totalCount - data.total) > 0)
	    appController.showBanner((totalCount - data.total) + $L(" new tweak(s) available"), {});
		
	cookie.put({total: totalCount});
		
	if(totalCount == 0) {
	    this.controller.showAlertDialog({
		    title: $L("No tweaks available"),
			message: "<div style='text-align:justify;'>There are no tweaks available. " +
			"The reason for this is that you don't have any patches with tweaks installed.</div>",
			choices:[
				 {label:$L("Ok"), value:"ok", type:'default'}],
			preventCancel: false,
			allowHTMLMessage: true
			});
	}

		
	this.controller.modelChanged(this.modelCategoriesList, this);
}

//

MainAssistant.prototype.errorMessage = function(msg)
{
	this.controller.showAlertDialog({
			allowHTMLMessage:	true,
			preventCancel:		true,
			title:				'Tweaks',
			message:			msg,
			choices:			[{label:$L("Ok"), value:'ok'}],
			onChoose:			function(e){}
		});
};

//

MainAssistant.prototype.handleCommand = function(event) {
	if(event.command == "restart") {
		this.controller.showAlertDialog({
			title: $L("Luna restart required"),
			message: "You have made changes that require Luna restart.",
			choices:[
				{label:$L("Restart Luna"), value:"restart", type:'default'},
				{label:$L("Cancel"), value:"cancel", type:'default'}],
			preventCancel: false,
			allowHTMLMessage: true,
			onChoose: function(value) {
				if(value == "restart") {
					this.modelCommandMenu.visible = false;
		
					this.controller.modelChanged(this.modelCommandMenu, this);

					this.controller.serviceRequest("palm://org.webosinternals.ipkgservice", {
						method: "restartLuna", parameters: {}});
				}
				else if(value == "cancel") {
					this.modelCommandMenu.visible = false;
		
					this.controller.modelChanged(this.modelCommandMenu, this);
				}
			}.bind(this)});
	}
}

//

MainAssistant.prototype.activate = function(event) {
	/* Put in event handlers here that should only be in effect when this scene is active. 
	 *	For  example, key handlers that are observing the document. 
	 */

	if((event) && (event.restartRequired)) {
		this.modelCommandMenu.visible = true;
		
		this.controller.modelChanged(this.modelCommandMenu, this);
	}
}
	
MainAssistant.prototype.deactivate = function(event) {
	/* Remove any event handlers you added in activate and do any other cleanup that should 
	 * happen before this scene is popped or another scene is pushed on top. 
	 */
}

MainAssistant.prototype.cleanup = function(event) {
	/* This function should do any cleanup needed before the scene is destroyed as a result
	 * of being popped off the scene stack.
	 */ 
}

