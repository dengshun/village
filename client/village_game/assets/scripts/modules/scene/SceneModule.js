let BaseModule = require("BaseModule");
const SceneManager = require("SceneManager");
let SceneLoading = require("SceneLoading");
let GameObject = require("GameObject");
cc.Class({
    extends: BaseModule,
    properties: {
        _sceneLoading: SceneLoading,
        sceneLayer: cc.Node,
        uiLayer: cc.Node,
        _gameScene: null,

    },
    onLoad() {
        this._super();
        this._gameScene = this.sceneLayer.getComponent("GameScene");
        SceneManager.getInstance().scene = this._gameScene;
        this._gameScene.sceneReadyCallBack = this._sceneReadyCallBack.bind(this);
        cc.log("game load.............................scene module");
        this._enterTestScene();
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
        this._sceneLoading.updateProgress("加载场景资源...", 0);
        this._gameScene.changeScene(24006);


    },
    _loadSceneData() {

    },
    _sceneReadyCallBack() {
        cc.log("ready..................................");
        cc.hj.panelMgr.closePanel(this._sceneLoading.id);
        let focusObj = new GameObject();
        focusObj.posX = 3482;
        focusObj.posY = 892;
        this._gameScene.map.follow(focusObj);
    },


});