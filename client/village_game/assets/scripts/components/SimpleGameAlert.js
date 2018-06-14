var SimpleGameAlert = cc.Class({
    statics: {
        OK: 0x0001,
        CANCEL: 0x0002,
        _alertPanel: null,
        init: function () {
            if(this._alertPanel==null){
                this._loadPanelPrefab();
            }else{
                this._alertPanel.registerLayout(cc.hj.LayoutConst.ALERT_PANEL);
            }
        },
        _loadPanelPrefab: function () {
            var self = this;
            cc.loader.loadRes("prefab/alertPanel", function (err, prefab) {
                self._alertPanel = cc.instantiate(prefab).getComponent("PanelBase");
                self._alertPanel.registerLayout(cc.hj.LayoutConst.ALERT_PANEL);
            });
        },
        show: function (title, content,callBack, flags, okLabel, cancelLabel) {
            okLabel = okLabel || "确认";
            cancelLabel = cancelLabel || "取消";
            flags = flags || (this.OK | this.CANCEL);
            if (this._alertPanel) {
                cc.hj.panelMgr.openPanel(this._alertPanel.id);
                this._alertPanel.updateView(title, content,callBack, flags, okLabel, cancelLabel);
            }
        },
        hide: function () {
            if (this._alertPanel) {
                cc.hj.panelMgr.closePanel(this._alertPanel.id);
            }
        }
    }
});
module.exports=SimpleGameAlert;