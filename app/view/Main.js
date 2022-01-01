/*
 * Main.js - View
 * 
 * Displays main application view
 */
 
Ext.define('FWUE.view.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'main',

    requires: [
        'Ext.TitleBar'
    ],

    config: {
        id: 'mainView',
        tabBarPosition: 'bottom',
        layout:  {
            type: 'card',
            animation: 'fade'
        },
        items: [
            {iconCls: 'piggybank',  title: 'Balances', xclass: 'FWUE.view.Balances'},
            {iconCls: 'fa-history', title: 'History',  xclass: 'FWUE.view.History'},
            {iconCls: 'fa-gears',   title: 'Tools',    xclass: 'FWUE.view.Tools'},
            {iconCls: 'user',       title: 'About',    xclass: 'FWUE.view.About'},
            {iconCls: 'settings',   title: 'Settings', xclass: 'FWUE.view.Settings'}
        ]
    }
});
