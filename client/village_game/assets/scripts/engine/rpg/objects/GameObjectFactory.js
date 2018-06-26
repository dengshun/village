const SceneConst = require("SceneConst");
let GameObjectFactory = cc.Class({
    statics: {
        _instance: GameObjectFactory,
        getInstance: function() {
            if (this._instance == null) {
                this._instance = new GameObjectFactory();
            }
            return this._instance;
        }
    },
    properties: {
        _prefabs: {
            serializable: false,
            default: {},
        },
        _pools: {
            serializable: false,
            default: {},
        }
    },
    registePrefab: function(compName, prefab, initCount = 5) {
        this._prefabs[compName] = prefab;
        let pool = [];
        for (let i = 0; i < initCount; i++) {
            pool.push(cc.instantiate(prefab));
        }
        this._pools[compName] = pool;
    },
    getObject: function(type, ...args) {
        let compName = "";
        if (type == SceneConst.CHAR) {
            compName = "CharacterObject";
        } else if (type == SceneConst.NPC) {
            compName = "NCharacterObject";
        } else if (type == SceneConst.EFFECT) {
            compName = "EffectObject";
        } else if (type == SceneConst.FONT) {
            compName = "BounceFont";
        } else if (type == SceneConst.STUFF_HP) {
            compName = "BloodBar";
        } else if (type == SceneConst.STUFF_TITLE) {
            compName = "TitleStuff";
        }
        let objNode = null;
        let objComp = null;
        if (compName != "") {
            let pool = this._pools[compName];
            if (pool) {
                if (pool.length > 0) {
                    objNode = pool.shift();
                    objComp = objNode.getComponent(compName);
                    objComp.renew.apply(objComp, args);
                } else {
                    let prefab = this._prefabs[compName];
                    objNode = cc.instantiate(prefab);
                    objComp = objNode.getComponent(compName);
                }
                objComp.type = type;
            }
        }
        return objComp;
    },
    returnObject: function(obj) {
        let compName = "";
        if (obj.type == SceneConst.CHAR) {
            compName = "CharacterObject";
        } else if (obj.type == SceneConst.NPC) {
            compName = "NCharacterObject";
        } else if (obj.type == SceneConst.EFFECT) {
            compName = "EffectObject";
        } else if (obj.type == SceneConst.FONT) {
            compName = "BounceFont";
        } else if (obj.type == SceneConst.STUFF_HP) {
            compName = "BloodBar";
        } else if (obj.type == SceneConst.STUFF_TITLE) {
            compName = "TitleStuff";
        }
        let pool = this._pools[compName];
        let index = pool.indexOf(obj.node);
        if (index === -1) {
            pool.push(obj.node);
            obj.dispose();
        }
    },

});
module.exports = GameObjectFactory;