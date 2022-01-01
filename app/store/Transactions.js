/*
 * Transactions.js - Store
 */
Ext.define('FWUE.store.Transactions', {
    extend: 'Ext.data.Store',
    requires:['Ext.data.proxy.LocalStorage'],

    config: {
        model: 'FWUE.model.Transactions',
        autoLoad: true,
        autoSync: true
        // Set this proxy to store data in localStorage
        // proxy: {
        //     type: 'localstorage',
        //     id: 'Transactions'
        // },
    }
});
