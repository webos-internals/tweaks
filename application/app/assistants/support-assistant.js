function SupportAssistant(customModes) {
	this.customModes = customModes;
}

//

SupportAssistant.prototype.setup = function() {
	this.modelMenu = {
		visible: true,
		items: [
			{label: $L("Changelog"), command: 'changelog'} ]
	};

	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true},
		this.modelMenu);

	// SHOW HELP

	this.controller.get('appver').update(Mojo.Controller.appInfo.version);
	this.controller.get('appname').update(Mojo.Controller.appInfo.title);

	this.controller.listen(this.controller.get('WikiLink'), Mojo.Event.tap, 
		this.openUrl.bind(this, "wiki"));

	this.controller.listen(this.controller.get('ForumLink'), Mojo.Event.tap, 
		this.openUrl.bind(this, "forum"));

	this.controller.listen(this.controller.get('EmailLink'), Mojo.Event.tap, 
		this.sendEmail.bind(this, "help"));
}

SupportAssistant.prototype.cleanup = function() {
}

//

SupportAssistant.prototype.activate = function() {
}

SupportAssistant.prototype.deactivate = function() {
}

//

SupportAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		if(event.command == 'changelog')		
			this.controller.stageController.pushScene("startup");
	}
};

//

SupportAssistant.prototype.openUrl = function(link) {
	if(link == "wiki")
		window.open('http://www.webos-internals.org/wiki/Application:Tweaks');
	else if(link == "forum")
		window.open('http://forums.precentral.net/');
}

