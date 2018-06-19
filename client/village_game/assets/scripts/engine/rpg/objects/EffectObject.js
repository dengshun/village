const MovieObject = require("MovieObject");
const RpgScene=require("RpgScene");
cc.Class({
    extends: MovieObject,
    properties: {
        playEndCall: {
            type: Function,
            serializable: false,
            default: null,
            visible: false,
        },
        scene: {
            serializable: false,
            default: null,
            type: RpgScene,
            visible: false,
        }
    },
    _loopPlayEndHandler: function () {
        if (this.scene) {
            this.scene.removeObject(this);
        }
        let tmp = this.playEndCall;
        if (tmp) {
            this.playEndCall = null;
            if (tmp.length > 0) {
                tmp(this);
            } else {
                tmp();
            }
        }
    },
    dispose: function () {
        this._super();
        this.playEndCall = null;
        this.scene=null;
    }
});