const GraphicsManager = require("GraphicsManager");
const SceneConst = require("SceneConst");
let GraphicsBase = cc.Class({
    name:"GraphicsBase",
    properties: {
        isReady: false,
        _bodyGraphicsDatas: null,//所有动作的数据
        _bodyGraphicsData: null,//当前动作数据
        _bodyFrameData: null,//当前帧数据
        _bodyAtlas: null,
        _bodyName: "",
        _parts: null,
        _nowAction: "stand",
        _hasDirection: false,
        nowAction: {
            set: function (value) {
                this._bodyGraphicsData = null;
                this._nowAction = value;
                this._updateGraphicsData();
            },
            get: function () {
                return this._nowAction;
            }
        },
        totalFrame: {
            get: function () {
                if (this._bodyGraphicsData) {
                    return this._bodyGraphicsData.frames;
                } else {
                    return 0;
                }
            }
        },
        loopTimes:{
            get:function () {
                if (this._bodyGraphicsData) {
                    return this._bodyGraphicsData.replay;
                } else {
                    return -1;
                }
            }
        },
        avatarHeight:{
            get:function(){
                if(this._bodyGraphicsDatas){
                    return parseInt(this._bodyGraphicsDatas.avatarHeight);
                }else{
                    return 10;
                }
            }
        }
    },
    ctor: function () {
    },
    addPart: function (type, id) {
        if (this._parts == null) {
            this._parts = [];
        }
        this._parts.push({ type: type, id: id });
        let gName = type + "_" + id;
        if (type == SceneConst.BODY_TYPE||type==SceneConst.EFFECT_TYPE) {
            this._bodyName = gName;
        }
        GraphicsManager.getInstance().load(gName);
    },
    _updateGraphicsData:function(){
        this._updateBodyGraphicsData();
    },
    _updateBodyGraphicsData: function () {
        if (this._bodyName && this._bodyGraphicsData == null) {
            if (this._bodyGraphicsDatas == null) {
                this._bodyGraphicsDatas = GraphicsManager.getInstance().getData(this._bodyName);
            }

            if (this._bodyGraphicsDatas) {
                this.isReady = true;
                this._bodyGraphicsData = this._getActionData(this._bodyGraphicsDatas.action,this._nowAction);
                this._hasDirection = this._bodyGraphicsData.dir.length > 1;
            }
        }
    },
    renderBody: function (target, directionNum = 0, currentFrame = 0) {
        this._updateBodyGraphicsData();
        if (this._bodyGraphicsData) {
            this._bodyFrameData = null;
            let absDirectionNum;
            if (this._hasDirection) {
                absDirectionNum = directionNum > 0 ? directionNum : -directionNum;
            } else {
                directionNum = 0;
                absDirectionNum = 0;
            }
            let dirData = this._getDirFramsData(this._bodyGraphicsData.dir,absDirectionNum);
            if (dirData) {
                this._bodyFrameData = this._getFrameData(dirData, currentFrame);
                let spriteFrame;
                if (this._bodyFrameData) {
                    if (!this._bodyAtlas) {
                        this._bodyAtlas = GraphicsManager.getInstance().getSpriteAtlas(this._bodyName);
                    }
                    if (this._bodyAtlas) {
                        spriteFrame = this._bodyAtlas.getSpriteFrame(this._nowAction + "-" + absDirectionNum + "-" + this._bodyFrameData.linkage);
                    }
                }
                if (spriteFrame) {
                    target.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    if(directionNum<0){
                        target.scaleX=-1;
                    }else{
                        target.scaleX=1;
                    }
                }else{
                }
            }
        }
        target.setPosition(this._tx(directionNum),this._ty(directionNum));
    },
    getBodyFrameData:function(directionNum,frame){
        if(this._bodyGraphicsData){
            let absDirectionNum;
            if (this._hasDirection) {
                absDirectionNum = directionNum > 0 ? directionNum : -directionNum;
            } else {
                directionNum = 0;
                absDirectionNum = 0;
            }
            let dirData=this._getDirFramsData(this._bodyGraphicsData.dir,absDirectionNum);
            return this._getFrameData(dirData,frame);
        }else{
            return null;
        }
    },
    _getFrameData: function (dirData, frame) {
        let frames = dirData.frame;
        for (let i = 0; i < frames.length; i++) {
            let frameData = frames[i];
            if (frameData.frame == frame) {
                return frameData;
            }
        }
        return null;
    },
    _getDirFramsData: function (dirs,directionNum) {
        for (let i = 0; i < dirs.length; i++) {
            let dirData = dirs[i];
            if (dirData.dir == directionNum) {
                return dirData;
            }
        }
        return null;
    },
    _getActionData: function (actionDatas,action) {
        for (let i = 0; i < actionDatas.length; i++) {
            let actionData = actionDatas[i];
            if (actionData.id == action) {
                return actionData;
            }
        }
        return null;
    },
    _getAvatarIdByType: function (type) {
        for (let i = 0; i < this._parts.length; i++) {
            let part = this._parts[i];
            if (part.type == type) {
                return part.id;
            }
        }
        return 0;
    },
    _tx:function(directionNum){
        if(!this._hasDirection){
            directionNum=0;
        }
        let tx=0;
        if(this._bodyFrameData){
            if(directionNum>=0){
                tx=this._bodyFrameData.width/2-(this._bodyFrameData.tx-this._bodyFrameData.offsetX);
            }else{
                tx=(this._bodyFrameData.tx-this._bodyFrameData.offsetX)-this._bodyFrameData.width/2;
            }
        }
        return tx;
    },
    _ty:function(directionNum){
        let ty=0;
        if(this._bodyFrameData){
            ty=(this._bodyFrameData.ty-this._bodyFrameData.offsetY)-this._bodyFrameData.height/2;
        }
        return ty;
    }
});