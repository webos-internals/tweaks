enyo.kind({
	name: "Tweaks",
	kind: enyo.VFlexBox,
	
	_ui: "full",
	
	_size: null,
	
	_config: null,

	_defaults: {
		version: "0.0.0"
	},
	
	components: [
		{kind: "ApplicationEvents", onBack: "handleBackEvent"},	
	
		{kind: "AppMenu", components: [
			{caption: "Restart Luna", onclick: "handleLunaRestart"}
		]},

		{name: "dlgServiceError", kind: "ModalDialog", caption: "Unknown Service Error", components: [
			{content: "Configuration could not be loaded since the service returned an error!", className: "enyo-text-error"},
			{kind: "Button", caption: "OK", onclick: "handleConfirmError", style: "margin-top: 10px;"}
		]}, 

		{name: "appPane", kind: "SlidingPane", flex: 1, style: "background: #666666;", components: [
			{name: "left", width: "320px", components: [
				{name: "leftPane", kind: "Pane", flex: 1, components: [
					{layoutKind: "VFlexLayout", flex: 1, pack: "top", components: [
						{kind: "wi.Header", random: [{weight: 100, tagline: "Tweak the hell out of webOS!"}]}, 
						
						{layoutKind: "VFlexLayout", flex: 1, align: "center", pack: "center", components: [
							{name: "leftSpinner", kind: "SpinnerLarge"},
							{name: "leftProgress", content: "", style: "margin: 0px 0px 10px 0px; font-size: 0.7em; color: #666666;"}
						]}
					]}, 
					{name: "clsMain", kind: "Main", className: "enyo-bg", onSelect: "handleCategorySelect"}, 
					{name: "clsStartup", kind: "Startup", className: "enyo-bg", onDone: "startupDone"}
				]}
			]}, 
			{name: "middle", fixedWidth: true, peekWidth: 64, width: "704px", dragAnywhere: false, className: "blank-slider", components: [
				{name: "middlePane", kind: "Pane", flex: 1, components: [
					{layoutKind: "VFlexLayout", flex: 1, align: "center", pack: "center", style: "background: #666666;", components: [
						{name: "middleImage", kind: "Image", src: "images/empty-icon.png"},
						{name: "middleSpinner", kind: "SpinnerLarge"},
						{name: "middleProgress", content: "", style: "margin-top: -20px; font-size: 0.7em; color: #999999;"}
					]},
					{name: "clsConfig", kind: "Config", className: "enyo-bg", onSelect: "handleGroupSelect"}
				]}
			]}, 
			{name: "right", fixedWidth: true, peekWidth: 768, width: "256px", dragAnywhere: false, className: "blank-slider", components: [
				{name: "clsHelp", kind: "Help", className: "enyo-bg"}
			]}
		]},

		{name: "srvLoadTweaks", kind: "DbService", dbKind: "org.webosinternals.tweaks:1", method: "find", 
			onSuccess: "handleLoadFinished", onFailure: "handleServiceError"}, 

		{name: "srvScanTweaks", kind: "PalmService", service: "palm://org.webosinternals.tweaks.prefs/", method: "scan", 
			onSuccess: "handleScanFinished", onFailure: "handleServiceError"}
	],
	
	rendered: function() {
		this.inherited(arguments);

		this.adjustInterface();

		if((localStorage) && (localStorage["prefs"])) {
			prefs = enyo.mixin(this._defaults, enyo.json.parse(localStorage["prefs"]));

			if(prefs.version != enyo.fetchAppInfo().version) {
				this.$.clsStartup.hideWelcomeText();

				this.$.leftPane.selectViewByIndex(2);
			} else {
				this.startupDone();
			}
		}
		else {
			this.$.leftPane.selectViewByIndex(2);

			prefs = this._defaults;
		}
		
		prefs.version = enyo.fetchAppInfo().version;

		localStorage["prefs"] = enyo.json.stringify(prefs);
	},

	resizeHandler: function() {
		this.adjustInterface();
	},

	adjustInterface: function() {
		this._size = enyo.fetchControlSize(this);

		if(this._size.w < 640) {
			this._ui = "compact";
		
			enyo.setAllowedOrientation("up");
		} else {
			this.$.middle.applyStyle("width", (this._size.w - 320) + "px");
			
			this.$.right.setPeekWidth(this._size.w - 320 + 64);
		}

		this.$.clsMain.adjustInterface(this._size);
		this.$.clsConfig.adjustInterface(this._size);
		this.$.clsStartup.adjustInterface(this._size);
	},

	startupDone: function() {
		this.$.leftProgress.setContent("Scanning installed tweaks...");		
		this.$.middleProgress.setContent("Scanning installed tweaks...");		

		this.showSpinner();

		this.$.srvScanTweaks.call({});
	},

	showSpinner: function() {
		if(this._ui == "compact") {
			this.$.leftSpinner.show();

			this.$.leftPane.selectViewByIndex(0);
		} else {
			this.$.leftPane.selectViewByIndex(1);
		}

		this.$.middleImage.hide();

		this.$.middleSpinner.show();

		this.$.middlePane.selectViewByIndex(0);
	},

	hideSpinner: function() {
		if(this._ui == "compact") {
			this.$.leftSpinner.hide();

			this.$.leftPane.selectViewByIndex(1);
		}

		this.$.middleImage.show();

		this.$.middleSpinner.hide();
	},	

	handleBackEvent: function(inSender, inEvent) {
		if((this._ui == "compact") && (this.$.appPane.getViewIndex() > 0)) {
			enyo.stopEvent(inEvent);
		
			this.$.appPane.back();
		}
	},

	handleLunaRestart: function(inSender, inEvent) {
		this.$.clsConfig.handleLunaRestart();
	},

	handleConfirmError: function(inSender, inEvent) {
		this.$.dlgServiceError.close();
	},

	handleServiceError: function(inSender, inResponse) {
		this.$.dlgServiceError.openAtCenter();	
	},

	handleScanFinished: function(inSender, inResponse) {
		this.$.srvLoadTweaks.call({});
	},
	
	handleLoadFinished: function(inSender, inResponse) {
		var oldTotal = 0;
		var newTotal = 0;

		this.hideSpinner();
		
		if((inResponse) && (inResponse.results) && (inResponse.results.length > 0)) {
			var newTotal = this.$.clsMain.updateTweaks(inResponse.results[0]);

			if((localStorage) && (localStorage["data"]))
				var oldTotal = enyo.json.parse(localStorage["data"]).total;

			if(newTotal == 0)
				this.$.middleProgress.setContent("There are no tweaks available");
			else if((newTotal - oldTotal) < 0)
				this.$.middleProgress.setContent("There was " + (oldTotal - newTotal) + " tweak(s) removed");		
			else if((newTotal - oldTotal) > 0)
				this.$.middleProgress.setContent("There are " + (newTotal - oldTotal) + " new tweak(s) available");
			else 
				this.$.middleProgress.setContent("There are " + newTotal + " tweak(s) available");

			if(this._ui == "compact") {
				if((newTotal - oldTotal) < 0)
					enyo.windows.addBannerMessage("There was " + (oldTotal - newTotal) + " tweak(s) removed...", "{}");		
				else if((newTotal - oldTotal) > 0)
					enyo.windows.addBannerMessage("There is " + (newTotal - oldTotal) + " new tweak(s) available...", "{}"); 
			}
		
			localStorage["data"] = enyo.json.stringify({total: newTotal});
		} else {
			this.$.middleProgress.setContent("There are no tweaks available");
		}
	},

	handleCategorySelect: function(inSender, inMarker, inCategory, inGroups) {
		if(this._ui == "compact")
			this.$.appPane.selectViewByIndex(1);
		
		this.$.middle.removeClass("blank-slider");

		this.$.clsHelp.updateHelp();
		
		this.$.clsConfig.updateGroups(inMarker, inCategory, inGroups);

		this.$.middlePane.selectViewByIndex(1);
	},

	handleGroupSelect: function(inSender, inGroup, inHelp) {
		if((this._ui == "compact") || (!inGroup)) {
			if(this.$.appPane.getViewIndex() == 2)
				this.$.appPane.selectViewByIndex(0);
			else
				this.$.appPane.selectViewByIndex(2);
		}
		
		this.$.clsHelp.updateHelp(inGroup, inHelp);
	}	
});

