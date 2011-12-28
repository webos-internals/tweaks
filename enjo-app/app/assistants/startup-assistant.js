function StartupAssistant() {
	this.appControl = Mojo.Controller.getAppController();
	this.appAssistant = this.appControl.assistant;

	this.firstMessage = $L(
		"<center><b>Here is some basic info for new users:</b></center><br><ul>" +
		"<li>Currently the application itself does not provide any tweaks, instead they are provided by patches</li>" +
		"<li>You can install patches using Preware, and you can recognize patches that have tweaks available by looking for the green plus band-aid badge</li>" +
		"<li>When you change the settings for a running application, you need to restart the application to see the change</li>" +
		"</ul>");
	
	this.secondMessage = $L("Have you already <a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ZFYPT3NYR36YJ\">donated</a>?");

	this.newMessages = [
	 {	version: '1.8.5', log: [ 'Cleaned up the code and fixed a small bug' ] },
	 {	version: '1.8.4', log: [ 'Polished the Enyo UI behavior on phones' ] },
	 {	version: '1.8.3', log: [ 'Fixed the restart luna menu action in Enyo UI' ] },
	 {	version: '1.8.2', log: [ 'Proper fix for the user interface selection' ] },
	 {	version: '1.8.1', log: [ 'Fixed to use Mojo UI if Enyo is not available' ] },
	 {	version: '1.8.0', log: [ 'Feature updates for the Enyo user interface' ] },
	 {	version: '1.6.5', log: [ 'Installation problems should be finally fixed' ] },
	 {	version: '1.6.4', log: [ 'Another small bug fix for the installation' ] },
	 {	version: '1.6.3', log: [ 'Fixed a small typo in the installation script' ] },
	 {	version: '1.6.2', log: [ 'Small fix for the installation of the service' ] },
	 {	version: '1.6.1', log: [ 'Fixed the black bar in Mojo UI for Pre3' ] },
	 {	version: '1.6.0', log: [ 'First public release of tweaks with enyo UI' ] },
	 {	version: '1.5.2', log: [ 'Small update for the tablet user interface' ] },
	 {	version: '1.5.1', log: [ 'Small bug fix for the tablet user interface' ] },
	 {	version: '1.5.0', log: [ 'Added enyo based user interface for the tablet' ] },
	 {	version: '1.3.3', log: [ 'Added more characters to be allowed for the text fields' ] },
	 {	version: '1.3.2', log: [ 'Promotional release to support sconix, no new features' ] },
	 {	version: '1.3.1', log: [ 'Fixed text field tweaks not count as new tweaks bug' ] },
	 {	version: '1.3.0', log: [ 'Added support for basic text field widget' ] },
	 {	version: '1.2.0', log: [ 'Work around the fatal webOS 2.x db permissions bug',
					 'Remove and reinstall Tweaks *twice* to fix it' ] },
	 {	version: '1.1.0', log: [ 'Allow for the tweaks json file to override the owner value' ] },
	 {
		version: '1.0.0', log: [
			'<b>Requires webOS 2.0.0 or newer to work!</b>',
			'Initial release of Tweaks app for webOS'
		]
	 }];
	
	this.menuModel = {
		visible: true,
		items: [
			{ label: $L("Help"), command: 'help' } ]
	};
	
	this.cmdMenuModel =
	{
		visible: false, 
		items: [
		    {},
		    {
				label: $L("Ok, I've read this. Let's continue ..."),
				command: 'continue'
		    },
		    {} ]
	};
};

StartupAssistant.prototype.setup = function() {
	if(this.appAssistant.isNewOrFirstStart == 0)
		this.controller.get('title').innerHTML = $L('Changelog');
	else if(this.appAssistant.isNewOrFirstStart == 1) 
		this.controller.get('title').innerHTML = $L("Welcome To Tweaks");
	else if(this.appAssistant.isNewOrFirstStart == 2) 
		this.controller.get('title').innerHTML = $L("Tweaks Changelog");
	
	var html = '';

	if(this.appAssistant.isNewOrFirstStart == 0) {
		for(var m = 0; m < this.newMessages.length; m++) {
			html += Mojo.View.render({object: {title: 'v' + this.newMessages[m].version}, template: 'templates/changelog'});
			html += '<ul>';
			
			for(var l = 0; l < this.newMessages[m].log.length; l++)
				html += '<li>' + this.newMessages[m].log[l] + '</li>';

			html += '</ul>';
		}
	} 
	else {
		if(this.appAssistant.isNewOrFirstStart == 1)
			html += '<div class="text">' + this.firstMessage + '</div>';
	   
		if(this.appAssistant.isNewOrFirstStart != 0)
			html += '<div class="text">' + this.secondMessage + '</div>';

		for(var m = 0; m < this.newMessages.length; m++) {
			html += Mojo.View.render({object: {title: 'v' + this.newMessages[m].version}, template: 'templates/changelog'});
			html += '<ul class="changelog">';
			
			for(var l = 0; l < this.newMessages[m].log.length; l++)
				html += '<li>' + this.newMessages[m].log[l] + '</li>';

			html += '</ul>';
		}
	}

	this.controller.get('data').innerHTML = html;

	this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
	
	if(this.appAssistant.isNewOrFirstStart)
		this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.cmdMenuModel);
	
	this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
};

StartupAssistant.prototype.activate = function(event) {
	this.timer = this.controller.window.setTimeout(this.showContinue.bind(this), 5 * 1000);
};

StartupAssistant.prototype.showContinue = function() {
	this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
};

StartupAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.command) {
		if(event.command == 'continue')
			this.controller.stageController.swapScene({name: 'main', transition: Mojo.Transition.crossFade}, 'main', false);
		else if(event.command == 'help')		
			this.controller.stageController.pushScene("support");
	}
};

