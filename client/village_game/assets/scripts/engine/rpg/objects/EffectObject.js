const GameObject = require("GameObject");
const RpgScene = require("RpgScene");
const GraphicsBase = require("GraphicsBase");
cc.Class({
    extends: GameObject,
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
        },
        graphicsRes: {
            set: function(value) {
                this._graphics = value;
                this._graphics.setDirection(this.directionNum);
                this._graphics.setStartListener(this._movieStartListener.bind(this));
                this._graphics.setEndListener(this._movieEndListener.bind(this));
                this._graphics.setCompleteListener(this._movieCompleteListener.bind(this));
            },
            get: function() {
                return this._graphics;
            },
            override: true,
            type: GraphicsBase,
            visible: false,
        },
    },
    _loopPlayEndHandler: function() {

    },
    _movieStartListener: function() {

    },
    _movieEndListener: function() {
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
    _movieCompleteListener: function() {

    },
    dispose: function() {
        this._super();
        this.playEndCall = null;
        this.scene = null;
    }
});