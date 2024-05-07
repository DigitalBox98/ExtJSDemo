/*
ExtJS 3.4 sample app 

*/
Ext.onReady(function(){
    var win;

	var jsonData = {
        "users": [
            { "id": 1, "name": "John Doe", "email": "john@example.com" },
            { "id": 2, "name": "Jane Smith", "email": "jane@example.com" },
            { "id": 3, "name": "Alice Johnson", "email": "alice@example.com" }
        ]
    };
	
	jsonStoreData = {
        "data": [
            { "id": 1, "name": "cron", "launch_script": "/usr/bin/cron", "status_command": "pending", "status": "not running" },
            { "id": 2, "name": "ftp", "launch_script": "ftp ftp://server.com", "status_command": "pending", "status": "not running" },
        ]
    };
	
	
    var store = new Ext.data.Store({
        reader: new Ext.data.JsonReader({
            root: 'users',
            fields: ['id', 'name', 'email']
        }),
        data: jsonData
    });
	
    new Ext.grid.GridPanel({
        renderTo: Ext.getBody(),
        store: store,
        width: 400,
        height: 200,
        title: 'Users data',
        columns: [
            { header: 'ID', dataIndex: 'id' },
            { header: 'Name', dataIndex: 'name' },
            { header: 'Email', dataIndex: 'email', flex: 1 }
        ]
    });

	// Main Card panel
	MainCardPanel = Ext.extend(Ext.Panel, {
		constructor: function (config) {
			this.owner = config.owner;
			this.module = config.module;
			config = Ext.apply({
				activeItem: 0,
				layout: "card",
				items: [
							new PanelServices({
									owner: this.owner
								})
							// new Ext.TabPanel({
							// xtype: 'panel',
							// border: false,
							// html: '<h2>Hello World!</h2>'
							// }),
				],
				border: false,
				listeners: {
					scope: this,
				}
			}, config);
			MainCardPanel.superclass.constructor.call(this, config)
		}
	});

	// Services panel
	PanelServices = Ext.extend(Ext.grid.GridPanel, {
		constructor: function (config) {
			this.owner = config.owner;
			this.loaded = false;
			this.store = new Ext.data.DirectStore({
				autoSave: false,
				fields: ["id", "name", "launch_script", "status_command", "status"],
				idProperty: "id",
				root: "data",
				data: jsonStoreData,
				writer: new Ext.data.JsonWriter({
					encode: false,
					listful: true,
					writeAllFields: true
				})
			});
			config = Ext.apply({
				itemId: "services",
				border: false,
				store: this.store,
				loadMask: true,
				tbar: {
					items: [{
						text: "add",
						itemId: "add",
						scope: this,
						handler: this.onClickAdd
					}, {
						text: "edit",
						itemId: "edit",
						scope: this,
						handler: this.onClickEdit
					}, {
						text: "delete",
						itemId: "delete",
						scope: this,
						handler: this.onClickDelete
					}, {
						text: "start",
						itemId: "start",
						scope: this,
						handler: this.onClickStart
					}, {
						text: "stop",
						itemId: "stop",
						scope: this,
						handler: this.onClickStop
					}, {
						text: "refresh",
						itemId: "refresh",
						scope: this,
						handler: this.onClickRefresh
					}]
				},
				columns: [{
					header: "name",
					sortable: true,
					dataIndex: "name"
				}, {
					header: "launch_script",
					dataIndex: "launch_script"
				}, {
					header: "status_command",
					dataIndex: "status_command"
				}, {
					header: "status",
					dataIndex: "status",
					renderer: function (value, metaData, record, rowIndex, colIndex, store) {
						if (value) {
							return "running";
						}
						return "not_running";
					}
				}]
			}, config);
			PanelServices.superclass.constructor.call(this, config);
		},
		
		onClickAdd: function () {
			var editor = new ServiceEditorWindow({}, this.store);
			editor.show();
		},
		
		onClickEdit: function () {
			var editor = new ServiceEditorWindow({}, this.store, this.getSelectionModel().getSelected());
			editor.show()
		},
		onClickDelete: function () {
			var records = this.getSelectionModel().getSelections();
			if (records.length != 0) {
				this.store.remove(this.getSelectionModel().getSelections());
				this.store.save();
			}
		},		
	});	
	
	// FormPanel base
	NewFormPanel = Ext.extend(Ext.FormPanel, {
		constructor: function (config) {
			config = Ext.apply({
				owner: null,
				items: [],
				padding: "20px 30px 2px 30px",
				border: false,
				header: false,
				trackResetOnLoad: true,
				monitorValid: true,
				fbar: {
					xtype: "statusbar",
					defaultText: "&nbsp;",
					statusAlign: "left",
					buttonAlign: "left",
					hideMode: "visibility",
					items: [{
						text: "commit",
						ctCls: "syno-sds-cp-btn",
						scope: this,
						handler: this.onApply
					}, {
						text: "reset",
						ctCls: "syno-sds-cp-btn",
						scope: this,
						handler: this.onReset
					}]
				}
			}, config);
			NewFormPanel.superclass.constructor.call(this, config);
		},
		onActivate: Ext.emptyFn,
		onDeactivate: Ext.emptyFn,
		onApply: function () {
			if (!this.getForm().isDirty()) {
				this.owner.setStatusError({
					text: "nochange_subject",
					clear: true
				});
				return;
			}
			if (!this.getForm().isValid()) {
				this.owner.setStatusError({
					text: "forminvalid",
					clear: true
				});
				return;
			}
			return true;
		},
		onReset: function () {
			if (!this.getForm().isDirty()) {
				this.getForm().reset();
				return;
			}
			this.owner.getMsgBox().confirm(this.title, "confirm_lostchange", function (response) {
				if ("yes" === response) {
					this.getForm().reset();
				}
			}, this);
		}
	});

	// Service panel
	PanelServiceEditor = Ext.extend(NewFormPanel, {
		constructor: function (config, record) {
			this.record = record;
			config = Ext.apply({
				itemId: "service",
				padding: "15px 15px 2px 15px",
				defaultType: "textfield",
				labelWidth: 130,
				fbar: null,
				defaults: {
					anchor: "-20"
				},
				items: [{
					fieldLabel: "name",
					name: "name"
				}, {
					fieldLabel: "launch_script",
					name: "launch_script"
				}, {
					fieldLabel: "status_command",
					name: "status_command"
				}]
			}, config);
			PanelServiceEditor.superclass.constructor.call(this, config);
			if (this.record !== undefined) {
				this.loadRecord();
			}
		},
		loadRecord: function () {
			this.getForm().findField("name").setValue(this.record.data.name);
			this.getForm().findField("launch_script").setValue(this.record.data.launch_script);
			this.getForm().findField("status_command").setValue(this.record.data.status_command);
		}
	});

	// Service window
	ServiceEditorWindow = Ext.extend(Ext.Window, {
		title: "service",
		constructor: function (config, store, record) {
			this.store = store;
			this.record = record;
			this.panel = new PanelServiceEditor({}, record);
			config = Ext.apply(config, {
				width: 550,
				height: 210,
				resizable: false,
				layout: "fit",
				items: [this.panel],
				buttons: [{
					text: "apply",
					scope: this,
					handler: this.onClickApply
				}, {
					text: "close",
					scope: this,
					handler: this.onClickClose
				}]
			})
			ServiceEditorWindow.superclass.constructor.call(this, config);
		},
		onClickApply: function () {
			if (this.record === undefined) {
				var record = new this.store.recordType({
					name: this.panel.getForm().findField("name").getValue(),
					launch_script: this.panel.getForm().findField("launch_script").getValue(),
					status_command: this.panel.getForm().findField("status_command").getValue()
				});
				this.store.add(record);
			} else {
				this.record.beginEdit();
				this.record.set("name", this.panel.getForm().findField("name").getValue());
				this.record.set("launch_script", this.panel.getForm().findField("launch_script").getValue());
				this.record.set("status_command", this.panel.getForm().findField("status_command").getValue());
				this.record.endEdit();
			}
			this.store.save();
			this.close();
		},
		onClickClose: function () {
			this.close();
		}
	});


	// Create the window with the MainCardPanel 
	if(!win){
		win = new Ext.Window({
			title:'Hello App',
			layout:'fit',
			width:500,
			height:300,
			closeAction:'hide',
			plain: true,

			items: 
			 new MainCardPanel({
						module: win,
						itemId: "grid",
						region: "center"
			 }),

			buttons: [{
				text:'Submit',
				disabled:true
			},{
				text: 'Close',
				handler: function(){
					win.hide();
				}
			}]
		});
	}
	win.show(this);

});