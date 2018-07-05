const SceneManager = require("SceneManager");
const GameObject = require("GameObject");
const Actions = require("Actions");
const BounceFontsManager = require("BounceFontsManager");
var SceneFightManager = cc.Class({
    statics: {
        _instance: SceneFightManager,
        getInstance: function() {
            if (this._instance == null) {
                this._instance = new SceneFightManager();
            }
            return this._instance;
        }
    },
    playSkillAction1: function(attackerId, attackedId, skillId, playEndFunc = null, playEndFuncThisObject = null) {
        let attacker = SceneManager.getInstance().scene.characterHash[attackerId];
        let attacked = SceneManager.getInstance().scene.characterHash[attackedId];
        this.playSkillAction2(attacker, skillId, attacked, playEndFunc, playEndFuncThisObject);
    },
    playSkillAction2: function(attacker, skill, attacked, playEndFunc = null, playEndFuncThisObject = null) {
        if ((!attacker) || (!attacker.inCamera)) {
            return;
        }
        if (attacked) {
            if (attacked instanceof GameObject) {
                attacker.faceToPoint(attacked.posX, attacked.posY);
            } else if (attacked instanceof cc.Vec2) {
                attacker.faceToPoint(attacked.x, attacked.y);
            }
        }
        attacker.play(Actions.Skill, function() {
            if (playEndFunc != null) {
                playEndFunc.apply(playEndFuncThisObject, [attacker, attacked]);
            }
        });
        //刀光
        let lightEff = SceneManager.getInstance().getEffect(800001, attacker.pos);
        lightEff.directionNum = attacker.directionNum;
    },
    charHarm: function(data) {
        let attackerId = data.attackerId;
        let attackedId = data.attackedId;
        let attacker = SceneManager.getInstance().scene.characterHash[attackerId];
        let attacked = SceneManager.getInstance().scene.characterHash[attackedId];
        if (attacker == null || attacked == null) {
            return;
        }
        let value = data.value;
        let directionNum = attacker.getDirectionByPoint(attacked.posX, attacked.posY);
        BounceFontsManager.getInstance().addBounce(attacked, "-" + value, directionNum);
    }
});