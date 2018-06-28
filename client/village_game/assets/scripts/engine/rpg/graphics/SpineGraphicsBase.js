const SpineGraphicsManager = require("SpineGraphicsManager");
const GraphicsBase = require("GraphicsBase");
const SceneConst = require("SceneConst");
const Actions = require("Actions");
let SpineGraphicsBase = cc.Class({
    name: "SpineGraphicsBase",
    extends: GraphicsBase,
    properties: {
        _bodyName: "",
        _parts: null,
        _bodyNode: {
            type: cc.Node,
            serializable: false,
            default: null,
        },
        bodyNode: {
            set: function(value) {
                this._bodyNode = value;
                this._updateBodySpine();
                this._playAction();
            },
            get: function() {
                return this._bodyNode;
            },
            visible: false,
            override: true,
        },
        _bodySpine: null,
        _bodyGraphicsData: null, //当前动作数据
        _isReady: false,
        isReady: {
            get: function() {
                return this._isReady;
            },
            visible: false,
            override: true,
        },
        _completeListener: {
            type: Function,
            default: null,
            serializable: false,
        },
        _endListener: {
            type: Function,
            default: null,
            serializable: false,
        },
        _startListener: {
            type: Function,
            default: null,
            serializable: false,
        },
        _nowAction: "stand",
        _directionNum: {
            type: cc.Integer,
            serializable: false,
            default: 0,
        },
        _avatarHeight_: {
            type: cc.Integer,
            default: 80,
            serializable: false,
        },
        avatarHeight: {
            get: function() {
                return this._avatarHeight_;
            },
            set: function(v) {
                this._avatarHeight_ = v;
            },
            visible: false,
            override: true,
        }

    },
    ctor: function() {},

    addPart: function(type, id) {
        if (this._parts == null) {
            this._parts = [];
        }
        this._parts.push({ type: type, id: id });
        let gName = id;
        if (type == SceneConst.BODY_TYPE || type == SceneConst.EFFECT_TYPE) {
            this._bodyName = gName;
        }
        SpineGraphicsManager.getInstance().load(gName, () => {
            this._updateGraphicsData();
            this._playAction();
        });
    },
    setDirection: function(value) {
        this._directionNum = value;
    },
    setAction: function(value) {
        if (value != this._nowAction) {
            this._nowAction = value;
            this._playAction();
        }
    },
    _playAction: function() {
        if (this._isReady && this._bodySpine) {
            let isLoop = false;
            if (this._nowAction == Actions.Stand || this._nowAction == Actions.Walk) {
                isLoop = true;
            }
            let action = this._nowAction;
            if (action == Actions.Walk) {
                action = "move";
            } else if (action == Actions.Stand) {
                action = "idle";
            }
            this._bodySpine.setAnimation(0, action, isLoop);
        }
    },
    render: function(dt, targetNodes) {

    },
    _updateGraphicsData: function() {
        if (!this._bodyGraphicsData) {
            this._bodyGraphicsData = SpineGraphicsManager.getInstance().getData(this._bodyName);
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
    _updateBodySpine: function() {
        this._bodySpine = this._bodyNode.getComponent(sp.Skeleton);
        if (this._bodySpine == null) {
            this._bodySpine = this._bodyNode.addComponent(sp.Skeleton);
        }
        if (this._bodyGraphicsData) {
            this._bodySpine.skeletonData = this._bodyGraphicsData;
        }
        this._bodySpine.setStartListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            cc.log("[track %s][animation %s] start.", trackEntry.trackIndex, animationName);
            if (this._startListener) {
                this._startListener();
            }
        });
        this._bodySpine.setInterruptListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            cc.log("[track %s][animation %s] interrupt.", trackEntry.trackIndex, animationName);
        });
        this._bodySpine.setEndListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            cc.log("[track %s][animation %s] end.", trackEntry.trackIndex, animationName);
            if (this._endListener) {
                this._endListener();
            }
        });
        this._bodySpine.setDisposeListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            cc.log("[track %s][animation %s] will be disposed.", trackEntry.trackIndex, animationName);
        });
        this._bodySpine.setCompleteListener((trackEntry, loopCount) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            cc.log("[track %s][animation %s] complete: %s", trackEntry.trackIndex, animationName, loopCount);
            if (this._completeListener) {
                this._completeListener();
            }
        });
        this._bodySpine.setEventListener((trackEntry, event) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            cc.log("[track %s][animation %s] event: %s, %s, %s, %s", trackEntry.trackIndex, animationName, event.data.name, event.intValue, event.floatValue, event.stringValue);
        });
    },
    setEndListener: function(value) {
        this._endListener = value;
    },
    setCompleteListener: function(value) {
        this._completeListener = value;
    },
    setStartListener: function(value) {
        this._startListener = value;
    },
    dispose: function() {
        this._bodyNode = null;
        this._bodySpine = null;
        this._bodyGraphicsData = null;
        this._parts = null;
        this._endListener = null;
        this._completeListener = null;
        this._startListener = null;
    }
});