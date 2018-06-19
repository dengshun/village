cc.Class({
    extends: cc.Component,
    properties: {
        gameRoot: {
            default: null,
            type: cc.Node
        },
        _bar: cc.Node,
        _tip: cc.Label,
        _barOriginWidth: 0,
    },
    onLoad() {
        let loadingLayer = cc.find("loadingLayer", this.gameRoot);
        this._tip = cc.find("tip", loadingLayer).getComponent(cc.Label);
        this._bar = cc.find("bar", loadingLayer);
        this._barOriginWidth = this._bar.width;
        this._bar.width = 1;
        cc.director.preloadScene("game");
        let self = this;
        var pHandler = function(itemLoaded, itemTotal, groupLoaded, groupTotal) {
            let itemPercent = Math.ceil(itemLoaded / itemTotal * 100);
            let per = groupLoaded / groupTotal; //+(itemLoaded / itemTotal)/groupTotal;
            if (per > 1) per = 1;
            self._updateProgress(`Loading… ${itemPercent}% (${groupLoaded}/${groupTotal})`, per);
        }
        var cHandler = function(groupLoaded, groupTotal) {
            self._updateProgress(`Loading… 100% (${groupLoaded}/${groupTotal})`, 1);
            self._resLoadComplete();
        }
        self._updateProgress(`Loading… 0% `, 0);
        cc.hj.assetsMgr.loadPreLoadAssets(pHandler, cHandler);

    },
    _resLoadComplete() {
        cc.director.loadScene("game");
    },
    _updateProgress(tip, per) {
        if (per != null && per != undefined) {
            this._bar.width = this._barOriginWidth * per;
        }
        this._tip.string = tip;
    }
});