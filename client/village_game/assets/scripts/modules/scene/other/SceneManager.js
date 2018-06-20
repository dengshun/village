const SceneConst = require("SceneConst");
const GameScene = require("GameScene");
var SceneManager = cc.Class({
    statics: {
        _instance: SceneManager,
        getInstance: function() {
            if (this._instance == null) {
                this._instance = new SceneManager();
            }
            return this._instance;
        }
    },
    properties: {
        scene: {
            serializable: false,
            default: null,
            type: GameScene,
            visible: false,
        }
    },
});
module.exports = SceneManager;