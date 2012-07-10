enyo.kind({
	name: 'wi.Header',
	kind: enyo.Control,
	
	published: {
		type: '',
		icon: '',
		title: '',
		version: '',
		tagline: 'Random Taglines Are Awesome',
		date: [],
		random: []
	},
	
	_selected: false,
	_icon: '',
	_title: '',
	_version: '',
	_tagline: '',
	
	components: [
		{kind: 'PageHeader', components: [
			{name: 'header', kind: 'HFlexBox', className: 'wi-header', components: [
				{name: 'icon', className: 'icon', kind: 'Image'},
				{className: 'text', flex: 1, components: [
					{kind: 'HFlexBox', components: [
						{name: 'title', className: 'title', allowHtml: true},
						{name: 'version', flex: 1, className: 'version'},
					]},
					{name: 'tagline', className: 'tagline', allowHtml: true},
				]},
			]},
		]},
	],
	
	rendered: function() {
		if(!this._selected) {
			var d	= this.getDate()
			var r	= this.getRandom();
			
			this._icon = d.icon || r.icon || this.icon || enyo.fetchAppInfo().icon;
			this._title = d.title || r.title || this.title || enyo.fetchAppInfo().title;
			this._version = d.version || r.version || 'v' + (this.version || enyo.fetchAppInfo().version);
			this._tagline = d.tagline || r.tagline || this.tagline || '&nbsp;';
			this._selected	= true;
		}
		
		if(this.type)
			this.$.header.addClass(this.type);
		
		this.$.icon.setSrc(this._icon);
		this.$.title.setContent(this._title);
		this.$.version.setContent(this._version);
		this.$.tagline.setContent(this._tagline);
	},
	
	setTagLine: function(tagLine) {
		this.$.tagline.setContent(tagLine);
	},
	
	getDate: function() {
		if(this.date.length == 0)
			return false;
			
		var date = new Date();
		var day = date.getDate();
		var month = date.getMonth() + 1;
		var year = date.getFullYear();
		
		for(var d = 0; d < this.date.length; d++) {
			if((this.date[d].day   && this.date[d].day   == day) &&
				(this.date[d].month && this.date[d].month == month) &&
				(this.date[d].year  && this.date[d].year  == year))
			{
				return this.date[d];
			}
		}
		
		for(var d = 0; d < this.date.length; d++) {
			if((this.date[d].day   && this.date[d].day   == day) &&
				(this.date[d].month && this.date[d].month == month) &&
				(!this.date[d].year))
			{
				return this.date[d];
			}
		}
		
		return false;
	},
	
	getRandom: function() {
		var w = 0;
		
		if(this.random.length == 0)
			return false;
		
		for(var r = 0; r < this.random.length; r++) {
			if (!this.random[r].weight) this.random[r].weight = 1;
			w += this.random[r].weight;
		}
		
		var ran = Math.floor(Math.random() * w) + 1;
		
		for(var r = 0; r < this.random.length; r++) {
			if(ran <= this.random[r].weight)
				return this.random[r];
			else
				ran -= this.random[r].weight;
		}
		
		return this.random[0];
	}	
});

enyo.kind({
	name: 'wi.Picker',
	kind: enyo.Control,
	
	events: {
		onSelect: ""
	},
	
	published: {
		title: '',
		items: [],
	
		multiSelect: false
	},
	
	_title: '',
	_items: [],
	
	_multiSelect: false,
	
	components: [
		{name: "pickerPopup", lazy: false, kind: "Popup", style: "width: 80%;max-width: 500px;", components: [
			{name: "pickerTitle", content: "", flex: 1, style: "text-align: center;"},
			{name: "pickerFiles", kind: "VirtualList", className: "wi-picker", onSetupRow: "setupPickerRow", components: [
				{name: "pickerItem", kind: "Item", tapHighlight: false, className: "wi-picker-item", onclick: "handleItemSelect", components: [
					{name: "pickerName", content: ""}
				]}
			]},
			{layoutKind: "HFlexLayout", components: [
				{kind: "Button", flex: 1, caption: "Cancel", onclick: "handlePickerCancel"},
				{kind: "Button", flex: 1, caption: "OK", className: "enyo-button-affirmative", onclick: "handlePickerConfirm"}
			]}
		]}
	],
	
	rendered: function() {
		this._title	= this.title || "";
		this._items	= this.items || [];
		
		this._multiSelect = this.multiSelect || false;

		this.$.pickerTitle.setContent(this._title);
	},
	
	setTitle: function(inTitle) {
		this._title = inTitle;
		
		this.$.pickerTitle.setContent(this._title);
	},
	
	setItems: function(inItems) {
		this._items = inItems;
		
		this.$.pickerFiles.refresh();
	},
	
	setMultiSelect: function(inMultiSelect) {
		this._multiSelect = inMultiSelect;
	},
	
	openPicker: function() {
		this.$.pickerPopup.openAtCenter();
	},
	
	setupPickerRow: function(inSender, inIndex) {
		if((inIndex >= 0) && (inIndex < this._items.length)) {
			if(this._items[inIndex].selected)
				this.$.pickerItem.addClass("selected");
			else
				this.$.pickerItem.addRemoveClass("selected");
			
			this.$.pickerName.setContent(this._items[inIndex].label);
		
			return true;
		}
	},

	handleItemSelect: function(inSender, inEvent) {
		if(!this._multiSelect) {
			for(var i = 0; i < this._items.length; i++) {			
				this._items[i].selected = false;
			}
		}
		
		if(!inSender.hasClass("selected")) {
			this._items[inEvent.rowIndex].selected = true;
		
			inSender.addClass("selected");
		} else {
			this._items[inEvent.rowIndex].selected = false;		
		
			inSender.addRemoveClass("selected");
		}

		if(!this._multiSelect)
			this.$.pickerFiles.refresh();			
	},

	handlePickerCancel: function() {
		this.$.pickerPopup.close();
	},
	
	handlePickerConfirm: function() {
		this.$.pickerPopup.close();	
		
		var items = [];
		
		for(var i = 0; i < this._items.length; i++) {
			if(this._items[i].selected)
				items.push(this._items[i].value);
		}
		
		this.doSelect(items);	
	}
});

