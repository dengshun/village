let BaseModule = require("BaseModule");
let SceneLoading = require("SceneLoading");
let GameObject = require("GameObject");

const GameObjectFactory = require("GameObjectFactory");
const SceneConst = require("SceneConst");
const FrameGraphicsBase = require("FrameGraphicsBase");
const BounceFontsManager = require("BounceFontsManager");
const Direction = require("Direction");
const SceneManager = require("SceneManager");
const SceneFightManager = require("SceneFightManager");
const GraphicsManager = require("GraphicsManager");
const CharacterController = require("CharacterController");
const FrameCharGraphics = require("FrameCharGraphics");
const SpineGraphicsBase = require("SpineGraphicsBase");
cc.Class({
    extends: BaseModule,
    properties: {
        _sceneLoading: SceneLoading,
        sceneLayer: cc.Node,
        uiLayer: cc.Node,
        _gameScene: null,
        _monsterIdStart: {
            serializable: false,
            default: 100000,
        },

        _mainPlayer: {
            default: null,
            serializable: false,
        },
    },
    onLoad() {
        this._super();
        GameObjectFactory.getInstance().registePrefab("CharacterObject", cc.loader.getRes(cc.hj.R.fab.characterObject, cc.Prefab));
        GameObjectFactory.getInstance().registePrefab("NCharacterObject", cc.loader.getRes(cc.hj.R.fab.ncharacterObject, cc.Prefab));
        GameObjectFactory.getInstance().registePrefab("BounceFont", cc.loader.getRes(cc.hj.R.fab.bounceFont, cc.Prefab));
        GameObjectFactory.getInstance().registePrefab("EffectObject", cc.loader.getRes(cc.hj.R.fab.effectObject, cc.Prefab));
        GameObjectFactory.getInstance().registePrefab("BloodBar", cc.loader.getRes(cc.hj.R.fab.bloodBar, cc.Prefab));
        GameObjectFactory.getInstance().registePrefab("TitleStuff", cc.loader.getRes(cc.hj.R.fab.titleStuff, cc.Prefab));

        this._gameScene = this.sceneLayer.getComponent("GameScene");
        SceneManager.getInstance().scene = this._gameScene;
        this._gameScene.sceneReadyCallBack = this._sceneReadyCallBack.bind(this);
        cc.log("game load.............................scene module");
        this._enterTestScene();

        let testBtn = cc.find("testBtn", this.uiLayer);
        testBtn.on(cc.Node.EventType.TOUCH_END, this._testSkillHandler, this);
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
        this._gameScene.sceneScale = 0.5;

        let focusObj = new GameObject();
        focusObj.posX = 3482;
        focusObj.posY = 892;
        this._gameScene.map.follow(focusObj);

        this._createMainPlayer();
        this._createTestMonsters();
    },
    _createTestMonsters: function() {
        for (let i = 0; i < 10; i++) {
            this._monsterIdStart++;
            this._createMonster(this._monsterIdStart);
        }
    },
    _createMonster: function(id) {
        let monster = GameObjectFactory.getInstance().getObject(SceneConst.NPC).getComponent("NCharacterObject");
        monster.id = id;
        this._gameScene.characterHash[monster.id] = monster;
        monster.render = this._gameScene.renderNChar;
        monster.posX = 3482 + (Math.random() < 0.5 ? -Math.random() * 300 : Math.random() * 300);
        monster.posY = 892 + (Math.random() < 0.5 ? -Math.random() * 300 : Math.random() * 300);
        let directionNum = (Math.random() * 5 >> 0) + 3;
        if (directionNum > 4) {
            directionNum = directionNum - 8;
        }
        monster.directionNum = directionNum;
        monster.alphaCheck = false;
        monster.autoCulling = false;
        // let graphicsR = new FrameGraphicsBase();
        // graphicsR.addPart(SceneConst.BODY_TYPE, 11102);
        // monster.graphicsRes = graphicsR;

        let graphicsR = new SpineGraphicsBase();
        graphicsR.addPart(SceneConst.BODY_TYPE, 1);
        monster.node.scale = 0.2;
        monster.graphicsRes = graphicsR;
        monster.stuffOffSetY = 80;

        let hpBar = GameObjectFactory.getInstance().getObject(SceneConst.STUFF_HP).getComponent("BloodBar");
        monster.hpBar = hpBar;
        hpBar.setBlood(100, 100);


        let title = GameObjectFactory.getInstance().getObject(SceneConst.STUFF_TITLE).getComponent("TitleStuff");
        monster.title = title;
        title.text = "Monster:" + id;

        this._gameScene.addObject(monster);
        // BounceFontsManager.getInstance().addFightBounce(monster,"999888",Direction.Up);
        // BounceFontsManager.getInstance().addFightBounce(monster,"999881",Direction.RightUp);
        // BounceFontsManager.getInstance().addFightBounce(monster,"999882",Direction.Right);
        // BounceFontsManager.getInstance().addFightBounce(monster,"999883",Direction.RightDown);
        // BounceFontsManager.getInstance().addFightBounce(monster,"999884",Direction.Down);
        // BounceFontsManager.getInstance().addFightBounce(monster,"999885",Direction.LeftDown);
        // BounceFontsManager.getInstance().addFightBounce(monster,"999886",Direction.Left);
        // BounceFontsManager.getInstance().addFightBounce(monster,"999887",Direction.LeftUp);
        // BounceFontsManager.getInstance().addFightBounce(monster,"999887",Direction.LeftUp);
        // BounceFontsManager.getInstance().addFightBounce(monster,"999887",Direction.LeftUp);
        // BounceFontsManager.getInstance().addFightBounce(monster,"999887",Direction.LeftUp);
        // BounceFontsManager.getInstance().addFightBounce(monster,"999887",Direction.LeftUp);
        // BounceFontsManager.getInstance().addFightBounce(monster,"999887",Direction.LeftUp);
        // BounceFontsManager.getInstance().addFightBounce(monster,"999887",Direction.LeftUp);
    },
    _createMainPlayer: function() {
        if (!this._mainPlayer) {
            this._mainPlayer = GameObjectFactory.getInstance().getObject(SceneConst.CHAR).getComponent("CharacterObject");
        }
        this._mainPlayer.render = this._gameScene.renderChar;
        this._mainPlayer.posX = 3482;
        this._mainPlayer.posY = 892;
        this._mainPlayer.id = 1;
        this._gameScene.characterHash[this._mainPlayer.id] = this._mainPlayer;
        this._mainPlayer.directionNum = 3;
        this._mainPlayer.alphaCheck = true;
        // let graphicsR = new FrameCharGraphics();
        // graphicsR.addPart(SceneConst.BODY_TYPE, 100001);
        // graphicsR.addPart(SceneConst.WEAPON_TYPE, 200001);


        let graphicsR = new SpineGraphicsBase();
        graphicsR.addPart(SceneConst.BODY_TYPE, 1);
        this._mainPlayer.node.scale = 0.2;


        this._mainPlayer.graphicsRes = graphicsR;
        this._mainPlayer.inCamera = true;
        this._mainPlayer.autoCulling = false;
        this._mainPlayer.changeController(new CharacterController());
        this._gameScene.addObject(this._mainPlayer);

        // this._gameScene.map.follow(this._mainPlayer);
    },
    _testSkillHandler: function(evt) {
        // if (skillData == 0) {
        let targets = this._gameScene.getAroundObjects(SceneConst.NPC, this._mainPlayer.pos, 200, this._mainPlayer);
        cc.log(targets);
        this._useSkillTest(0, this._mainPlayer, targets);
        // } else {
        // type = "", pos = null, radius = -1, exclude = null) {
        // let target = this._gameScene.getNearestObject(SceneConst.NPC, this._mainPlayer.pos, 300, this._mainPlayer);
        // if (target) {
        //     this._useSkillTest(1, this._mainPlayer, target);
        // }
        // }
    },
    _useSkillTest: function(type, attacker, attacked) {
        let fightEnd = function(attacker, attacked) {}
        SceneFightManager.getInstance().playSkillAction1(attacker.id, type == 0 ? null : attacked.id, 0, fightEnd, this);
        this.scheduleOnce(function() {
            if (type != 0) {
                attacked.setBlood(Math.max(0, attacked.currentBlood - 10));
                let harm = { attackerId: attacker.id, attackedId: attacked.id, value: 10, type: 1 }
                SceneFightManager.getInstance().charHarm(harm);
                if (attacked.currentBlood <= 0) {
                    attacked.isDeath = true;
                    this._gameScene.removeObject(attacked);
                    delete this._gameScene.characterHash[attacked.id];
                }
            } else {
                let self = this;
                attacked.forEach(function(obj) {
                    obj.setBlood(Math.max(0, obj.currentBlood - 10));
                    let harm = { attackerId: attacker.id, attackedId: obj.id, value: 10, type: 1 }
                    SceneFightManager.getInstance().charHarm(harm);
                    if (obj.currentBlood <= 0) {
                        obj.isDeath = true;
                        self._gameScene.removeObject(obj);
                        delete self._gameScene.characterHash[obj.id];
                    }
                });
            }
            this._checkAndCreateMonster();
        }, 0.1);
    },
    _checkAndCreateMonster: function() {
        let curCount = 0;
        for (let charId in this._gameScene.characterHash) {
            let obj = this._gameScene.characterHash[charId];
            if (obj.type == SceneConst.NPC) {
                curCount++;
            }
        }
        cc.log("--==============================", curCount);
        if (curCount < 10) {
            this._monsterIdStart++;
            this._createMonster(this._monsterIdStart);
        }
    },


});