var PanelBase = require("PanelBase");
cc.Class({
    extends: PanelBase,
    properties: {
        _bar: cc.Node,
        _tip: cc.Label,
        _barOriginWidth: 0,
    },
    onLoad() {
        let loadingLayer = cc.find("loadingLayer", this.node);
        this._tip = cc.find("tip", loadingLayer).getComponent(cc.Label);
        this._bar = cc.find("bar", loadingLayer);
        this._barOriginWidth = this._bar.width;
        this._bar.width = 1;
    },
    updateProgress(tip, per) {
        if (per != null && per != undefined) {
            this._bar.width = this._barOriginWidth * per;
        }
        this._tip.string = tip;
    }
});