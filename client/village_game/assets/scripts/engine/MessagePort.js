let ModuleMonitor = require("ModuleMonitor");
let MessagePort = cc.Class({
    name: "MessagePort",
    statics: {
        _instance: null,
        getInstance: function () {
            if (this._instance == null) {
                this._instance = new MessagePort();
            }
            return this._instance;
        }
    },
    send: function (message) {
        this._moduleToModules(message);
    },
    _moduleToModules: function (message) {
        let sendModule = ModuleMonitor.getInstance().takeModule(message.sender);
        if (sendModule) {
            let geters = message.geters;
            geters.forEach(function (geterId) {
                let geterModule = ModuleMonitor.getInstance().takeModule(geterId);
                if (geterModule) {
                    geterModule.messageHandler(message);
                }
            });
        }
    }
});
module.exports=MessagePort;