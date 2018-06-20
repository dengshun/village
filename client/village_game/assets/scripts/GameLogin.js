cc.Class({
    extends: cc.Component,
    properties: {
        gameRoot: {
            default: null,
            type: cc.Node
        },
        _loginBtn: cc.Node,
    },
    onLoad() {
        cc.hj.gameRoot = this.gameRoot;
        cc.hj.popUpTip.init(this.gameRoot);
        this._loginBtn = cc.find("uiLayer/loginBtn", this.gameRoot);
        this._loginBtn.on(cc.Node.EventType.TOUCH_END, this._loginHanelr);
        cc.director.preloadScene("game");
    },
    _loginHanelr(evt) {
        cc.hj.sendToModules(cc.hj.InternalOrders.GAME_START, cc.hj.ModuleConst.LOGIN_MODULE, [cc.hj.ModuleConst.LOGIN_MODULE]);
    }
});