/*
 * Tools.js - View
 * 
 * Handle displaying Tools
 */

Ext.define('FWUE.view.Tools', {
    extend: 'Ext.Container',

    requires:[
        'FWUE.view.phone.Tools',
        'FWUE.view.tablet.Tools',
        'FWUE.view.Bet',
        'FWUE.view.Broadcast',
        'FWUE.view.Dividend',
        'FWUE.view.Exchange',
        'FWUE.view.Issuance',
        'FWUE.view.OTCMarket',
        'FWUE.view.Send',
        'FWUE.view.Sign'
    ],

    config: {
        id: 'toolsView',
        layout: 'card',
        items:[]
    },

    initialize: function(){
        var me = this;
        // Setup alias to main controller
        me.main  = FWUE.app.getController('Main');
        // Add view based on device type
        me.add({ xclass:'FWUE.view.' + me.main.deviceType + '.Tools' });
        // Setup some aliases to the various components
        me.list  = me.down('fw-toolslist');
        me.cards = me.down('[itemId=tools]');
        // Call parent function
        me.callParent();
    },

    // Handle showing a specific view in the tools card index
    showView: function(id, xclass, cfg){
        var me = this,
            cfg  = (cfg) ? cfg : {},
            view = Ext.getCmp(id);
        // Set some options for phones
        if(me.main.deviceType=='phone'){
            cfg.back = function(){
                me.cards.setActiveItem(0);
            }
        }
        // If we found existing view, update data and use it
        if(!view)
            view = me.cards.add(Ext.apply({ xclass: xclass }, cfg));
        // Handle updating the view with any passed config
        if(cfg)
            view.updateView(cfg);
        // Show view using correct method
        me.cards.setActiveItem(view);
    },

    // Define some quick aliases for showing the different views
    showSendTool:       function(cfg){ this.showView('sendView','FWUE.view.Send',cfg);  },
    showIssueTool:      function(cfg){ this.showView('issuanceView','FWUE.view.Issuance',cfg);  },
    showBroadcastTool:  function(cfg){ this.showView('broadcastView','FWUE.view.Broadcast',cfg);  },
    showExchangeTool:   function(cfg){ this.showView('exchangeView','FWUE.view.Exchange',cfg);  },
    showSignTool:       function(cfg){ this.showView('signView','FWUE.view.Sign',cfg);  },
    showOTCMarketTool:  function(cfg){ this.showView('otcMarketView','FWUE.view.OTCMarket',cfg);  },
    showReceiveTool:    function(cfg){ this.showView('receiveView','FWUE.view.Receive',cfg);  },
    showDividendTool:   function(cfg){ this.showView('dividendView','FWUE.view.Dividend',cfg);  },
    showBetTool:        function(cfg){ this.showView('betView','FWUE.view.Bet',cfg);  }

});

