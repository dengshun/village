const SpGraphicsManager = require("SpGraphicsManager");
const SceneConst = require("SceneConst");
const Actions = require("Actions");
let SpGraphicsBase = cc.Class({
    name: "SpGraphicsBase",
    properties: {
        _isReady: false,
        isReady: {
            get: function() {
                return this._isReady;
            },
            visible: false,
        },
        _nowAction: "stand",
        _graphicsName: "",
        graphicsName: {
            get: function() {
                return this._graphicsName;
            },
            set: function(value) {
                if (this._graphicsName != value) {
                    this._bodyGraphicsData = null;
                    this._graphicsName = value;
                    this._updateGraphicsData();
                    if (!this._bodyGraphicsData) {
                        SpGraphicsManager.getInstance().load(this._graphicsName);
                    }
                }
            },
            visible: false,
        },
        _bodyNode: null,
        _bodySpine: null,
        _bodyGraphicsData: null, //当前动作数据
        _playEndCallBack: null,

    },
    ctor: function() {},
    setBodyNode: function(targetNode) {
        this._bodyNode = targetNode;
        if (this._bodyGraphicsData) {
            this._bodySpine.skeletonData = this._bodyGraphicsData;
        }
        this._bodySpine = this.getComponent('sp.Skeleton');
        this._bodySpine.setStartListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            cc.log("[track %s][animation %s] start.", trackEntry.trackIndex, animationName);
        });
        this._bodySpine.setInterruptListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            cc.log("[track %s][animation %s] interrupt.", trackEntry.trackIndex, animationName);
        });
        this._bodySpine.setEndListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            cc.log("[track %s][animation %s] end.", trackEntry.trackIndex, animationName);
            if (this._playEndCallBack) {
                let tmp = this._playEndCallBack;
                this._playEndCallBack = null;
                this.tmp();
            }
        });
        this._bodySpine.setDisposeListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            cc.log("[track %s][animation %s] will be disposed.", trackEntry.trackIndex, animationName);
        });
        this._bodySpine.setCompleteListener((trackEntry, loopCount) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            cc.log("[track %s][animation %s] complete: %s", trackEntry.trackIndex, animationName, loopCount);
        });
        this._bodySpine.setEventListener((trackEntry, event) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            cc.log("[track %s][animation %s] event: %s, %s, %s, %s", trackEntry.trackIndex, animationName, event.data.name, event.intValue, event.floatValue, event.stringValue);
        });
    },
    _updateGraphicsData: function() {
        if (!this._bodyGraphicsData) {
            this._bodyGraphicsData = GraphicsManager.getInstance().getData(this._graphicsName);
            if (this._bodyGraphicsData) {
                this._isReady = true;
                if (this._bodySpine) {
                    this._bodySpine.skeletonData = this._bodyGraphicsData;
                }
            } else {
                this._isReady = false;
            }
        }
    },
    playAction: function(action, directionNum, callBack = null) {
        if (this._bodyGraphicsData == null) {
            this._updateGraphicsData();
        }
        if (this._bodyGraphicsData) {
            this._playEndCallBack = callBack;
            let isLoop = false;
            if (action == Stand || action == Walk) {
                isLoop = true;
            }
            this._bodySpine.setAnimation(0, action, isLoop);
            return true;
        } else {
            return false;
        }
    },
    dispose: function() {
        this._bodyNode = null;
        this._bodySpine = null;
        this._bodyGraphicsData = null;
        this._playEndCallBack = null;
        this._parts = null;
    }
});