/*
ExtJS 3.4 simple window app 

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


	
	// create the window 
	if(!win){
		win = new Ext.Window({
			title:'Hello App',
			layout:'fit',
			width:500,
			height:300,
			closeAction:'hide',
			plain: true,

			items: new Ext.TabPanel({
				xtype: 'panel',
				border: false,
				html: '<h2>Hello World!</h2>'
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