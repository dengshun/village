const GameObject = require("GameObject");
cc.Class({
    extends: GameObject,
    properties: {
        _loopPlayEnd: false,//非循环动画是否已经播放完成
        _movieStoped: false,
        _currentFrame: {
            type: cc.Integer,
            serializable:false,
            default: 0
        },
        currentFrame:{
            set:function(value){
                this._currentFrame=value;
            },
            get:function(){
                return this._currentFrame;
            },
            visible:false,
        },
        _totalFrame: {
            type: cc.Integer,
            serializable:false,
            default: 0
        },
        totalFrame:{
            set:function(value){
                this._totalFrame=value;
            },
            get:function(){
                return this._totalFrame;
            },
            visible:false,
        },
        _delay: {
            type: cc.Integer,
            serializable:false,
            default: 70
        },
        _loopTimes: {
            type: cc.Integer,
            default: -1
        },
        _currentTimes: {
            type: cc.Integer,
            serializable:false,
            default: 0
        },
        _speedRatio: {
            type: cc.Float,
            serializable:false,
            default: 1
        },
        _timePassed: {
            type: cc.Integer,
            serializable:false,
            default: 0
        },
    },
    onLoad: function () {
        this._super();
    },
    renew: function (...args) {
        if(this._disposed){
            this._super();
            this._timePassed = 0;
            this._speedRatio = 1;
            this._currentFrame = 0;
            this._totalFrame = 0;
            this._delay = 70;
            this._loopTimes = -1;
            this._currentTimes = 0;
        }
    },
    _updateGraphicsData: function () {
        this._currentTimes = 0;
        this._loopPlayEnd = false;
        this._totalFrame = this._graphics.totalFrame;
        this._currentFrame = 0;
        this._delay = 0;
        this._loopTimes = this._graphics.loopTimes;
        this._timePassed = 0;
        this._updateDelay();
    },
    _renderHandler: function (dt) {
        let tmpPlayEnd=this._loopPlayEnd;
        let loopCount=0;
        while (true) {
            loopCount++;
            let enterFrameOk = this._enterFrame(dt);
            if (!enterFrameOk) {
                break;
            }else{
                if(loopCount>10){
                    this._timePassed=0;
                    break;
                }
            }

        }
        this._super(dt);
        if((!tmpPlayEnd)&&this._loopPlayEnd){
            this._loopPlayEndHandler();
        }
    },
    _enterFrame: function (dt) {
        let isOk = false;
        if (this._graphics && this._graphics.isReady &&
            this._graphics.totalFrame > 0 && (!this._loopPlayEnd) && (!this._movieStoped)) {
            this._timePassed += dt * 1000 * this._speedRatio;
            if (this._timePassed >= this._delay) {
                this._timePassed -= this._delay;
                if (this._currentFrame >= this._totalFrame - 1) {
                    this._currentTimes++;
                    if (this._loopTimes == -1 || this._currentTimes < this._loopTimes) {
                        this._currentFrame = 0;
                        isOk = true;
                    } else {
                        this._loopPlayEnd = true;
                    }
                } else {
                    this._currentFrame++;
                    isOk = true;
                }
            }
        }
        if (isOk) {
            this._updateDelay();
        }
        return isOk;
    },
    _updateDelay: function () {
        let frameData = this._graphics.getBodyFrameData(this._directionNum, this._currentFrame);
        if (frameData) {
            this._delay = frameData.speed;
        } else {
            this._delay = 0;
        }
    },
    _loopPlayEndHandler:function(){

    },
});