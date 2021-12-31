/*
 * TransactionPriority.js - View
 * 
 * Handle displaying transaction priority fieldset
 */

 Ext.define('FWUE.view.TransactionPriority', {
    extend: 'Ext.form.FieldSet',
    xtype: 'fw-transactionpriority',

    config: {
        title: 'Transaction Priority',
        defaults: {
            labelWidth: 70
        },
        items:[{
            xtype: 'container',
            layout: 'hbox',
            items:[{
                flex: 1,
                xtype: 'sliderfield',
                name: 'feePriority',
                label: 'Priority',
                labelWidth: 70,
                minValue: 1,
                maxValue: 3,
                value: 2,
                listeners: {
                    // Handle when user drags slider
                    drag: function(cmp, sl, thumb, e, eOpts){
                        var me  = cmp.up('fw-transactionpriority'),
                            val = cmp.getValue()[0];
                        if(val!=cmp.lastValue){
                            me.setType(val);
                            me.setFee(val);
                            cmp.lastValue = val;
                        }
                    },
                    // Handle when user stops dragging (like taping on slider somewhere)
                    dragend: function(cmp, sl, thumb, val, e, eOpts){
                        var me  = cmp.up('fw-transactionpriority'),
                            val = cmp.getValue()[0];
                        if(val!=cmp.lastValue){
                            me.setType(val);
                            me.setFee(val);
                            cmp.lastValue = val;
                        }
                    },
                    change: function(cmp, sl, thumb, val, oldVal){
                        var me  = cmp.up('fw-transactionpriority');
                        me.setType(val);
                        me.setFee(val);
                    }
                }                        
            },{
                width: 70,
                xtype: 'container',
                name: 'feeType',
                margin: '13 0 0 0',
                cls: 'fw-slider-description',
                tpl: '<center>{text}</center>',
                data: {
                    text: '<span class="fee low">Standard</span>'
                }
            }]
        },{
            xtype: 'fw-spinnerfield',
            label: 'Miner Fee',
            name: 'feeAmount',
            decimalPrecision: 8,
            value:      0.00010000,
            minValue:   0.00000000,
            maxValue: 100.00000000,
            stepValue:  0.00010000
        }]
    },


    initialize: function(){
        var me  = this,
            cfg = me.config;
        // Setup alias to main controller
        me.main = FWUE.app.getController('Main');
        // Setup aliases to the various fields
        me.feePriority = me.down('[name=feePriority]');
        me.feeType     = me.down('[name=feeType]');
        me.feeAmount   = me.down('[name=feeAmount]');
        me.callParent();
        me.setFee(1);
    },


    // Handle updating fee type     
    setType: function(val){
        var me  = this,
            txt = '';
        if(val==1) txt = '<span class="fee low">Low</span>';
        if(val==2) txt = '<span class="fee medium">Medium</span>';
        if(val==3) txt = '<span class="fee high">High</span>';
        me.feeType.setData({ text: txt });
    },


    // Handle determining the miner fee
    setFee: function(val){
        var me  = this,
            o   = FWUE.MINER_FEES,
            avg = 530,    // Average transaction size (https://tradeblock.com/bitcoin/historical/1h-f-tsize_per_avg-01101)
            fee = 0.0001; // Minimum transaction fee
        if(o){
            if(val==2)
                fee = ((o.medium / 1000) * avg)  * 0.00000001;
            if(val==3)
                fee = ((o.fast / 1000) * avg) * 0.00000001;
        }
        me.feeAmount.setValue(numeral(fee).format('0,0.00000000'))
    },


    reset: function(){
        var me = this;
        me.feePriority.setValue(1);
        me.feeType.setData({ text: '<span class="fee low">Low</span>' });
        me.setFee(1);
    }


});