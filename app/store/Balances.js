/*
 * Balances.js - Store
 */
Ext.define('FWUE.store.Balances', {
    extend: 'Ext.data.Store',
    requires:['Ext.data.proxy.LocalStorage'],

    config: {
        model: 'FWUE.model.Balances',
        autoLoad: true,
        autoSync: true,
        // Set this proxy to store data in localStorage
        proxy: {
            type: 'localstorage',
            id: 'Balances'
        }
    }
});
