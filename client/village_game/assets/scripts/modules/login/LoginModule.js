let BaseModule = require("BaseModule");
cc.Class({
    extends: BaseModule,
    properties: {

    },
    onLoad() {
        this._super();
        this.registerCode([]);
    },
    messageHandler(msg) {
        switch (msg.actionType) {
            case cc.hj.InternalOrders.GAME_START:
                this._startGameHandler();
                break;
        }
    },
    _startGameHandler() {

    }
});