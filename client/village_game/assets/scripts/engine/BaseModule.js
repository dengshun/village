let ModuleMonitor = require("ModuleMonitor");
let Message = require("Message");
let BaseModule=cc.Class({
    extends: cc.Component,
    properties: {
        orders: {
            get: function () {
                return this._orders;
            },
            visible: false,
        },
        moduleId: {
            get: function () {
                return this._moduleId;
            },
            set: function (value) {
                this._moduleId = value;
            },
            visible: false
        },
        _moduleId: "",
        _orders: null,
    },
    onLoad: function () {
        this._orders = [];
        this.moduleId = cc.js.getClassName(this);
        this._register();
    },
    registerCode: function (orders) {
        this._orders = this._orders.concat(orders);
        cc.log("register code========:" + this._orders);
    },
    _register: function () {
        ModuleMonitor.getInstance().addModule(this);
    },
    messageHandler: function (message) {

    },
    sendToModules: function (actionType, geters, data) {
        let message = new Message();
        message.setUp(actionType, this.moduleId, geters, data);
        message.send();
    }
});
module.exports=BaseModule;
