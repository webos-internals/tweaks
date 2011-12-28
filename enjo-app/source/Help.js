enyo.kind({
	name: "Help",
	kind: enyo.VFlexBox,
	flex: 1,
	className: "basic-back",
		
	components: [
		{kind: "PageHeader", layoutKind: "VFlexLayout", components: [
			{name: "title", style: "text-transform: capitalize;", content: "Help"}
		]}, 
		{kind: "Scroller", flex: 1, components: [
			{name: "empty", style: "padding: 13px 18px 13px 18px; font-size: 16px; text-align: justify;",
				content: "Tap a group or just change settings to view the help text for the settings in the according group. " +
					"<br><br><br><b>Note:</b> When you change the settings for a running application, you need to restart the application to " +
					"see the change. Some settings require even luna restart." +
					"<br><br><b>Hint:</b> You can get more tweaks by installing patches using Preware, and you can recognize patches that " +
					"have tweaks available by looking for the green plus band-aid badge."}, 
			{name: "custom", style: "padding: 13px 18px 13px 18px; font-size: 16px; text-align: justify;", components: [
				{name: "text", style: "", allowHtml: true, content: ""}
			]}
		]}
	],
	
	updateHelp: function(inGroup, inHelp) {
		if(inGroup == undefined) {
			this.$.title.setContent("Help");
			
			this.$.custom.hide();
			this.$.empty.show();
		}
		else {
			this.$.empty.hide();
			this.$.custom.show();
			
			var help = "";
			
			for(var i = 0; i < inHelp.length; i++) {
				help += "<center><div class='enyo-label'>" + inHelp[i].label + "</div></center><br>" + inHelp[i].help + "<br><br>";
			}
			
			this.$.title.setContent(inGroup);
			
			this.$.text.setContent(help);
		}			
	}
});

