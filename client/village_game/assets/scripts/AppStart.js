let GameConfig = require("GameConfig");
let Message = require("Message");
let SocketProtosManager = require("SocketProtosManager");
let PanelManager = require("PanelManager");
let ModuleMonitor = require("ModuleMonitor");
let ModuleConst = require("ModuleConst");
let InternalOrders = require("InternalOrders");
let ServiceOrders = require("ServiceOrders");
let PopUpTip = require("PopUpTip");
let Utils = require("Utils");
let R = require("R");
let LocalStorageManager = require("LocalStorageManager");
let AssetsManager = require("AssetsManager");
let LayoutConst = require("LayoutConst");
var SimpleGameAlert = require("SimpleGameAlert");
cc.Class({
    extends: cc.Component,
    properties: {
        gameRoot: {
            default: null,
            type: cc.Node
        },
        _isExiting: false,
    },
    onLoad() {
        let self = this;
        cc.director.setDisplayStats(true);
        cc.view.enableAntiAlias(true);
        if (cc.director.setClearColor) {
            // cc.director.setClearColor(cc.hexToColor('#fed100'));
        }
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        // cc.game.addPersistRootNode(this.node);
        this._initMgrs();
    },
    _initMgrs() {
        cc.hj = {};
        cc.hj.Global = require("Global");
        let SoundManager = require("SoundManager");
        cc.hj.soundMgr = new SoundManager();
        cc.hj.protoMgr = SocketProtosManager.getInstance();
        cc.hj.protoMgr.init();
        cc.hj.panelMgr = PanelManager.getInstance();
        cc.hj.panelMgr.init(cc.find("moduleLayer", this.gameRoot));
        cc.hj.popUpTip = PopUpTip.getInstance();
        cc.hj.popUpTip.init(this.gameRoot);
        cc.hj.SimpleAlert = SimpleGameAlert;
        cc.hj.moduleMgr = ModuleMonitor.getInstance();
        cc.hj.gameRoot = this.gameRoot;
        cc.hj.GameConfig = GameConfig;
        cc.hj.Message = Message;
        cc.hj.sendToModules = Message.sendToModules;
        cc.hj.InternalOrders = InternalOrders;
        cc.hj.ServiceOrders = ServiceOrders;
        cc.hj.ModuleConst = ModuleConst;
        cc.hj.Utils = Utils;
        cc.hj.R = R;
        cc.hj.LocalStorageMgr = LocalStorageManager;
        cc.hj.assetsMgr = AssetsManager.getInstance();
        cc.hj.assetsMgr.init();
        cc.hj.LayoutConst = LayoutConst;

        setTimeout(this._enterScene, 1000);
    },
    _onKeyDown(event) {
        if (event.keyCode == cc.KEY.back) {
            this._exitAndExitConfirm();
        }
    },
    _exitAndExitConfirm() {
        if (!this._isExiting) {
            this._isExiting = true;
            cc.loader.loadRes("textures/start/exitImg", cc.SpriteFrame, function(err, tex) {
                let exitLogoNode = new cc.Node("exitLogNode");
                let exitLogo = exitLogoNode.addComponent(cc.Sprite);
                exitLogo.spriteFrame = tex;
                cc.hj.gameRoot.addChild(exitLogoNode, cc.hj.GameConfig.LayerZOrder.LAYER_ZORDER_TIP);
                exitLogoNode.setPosition(cc.p(0, -cc.visibleRect.height / 2 + 120));
                let action = cc.sequence(cc.fadeOut(2), cc.callFunc(function() {
                    this._isExiting = false;
                    cc.hj.gameRoot.removeChild(exitLogoNode, true);
                }, this));
                exitLogoNode.runAction(action);
            });
        } else {
            cc.director.end();
        }
    },
    _enterScene() {
        cc.director.loadScene("loading");
    }
});