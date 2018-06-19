let MessagePort = require("MessagePort");
let Message = cc.Class({
    name: "Message",
    statics: {
        sendToModules: function (actionType, sender, geters, data) {
            let message = new Message();
            message.setUp(actionType, sender, geters, data);
            message.send();
        }
    },
    properties: {
        actionType: "",
        body: null,
        geters: null,
        sender: "",
    },
    setUp: function (actionType, sender, geters, data) {
        this.sender = sender;
        this.geters = geters;
        this.actionType = actionType;
        this.body = data;
    },
    send: function () {
        MessagePort.getInstance().send(this);
    },

});
module.exports = Message;
