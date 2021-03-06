const BaseModule = require("BaseModule");
const SceneLoading = require("SceneLoading");
const GameObject = require("GameObject");
const GameObjectFactory = require("GameObjectFactory");
const SceneConst = require("SceneConst");
const FramesGraphicsBase = require("FramesGraphicsBase");
const BounceFontsManager = require("BounceFontsManager");
const Direction = require("Direction");
const SceneManager = require("SceneManager");
const SceneFightManager = require("SceneFightManager");
const GraphicsManager = require("GraphicsManager");
const CharacterController = require("CharacterController");
const MainPlayerController2 = require("MainPlayerController2");
const SpineGraphicsBase = require("SpineGraphicsBase");
const SingleSpriteGraphics = require("SingleSpriteGraphics");
const RpgGlobal = require("RpgGlobal");
const MainPlayerAI = require("MainPlayerAI");
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
        _buildingIdStart: {
            serializable: false,
            default: 200000,
        },

        _mainPlayer: {
            default: null,
            serializable: false,
        },
    },
    onLoad() {
        this._super();
        cc.hj.Global.buildingList = cc.loader.getRes(cc.hj.R.json.ConfigBuilding, null);
        GameObjectFactory.getInstance().registePrefab("CharacterObject", cc.loader.getRes(cc.hj.R.fab.characterObject, cc.Prefab));
        GameObjectFactory.getInstance().registePrefab("NCharacterObject", cc.loader.getRes(cc.hj.R.fab.ncharacterObject, cc.Prefab));
        GameObjectFactory.getInstance().registePrefab("BounceFont", cc.loader.getRes(cc.hj.R.fab.bounceFont, cc.Prefab));
        GameObjectFactory.getInstance().registePrefab("EffectObject", cc.loader.getRes(cc.hj.R.fab.effectObject, cc.Prefab));
        GameObjectFactory.getInstance().registePrefab("BuildingObject", cc.loader.getRes(cc.hj.R.fab.buildingObject, cc.Prefab));
        GameObjectFactory.getInstance().registePrefab("BloodBar", cc.loader.getRes(cc.hj.R.fab.bloodBar, cc.Prefab));
        GameObjectFactory.getInstance().registePrefab("TitleStuff", cc.loader.getRes(cc.hj.R.fab.titleStuff, cc.Prefab));
        GameObjectFactory.getInstance().registePrefab("BubbleStuff", cc.loader.getRes(cc.hj.R.fab.bubbleStuff, cc.Prefab));

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
    _sceneReadyCallBack() {
        cc.log("ready..................................");
        cc.hj.panelMgr.closePanel(this._sceneLoading.id);
        // this._gameScene.sceneScale = 0.5;

        // let focusObj = new GameObject();
        // focusObj.posX = 3482;
        // focusObj.posY = 892;
        // focusObj.changeController(new MainPlayerController2());
        // this._gameScene.map.follow(focusObj);
        this._gameScene.map.centerPoint.x = 3482;
        this._gameScene.map.centerPoint.y = 892;

        this._createMainPlayer();
        this._createTestMonstersInField1();
        this._createTestBuildings();
        this._gameScene.map.updateAStarGrid();

        setTimeout(() => {
            let ai = new MainPlayerAI();
            ai.setup(this._mainPlayer, this._gameScene);
            ai.run();
        }, 2000);
    },
    _createTestMonstersInField1() {
        let fields1 = this._gameScene.map.sceneData.getSquaresByType(6);
        for (let i = 0; i < 10; i++) {
            this._monsterIdStart++;
            let randomSquare = fields1[Math.floor(Math.random() * fields1.length)];
            this._createMonster(this._monsterIdStart, randomSquare.x * RpgGlobal.GRID_SIZE, randomSquare.y * RpgGlobal.GRID_SIZE);
        }
    },
    _createMonster(id, posX, posY) {
        let monster = GameObjectFactory.getInstance().getObject(SceneConst.MONSTER).getComponent("NCharacterObject");
        monster.id = id;
        this._gameScene.characterHash[monster.id] = monster;
        monster.render = this._gameScene.renderNChar;
        monster.posX = posX; //3482 + (Math.random() < 0.5 ? -Math.random() * 300 : Math.random() * 300);
        monster.posY = posY; //892 + (Math.random() < 0.5 ? -Math.random() * 300 : Math.random() * 300);
        let directionNum = (Math.random() * 5 >> 0) + 3;
        if (directionNum > 4) {
            directionNum = directionNum - 8;
        }
        monster.directionNum = directionNum;
        monster.alphaCheck = false;
        monster.autoCulling = true;
        // let graphicsR = new FramesGraphicsBase();
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
        // BounceFontsManager.getInstance().addBounce(monster,"999888",Direction.Up);
        // BounceFontsManager.getInstance().addBounce(monster,"999881",Direction.RightUp);
        // BounceFontsManager.getInstance().addBounce(monster,"999882",Direction.Right);
        // BounceFontsManager.getInstance().addBounce(monster,"999883",Direction.RightDown);
        // BounceFontsManager.getInstance().addBounce(monster,"999884",Direction.Down);
        // BounceFontsManager.getInstance().addBounce(monster,"999885",Direction.LeftDown);
        // BounceFontsManager.getInstance().addBounce(monster,"999886",Direction.Left);
        // BounceFontsManager.getInstance().addBounce(monster,"999887",Direction.LeftUp);
        // BounceFontsManager.getInstance().addBounce(monster,"999887",Direction.LeftUp);
        // BounceFontsManager.getInstance().addBounce(monster,"999887",Direction.LeftUp);
        // BounceFontsManager.getInstance().addBounce(monster,"999887",Direction.LeftUp);
        // BounceFontsManager.getInstance().addBounce(monster,"999887",Direction.LeftUp);
        // BounceFontsManager.getInstance().addBounce(monster,"999887",Direction.LeftUp);
        // BounceFontsManager.getInstance().addBounce(monster,"999887",Direction.LeftUp);
    },
    _createMainPlayer() {
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
        this._mainPlayer.autoCulling = true;
        this._mainPlayer.changeController(new MainPlayerController2());

        let hpBar = GameObjectFactory.getInstance().getObject(SceneConst.STUFF_HP).getComponent("BloodBar");
        this._mainPlayer.hpBar = hpBar;
        hpBar.setBlood(100, 100);


        let title = GameObjectFactory.getInstance().getObject(SceneConst.STUFF_TITLE).getComponent("TitleStuff");
        this._mainPlayer.title = title;
        title.text = "主角";

        this._gameScene.addObject(this._mainPlayer);

        // this._gameScene.map.follow(this._mainPlayer);
    },
    _testSkillHandler(evt) {
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
    _useSkillTest(type, attacker, attacked) {
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
    _checkAndCreateMonster() {
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
    _createTestBuildings() {
        this._buildingIdStart++;
        let data1 = { data: cc.hj.Global.buildingList[0], posX: 3280, posY: 816 + 16 };
        this._createABuilding(this._buildingIdStart, data1, cc.hj.assetsMgr.getBuildingSpriteFrame(1));
        this._buildingIdStart++;
        let data2 = { data: cc.hj.Global.buildingList[1], posX: 3568 + 16, posY: 976 + 16 };
        this._createABuilding(this._buildingIdStart, data2, cc.hj.assetsMgr.getBuildingSpriteFrame(2));
        this._buildingIdStart++;
        let data3 = { data: cc.hj.Global.buildingList[2], posX: 3792 + 16, posY: 1008 };
        this._createABuilding(this._buildingIdStart, data3, cc.hj.assetsMgr.getBuildingSpriteFrame(3));
    },
    _createABuilding(id, data, spriteFrame) {
        let building = GameObjectFactory.getInstance().getObject(SceneConst.BUILDING).getComponent("BuildingObject");
        building.id = id;
        building.data = data.data;
        this._gameScene.characterHash[building.id] = building;
        building.render = this._gameScene.renderEffect;
        building.posX = data.posX;
        building.posY = data.posY;
        building.alphaCheck = false;
        building.autoCulling = false;
        let rectW = data.data.col * RpgGlobal.GRID_SIZE;
        let rectH = data.data.row * RpgGlobal.GRID_SIZE;
        building.footArea = new cc.Rect(-rectW / 2, rectH / 2, rectW, rectH);
        // building.footVisible = true;

        let graphicsR = new SingleSpriteGraphics();
        graphicsR.addPart(SceneConst.BODY_TYPE, spriteFrame);
        // building.node.scale = 0.2;
        building.graphicsRes = graphicsR;
        building.stuffOffSetY = 80;

        let title = GameObjectFactory.getInstance().getObject(SceneConst.STUFF_TITLE).getComponent("TitleStuff");
        building.title = title;
        title.text = data.data.name;
        title.textColor = new cc.Color(255, 0, 0);

        this._gameScene.addObject(building);
        let colStart = Math.floor((data.posX - rectW / 2) / RpgGlobal.GRID_SIZE);
        let rowStart = Math.floor((data.posY - rectH / 2) / RpgGlobal.GRID_SIZE);
        let colEnd = colStart + data.data.col;
        let rowEnd = rowStart + data.data.row;
        let doorArr = data.data.door.split(",");
        let doorX = parseInt(doorArr[0]);
        let doorY = parseInt(doorArr[1]);
        let doorW = parseInt(doorArr[2]);
        let doorH = parseInt(doorArr[3]);

        for (let i = colStart; i < colEnd; i++) {
            for (let j = rowStart; j < rowEnd; j++) {
                if ((i - colStart) >= doorX && ((i - colStart) < (doorX + doorW)) &&
                    (j - rowStart) >= doorY && ((j - rowStart) < (doorY + doorH))
                ) {
                    let sq = this._gameScene.map.sceneData.take(i + "|" + j);
                    if (sq) {
                        sq.isAlpha = true;
                    }
                    continue;
                }
                this._gameScene.map.sceneData.updateRoadWalkable(i, j, false);
            }
        }
    }

});