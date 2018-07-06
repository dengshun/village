const IAI = require("IAI");
const SceneConst = require("SceneConst");
const BounceFontsManager = require("BounceFontsManager");
const Direction = require("Direction");
const GameObjectFactory = require("GameObjectFactory");
const SceneFightManager = require("SceneFightManager");
cc.Class({
    extends: IAI,
    properties: {
        _selectedObject: null,
        _scene: null,
        _target: null,
    },
    setup(target, scene) {
        this._scene = scene;
        this._target = target;
    },
    run() {
        this.gotoHospital();
    },
    gotoHospital() {
        let hospital = this._getBuildingByType(cc.hj.GameConfig.BuildingType.HOSPITAL);
        if (hospital) {
            this._target.controller.walkTo(hospital.posX, hospital.posY, true, () => {
                this._target.objectVisible = false;
                setTimeout(() => {
                    this._target.objectVisible = true;
                    // BounceFontsManager.getInstance().addBounce(this._target, "去了一趟医院，爽的一逼", Direction.Up);
                    this.gotoEquipRoom();
                    setTimeout(() => {
                        let bubble = GameObjectFactory.getInstance().getObject(SceneConst.STUFF_BUBBLE).getComponent("BubbleStuff");
                        bubble.text = "<color=#00ff00>去了一趟医院</c><br/><color=#0fffff>爽的一逼</color>";
                        bubble.duration = 1;
                        this._target.addStuff(bubble);
                    }, 500);
                }, 2000);
            }, null)
        }
    },
    gotoEquipRoom() {
        let equipRoom = this._getBuildingByType(cc.hj.GameConfig.BuildingType.EQUIPROOM);
        if (equipRoom) {
            this._target.controller.walkTo(equipRoom.posX, equipRoom.posY, true, () => {
                this._target.objectVisible = false;
                setTimeout(() => {
                    this._target.objectVisible = true;
                    this.gotoTrainRoom();
                    setTimeout(() => {
                        let bubble = GameObjectFactory.getInstance().getObject(SceneConst.STUFF_BUBBLE).getComponent("BubbleStuff");
                        bubble.text = "<color=#00ff00>卖了把刀</c><br/><color=#0fffff>赚了1W元宝</color>";
                        bubble.duration = 1;
                        this._target.addStuff(bubble);
                    }, 500);
                }, 2000);
            }, null)
        }
    },
    gotoTrainRoom() {
        let trainRoom = this._getBuildingByType(cc.hj.GameConfig.BuildingType.TRAINROOM);
        if (trainRoom) {
            this._target.controller.walkTo(trainRoom.posX, trainRoom.posY, true, () => {
                this._target.objectVisible = false;
                setTimeout(() => {
                    this._target.objectVisible = true;
                    this.gotoFieldKillMonster();
                    setTimeout(() => {
                        let bubble = GameObjectFactory.getInstance().getObject(SceneConst.STUFF_BUBBLE).getComponent("BubbleStuff");
                        bubble.text = "<color=#00ff00>训练完成</c>";
                        bubble.duration = 1;
                        this._target.addStuff(bubble);
                    }, 500);
                }, 2000);
            }, null)
        }
    },
    _getBuildingByType(btype) {
        let allBuildings = this._scene.getObjectsByType(SceneConst.BUILDING, null);
        let tbuilding = null;
        for (let building of allBuildings) {
            if (building.data.type == btype) {
                tbuilding = building;
                break;
            }
        }
        return tbuilding;
    },
    gotoFieldKillMonster() {
        let allMonsters = this._scene.getObjectsByType(SceneConst.MONSTER, null);
        if (allMonsters.length > 0) {
            let monster = allMonsters[Math.floor(Math.random() * allMonsters.length)];
            if (!monster.inCamera) {
                // this._scene.map.focusObject.controller.walkTo(monster.posX, monster.posY, true, () => {

                // }, null);
                this._scene.cameraFlyTo(monster.pos);
            }
            this._target.controller.walkTo(monster.posX, monster.posY, true, () => {
                this.useSkillToMonster(monster);
            }, null);
        }
    },
    useSkillToMonster(attacked) {
        let self = this;
        let fightEnd = function(attacker, attacked) {
            attacked.setBlood(Math.max(0, attacked.currentBlood - 10));
            let harm = { attackerId: attacker.id, attackedId: attacked.id, value: 10, type: 1 }
            SceneFightManager.getInstance().charHarm(harm);
            if (attacked.currentBlood <= 0) {
                attacked.isDeath = true;
                self._scene.removeObject(attacked);
                delete self._scene.characterHash[attacked.id];
            }
            self.gotoFieldKillMonster();
        }
        SceneFightManager.getInstance().playSkillAction1(this._target.id, attacked.id, 0, fightEnd, this);
    }

});