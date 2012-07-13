enyo.kind({
	name: "Main",
	kind: enyo.VFlexBox,
	flex: 1,
	className: "basic-back",
	
	_tweakGroups: [],
	_prefGroups: [],
	
	_tweakCategories: [
		{category: "browser", count: 0},
		{category: "calendar", count: 0},
		{category: "camera", count: 0},
		{category: "clock", count: 0},			
		{category: "contacts", count: 0},
		{category: "email", count: 0},
		{category: "messaging", count: 0},
		{category: "phone", count: 0},
		{category: "system", count: 0},			
	],
	
	_prefCategories: [	
	],
	
	events: {
		onSelect: ""
	},
	
	components: [
		{kind: "wi.Header", random: [{weight: 100, tagline: "Tweak the hell out of webOS!"}]}, 
		
		{name: "main", layoutKind: "VFlexLayout", flex: 1, components: [
			{name: "scroller", kind: "Scroller", height: "100%", components: [
				{name: "catPane", kind: "Pane", height: "100%", components: [
					{name: "tweakCategories", kind: "VirtualRepeater", onSetupRow: "setupTweakCategory", components: [
						{kind: "Item", layoutKind: "HFlexLayout", flex: 1, align: "center", tapHighlight: true, 
							onclick: "handleTweakCategory", components: [
								{name: "tweakIcon", kind: "Image", src: "images/icon-generic.png", style: "margin: -10px 18px -8px 5px;"}, 
								{name: "tweakCategory", flex: 1, style: "text-transform: capitalize; margin-top: -1px;"},
								{name: "tweakCount", className: "enyo-label", style: "padding-right: 20px;"}
						]}
					]},
					{name: "prefCategories", kind: "VirtualRepeater", onSetupRow: "setupPrefCategory", components: [
						{kind: "Item", layoutKind: "HFlexLayout", flex: 1, align: "center", tapHighlight: true, 
							onclick: "handlePrefCategory", components: [
								{name: "prefIcon", kind: "Image", src: "images/icon-generic.png", style: "margin: -10px 18px -8px 5px;"}, 
								{name: "prefCategory", flex: 1, style: "text-transform: capitalize; margin-top: -1px;"},
								{name: "prefCount", className: "enyo-label", style: "padding-right: 20px;"}
						]}
					]}
				]}
			]}
		]},
		{kind: "PageHeader", components:[
			{kind: "RadioGroup", style: "width: 100%;", onChange: "radioButtonSelected", components:[
				{kind: "RadioButton", content: "Tweaks"},
				{kind: "RadioButton", content: "Preferences"},
			]}
		]}
	],
	
	radioButtonSelected: function(inSender) {
		if(inSender.getValue() == 0) this.$.catPane.selectViewByIndex(0);
		else if(inSender.getValue() == 1) this.$.catPane.selectViewByIndex(1);
	},
	
	adjustInterface: function(inSize) {
		this.$.scroller.applyStyle("height", (inSize.h - 87) + "px");
	},
	
	updateTweaks: function(inTweaks) {
		this.owner._config = inTweaks;
	
		this._groups = [];		
		this._tweakCategories = [];
		
		var totalCount = 0;
		
		for(var category in inTweaks) {
			if(category.slice(0,1) == "_")
				continue;
				
			if(category.preference == true)
				continue;

			var count = 0;

			if(inTweaks[category] != undefined) {
				for(var group in inTweaks[category]) {
					for(var j = 0; j < inTweaks[category][group].length; j++) {
						if((inTweaks[category][group][j].deleted == undefined) && 
						((inTweaks[category][group][j].type == "TextField") ||
						(inTweaks[category][group][j].type == "ToggleButton") ||
						(inTweaks[category][group][j].type == "ListSelector") ||
						(inTweaks[category][group][j].type == "IntegerPicker") ||
						(inTweaks[category][group][j].type == "FilePicker")))
						{
							count++;
							totalCount++;
						}
					}
				}
			}
			
			if(category != "luna")
			{
				this._tweakGroups.push(inTweaks[category]);
				this._tweakCategories.push({category: category, count: count});
			}
			else
			{
				this._prefGroups.push(inTweaks[category]);
				this._prefCategories.push({category: category, count: count});
			}
		}

		this.$.tweakCategories.render();
		this.$.prefCategories.render();
		
		return totalCount;
	},
	
	setupTweakCategory: function(inSender, inIndex) {
		if((this._tweakCategories.length > 0) && (this._tweakCategories.length > inIndex) && (inIndex >= 0)) {
			this.$.tweakCategory.setContent(this._tweakCategories[inIndex].category);
			this.$.tweakCount.setContent(this._tweakCategories[inIndex].count);
			
			if((this._tweakCategories[inIndex].category == "browser") ||
				(this._tweakCategories[inIndex].category == "calendar") ||
				(this._tweakCategories[inIndex].category == "camera") ||
				(this._tweakCategories[inIndex].category == "clock") ||
				(this._tweakCategories[inIndex].category == "contacts") ||
				(this._tweakCategories[inIndex].category == "email") ||
				(this._tweakCategories[inIndex].category == "messaging") ||
				(this._tweakCategories[inIndex].category == "phone"))
			{
				this.$.tweakIcon.setSrc("images/icon-" + this._tweakCategories[inIndex].category + ".png");
			}
			
			if(this._tweakCategories[inIndex].count == 0) {
				this.$.tweakIcon.applyStyle("opacity", 0.4);
				
				this.$.tweakCategory.applyStyle("color", "#666666");
			}
					
			return true;
		}
	},

	handleTweakCategory: function(inSender, inEvent) {
		if(this._tweakCategories[inEvent.rowIndex].count > 0) {
	      var list = this.$.tweakCategories.getOffset();
		
			this.doSelect(list.top + (inEvent.rowIndex * 45), this._tweakCategories[inEvent.rowIndex].category, this._tweakGroups[inEvent.rowIndex]);
		}
	},
	
	
	setupPrefCategory: function(inSender, inIndex) {
		if((this._prefCategories.length > 0) && (this._prefCategories.length > inIndex) && (inIndex >= 0)) {
			this.$.prefCategory.setContent(this._prefCategories[inIndex].category);
			this.$.prefCount.setContent(this._prefCategories[inIndex].count);
		
			this.$.prefIcon.setSrc("images/icon-" + this._prefCategories[inIndex].category + ".png");
			
			if(this._prefCategories[inIndex].count == 0) {
				this.$.prefIcon.applyStyle("opacity", 0.4);
				
				this.$.prefCategory.applyStyle("color", "#666666");
			}
					
			return true;
		}
	},

	handlePrefCategory: function(inSender, inEvent) {
		if(this._prefCategories[inEvent.rowIndex].count > 0) {
	      var list = this.$.prefCategories.getOffset();
		
			this.doSelect(list.top + (inEvent.rowIndex * 45), this._prefCategories[inEvent.rowIndex].category, this._prefGroups[inEvent.rowIndex]);
		}
	}
});

