/*
 * AddressList.js - View
 * 
 * Display address list
 */

Ext.define('FWUE.view.AddressList', {
    extend: 'Ext.dataview.List',
    xtype: 'fw-addresslist',

    requires:[
        'Ext.field.Search'
    ],
    
    config: {
        id: 'addressList',
        cls: 'fw-panel fw-addresslist',
        bgCls: 'fw-background',
        // infinite: true,
        variableHeights: true,
        striped: true,
        disableSelection: true,
        store: 'Addresses',
        emptyText: 'No addresses found',
        deferEmptyText: false,
        itemTpl: new Ext.XTemplate(
            '<div class="{[this.getClasses(values)]}">' +
                '<b>{label}</b><br/><i>{address}</i><br/>' +
                '<table width="300">' +
                '<tr>' +
                    '<td class="icon-btc icon-20"></td><td class="fw-addresslist-balance">{[this.getBalance(values, "BTC")]}</td>' +
                    '<td class="icon-xcp icon-20"></td><td class="fw-addresslist-balance">{[this.getBalance(values, "XUP")]}</td>' +
                '</tr>' +
                '</table>' +
            '</div>',
            {
                getClasses: function(values){
                    var cls = 'fw-addresslist-address ';
                    if(values.address==FWUE.WALLET_ADDRESS.address)
                        cls += 'current-address';
                    return cls;
                },
                getBalance: function(values, asset){
                    var store  = Ext.getStore('Balances'),
                        prefix = values.address.substr(0,5),
                        data   = store.data.all,
                        qty    = 0;
                    // Loop through all store data and try to find balance
                    Ext.each(data, function(item){
                        var rec = item.data;
                        if(rec.prefix==prefix && rec.asset==asset)
                            qty = rec.quantity;
                    });
                    return numeral(qty).format('0,0.00000000');

               }
            }
        ),
        items:[{
            // Define top toolbar
            xtype: 'fw-toptoolbar',
            title: 'Select Address',
            back: true,
            onBack: function(){
                FWUE.app.getController('Main').showMainView();
            },
            plus: true,
            onPlus: function(){
                var me = Ext.getCmp('addressList');
                me.onAddAddress();
            }
        },{
            // Define list search toolbar
            docked: 'top',
            xtype: 'toolbar',
            cls: 'tbe-search-toolbar',
            ui: 'light',
            itemId: 'listSearch',
            items:[{
                flex: 1,
                xtype: 'searchfield',
                placeHolder: 'Search...',
                name: 'search',
                listeners: {
                    // Filter the list as the user is typing
                    keyup: function(cmp){
                        cmp.up('fw-addresslist').onListSearch(cmp.getValue());
                    },
                    // Filter the list when the field is blurred
                    change: function(cmp){
                        cmp.up('fw-addresslist').onListSearch(cmp.getValue());
                    },
                    buffer: 250,
                    scope: this                                
                }
            }]
        }]
    },


    // Called when view is first initialized
    initialize: function(){
        var me     = this,
            cfg   = me.config;
        // Setup alias to main controller
        me.main = FWUE.app.getController('Main');
        // Setup some aliases for the various components
        me.tb     = me.down('fw-toptoolbar');
        me.search = me.getComponent('listSearch');
        // Call the parent handler
        me.callParent();
        // Handle setting up the list listeners
        me.setListeners({
            itemtap: function(cmp, index, target, record, e, eOpts){
                // Change wallet address to selected address
                me.main.setWalletAddress(record.data.address, true);
                me.main.showMainView();
            },
            // Whenever list is shown, update list to only display records which match wallet prefix and network
            show: function(){
                me.onListSearch();
            }
        });         
        // Handle applying any background class to the list in the correct place (so docked components don't overlay over background)
        if(cfg.bgCls)
            me.element.down('.x-dock-body').addCls(cfg.bgCls);
    },


    // Handle searching list for specific matches
    onListSearch: function(str){
        var me     = this,
            store  = me.getStore(),
            regexp = new RegExp(str,"ig"),
            filter = Ext.create('Ext.util.Filter', {
                        filterFn: function(item){
                            var o = item.data;
                            // Only show addresses for the current wallet 
                            if(o.prefix==FWUE.WALLET_PREFIX && o.network==FWUE.WALLET_NETWORK){
                                if(str){
                                    if(o.address && String(o.address).match(regexp)!=null)
                                        return true;
                                    if(o.label && String(o.label).match(regexp)!=null)
                                        return true;
                                    return false;
                                }
                                return true;
                            }
                            return false;
                        }, 
                        root: 'data'
                    });
        store.clearFilter();
        store.filter(filter);
        me.refresh();        
    },


    // Handle prompting user what action they would like to take, then perform that action
    onAddAddress: function(){
        var me = this;
        Ext.Msg2.show({
            buttons:[{
                itemId: 'add',
                iconCls: 'fa fa-plus',
                text: 'Add New Address'
            },{
                itemId: 'import',
                iconCls: 'fa fa-upload',
                text: 'Import Private Key'
            },{
                itemId: 'cancel',
                iconCls: 'fa fa-cancel',
                ui: 'decline',
                text: 'Cancel'
            }],
            fn: function(btn){
                // Handle adding 1 new address to the wallet
                if(btn=='add'){
                    // Confirm with user that they want to generate new address
                    Ext.Msg.confirm('Add Address', 'Are you sure?', function(btn){
                        if(btn=='yes'){
                            // Defer message a bit to prevent knkown issue in sencha touch library (https://www.sencha.com/forum/showthread.php?279721)
                            Ext.defer(function(){
                                addr = me.main.addWalletAddress(1,null,true,true);
                            },10);
                        }
                    });                    
                }
                if(btn=='import'){
                    var cb = function(address, privkey){
                        if(address && privkey){
                            console.log('address,privkey=',address,privkey);
                            me.main.addWalletPrivkey(privkey, true);
                        }
                    }
                    me.main.promptAddressPrivkey(cb);
                }
            }
        });
    }

});
