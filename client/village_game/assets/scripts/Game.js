cc.Class({
    extends: cc.Component,
    properties: {
        gameRoot: {
            default: null,
            type: cc.Node
        },
    },
    onLoad() {
        this._initMgrs();
    },
    _initMgrs() {
        cc.hj.gameRoot = this.gameRoot;
        cc.hj.popUpTip.init(this.gameRoot);
        cc.hj.panelMgr.init(cc.find("moduleLayer", this.gameRoot));
    },
});