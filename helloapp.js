/*
ExtJS 3.4 simple window app 

*/
Ext.onReady(function(){
    var win;

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