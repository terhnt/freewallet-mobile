/*
 * Issuance.js - View 
 *
 * Display issuance form
 */
 
Ext.define('FWUE.view.Issuance', {
    extend: 'Ext.form.Panel',
    
    config: {
        id: 'issuanceView',
        layout: 'vbox',
        scrollable: 'vertical',
        cls: 'fw-panel',
        items:[{
            xtype: 'fw-toptoolbar',
            title: 'Issue Token',
            menu: true
        },{
            xtype: 'container',
            layout: 'vbox',
            margin: '5 5 5 5',
            cls: 'no-label-ellipsis',
            items:[{
                xtype: 'fieldset',
                margin: '0 0 0 0',
                defaults: {
                    xtype: 'textfield',
                    labelWidth: 80
                },
                items:[{
                    xtype: 'selectfield',
                    label: 'Type',
                    name: 'type',
                    options: [
                        {text: 'Alphabetical Name', value: 1},
                        {text: 'Numeric Name',      value: 2},
                        {text: 'Subasset',          value: 3}
                    ],
                    listeners: {
                        change: function(cmp, val, oldVal, opts){
                            if(val!=oldVal){
                                var me  = Ext.getCmp('issuanceView'),
                                    len = (val==3) ? 255 : ((val==2) ? 21 : 12);
                                me.name.reset();
                                me.name.setMaxLength(len);
                                if(val==2){
                                    // Generate a random numeric asset name
                                    var min = 100000000000000000,
                                        max = 9999999999999999999,
                                        txt = 'A' + (Math.random() * (max - min) + min);
                                    me.name.setValue(txt);
                                }
                            }
                        }
                    }
                },{
                    name: 'name',
                    label: 'Name',
                    maxLength: 12,
                    listeners: {
                        keyup: function(cmp, e, opts){
                            var me   = Ext.getCmp('issuanceView'),
                                type = me.type.getValue(),
                                val  = String(cmp.getValue()),
                                txt  = '';
                            if(type==1){
                                txt = val.toUpperCase();
                            } else if(type==2){
                                txt = 'A' + val.toUpperCase().replace(/\D/g,'');
                            } else if(type==3){
                                // If we have the parent asset name, make it upper case
                                val.split('.').forEach(function(name, idx, arr){
                                    txt += (idx==0) ? name.toUpperCase() : '.' + name;
                                });
                            }
                            cmp.setValue(txt);
                        }
                    }

                },{
                    name: 'description',
                    label: 'Description',
                    maxLength: 52
                },{
                    xtype: 'fw-spinnerfield',
                    label: 'Quantity',
                    name: 'quantity',
                    value: 1,
                    minValue: 0,
                    maxValue: 100000000,
                    stepValue: 1
                },{
                    xtype: 'togglefield',
                    name: 'divisible',
                    label: 'Divisible',
                    listeners: {
                        change: function(cmp, newVal, oldVal, opts){
                            if(newVal!=oldVal){
                                var me  = Ext.getCmp('issuanceView'),
                                    dec = (newVal) ? 8 : 0;
                                me.quantity.setDecimalPrecision(dec);
                            }
                        }
                    }
                },{
                    xtype: 'togglefield',
                    name: 'Lock Token Supply',
                    label: 'Lock Token',
                    listeners: {
                        change: function(cmp, newVal, oldVal, opts){
                            var desc = (newVal) ? 'LOCK' : ''
                            var me  = Ext.getCmp('issuanceView');
                            me.description.setValue(desc);
                        }
                    }
                }]                
            },{
                xtype: 'fw-transactionpriority',
                margin: '0 0 0 0'
            },{
                xtype: 'container',
                layout: 'hbox',
                defaults: {
                    margin: '5 0 0 0',
                    xtype: 'button',
                    flex: 1
                },
                items: [{
                    text: 'Issue',
                    itemId: 'sign',
                    iconCls: 'fa fa-institution',
                    ui: 'confirm',
                    handler: function(btn){
                        Ext.getCmp('issuanceView').validate();
                    }
                }]
            }]
        }]
    },
    

    // Handle initializing the screen
    initialize: function(){
        var me  = this,
            cfg = me.config;
        // Setup alias to main controller
        me.main = FWUE.app.getController('Main');
        me.tb   = me.down('fw-toptoolbar');
        // Setup aliases to the various fields
        me.type        = me.down('[name=type]');
        me.name        = me.down('[name=name]');
        me.description = me.down('[name=description]');
        me.quantity    = me.down('[name=quantity]');
        me.divisible   = me.down('[name=divisible]');
        me.priority    = me.down('fw-transactionpriority');
        // Call parent
        me.callParent();
    },


    // Handle updating the view with passed config info
    updateView: function(cfg){
        var me = this;
        // Back button
        if(cfg.back){
            me.tb.backBtn.show();
            if(typeof cfg.back === 'function')
                me.tb.onBack = cfg.back;
        } else {
            me.tb.backBtn.hide();
        }
        // Handle resetting all fields back to default values
        if(cfg.reset){
            me.type.setValue(1);
            me.name.reset();
            me.description.reset();
            me.quantity.reset();
            me.divisible.setValue(1);
            me.priority.reset();
        }
        // Default to numeric asset on iOS
        if(me.main.isNative && Ext.os.name=='iOS')
            me.type.setValue(2);
        me.quantity.setDecimalPrecision(8);
    },


    // Handle validating the issuance data and sending the issuance
    validate: function(){
        var me      = this,
            vals    = me.getValues(),
            msg     = false,
            len     = vals.name.length,
            type    = vals.type,
            first   = vals.name.substr(0,1),
            btc_bal = me.main.getBalance('UNO'),
            xcp_bal = me.main.getBalance('XUP'),
            fee_sat = me.main.getSatoshis(String(vals.feeAmount).replace(' UNO','')),
            btc_sat = me.main.getSatoshis(btc_bal),
            qty_sat = me.main.getSatoshis(vals.quantity);
        // Validate the issuance data and display any 
        if(vals.name==''){
            msg = 'You must enter a token name';
        } else if(type==1){
            if(len<4||len>12)
                msg = 'Alphabetical tokens must be between 4-12 characters long.';
            else if(!/^[A-Z]+$/i.test(vals.name))
                msg = 'Alphabetical tokens must only contain A-Z characters.';
            else if(first=='A')
                msg = 'Alphabetical tokens can not start with the letter A.';
            else if(xcp_bal<0.5)
                msg = '0.5 XUP Required.<br/>Please fund this address with some XUP and try again.';
        } else if(type==2){
            if(len<19||len>21)
                msg = 'Numeric tokens must be between 19-21 characters long.';
            else if(first!='A')
                msg = 'Numeric tokens must being with the letter A.';
        } else if(type==3){
            if(!/^[A-Za-z0-9.\-_@!]+$/i.test(vals.name))
                msg = 'Subassets must only contain characters a-zA-Z0-9.-_@!';
            else if(vals.name.substr(0,1)=='.'||vals.name.substr(vals.name.length-1,1)=='.')
                msg = 'Subassets cannot start or end with a period (.)';
            else if(vals.name.indexOf('..')!=-1)
                msg = 'Subassets cannot contain multiple consecutive periods (..)';
        } else if(fee_sat > btc_sat){
            msg = 'Unobtanium balance below required amount.<br/>Please fund this address with some Unobtanium and try again.';
        }
        if(msg){
            Ext.Msg.alert(null,msg);
            return;
        }
        // Define function to run when we are sure user wants to issue token
        var fn = function(){
            me.setMasked({
                xtype: 'loadmask',
                message: 'Please wait',
                showAnimation: 'fadeIn',
                indicator: true
            });
            // Define callback called when transaction is done (success or failure)
            var cb = function(txid){
                me.setMasked(false);
                if(txid){
                    Ext.Msg.alert(null,'Your issuance has been broadcast');
                    me.name.reset();
                    me.description.reset();
                    me.quantity.reset();
                    me.priority.reset();
                }
            };
            me.main.cpIssuance(FWUE.WALLET_NETWORK, FWUE.WALLET_ADDRESS.address, vals.name, vals.description, vals.divisible, qty_sat, null, fee_sat, cb);
        }        
        // Make call to xchain API to check if asset already is registered
        var host = (FWUE.WALLET_NETWORK==2) ? 'testnet.xchain.io' : 'xchain.io';
        me.main.ajaxRequest({
            url: 'https://' + host + '/api/asset/' + vals.name,
            success: function(o){
                var valid = false;
                if(o.error=='Asset not found' || o.owner==FWUE.WALLET_ADDRESS.address)
                    valid = true;
                else if(o.owner!=FWUE.WALLET_ADDRESS.address)
                    Ext.Msg.alert(null,'Token is already registered to a different address.');
                if(valid){
                    // Confirm action with user
                    Ext.Msg.confirm('Confirm Issuance', 'Send Issuance?', function(btn){
                        if(btn=='yes')
                            fn();
                    });
                }
            }
        });
    }

});