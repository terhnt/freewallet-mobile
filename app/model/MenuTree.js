/*
 * MenuTree.js - Model
 */
Ext.define('FWUE.model.MenuTree', {
    extend: 'Ext.data.Model',
    config: {
        fields: [
            {name: 'text', type: 'string'},
            {name: 'icon', type: 'string'}
        ]
    }
});

