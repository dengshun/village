let BaseModule = require("BaseModule");
var SceneLoading = require("SceneLoading");
cc.Class({
    extends: BaseModule,
    properties: {
        _sceneLoading: SceneLoading,
    },
    onLoad() {
        this._super();
    },
    messageHandler(msg) {
        switch (msg.actionType) {
            case cc.hj.InternalOrders.SCENE_TEST:
                this._enterTestScene();
                break;
        }
    },
    _enterTestScene() {
        var prefab = cc.hj.assetsMgr.getPrefab(cc.hj.R.fab.sceneLoading);
        this._sceneLoading = cc.instantiate(prefab).getComponent("PanelBase");
        this._sceneLoading.registerLayout(cc.hj.LayoutConst.SCENE_LOADING);
        cc.hj.panelMgr.openPanel(this._sceneLoading.id, null, false);

    },


});