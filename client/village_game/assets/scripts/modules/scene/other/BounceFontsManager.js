const Direction = require("Direction");
const RpgGlobal=require("RpgGlobal");
const SceneConst = require("SceneConst");
const GameObjectFactory=require("GameObjectFactory");
var BounceFontsManager = cc.Class({
    statics: {
        POS_LEFT_TOP: 0,//-1
        POS_MIDDLE_TOP: 1,//0
        POS_RIGHT_TOP: 2,//1
        POS_LEFT: 3,//-2
        POS_RIGHT: 4,//2
        POS_LEFT_BOTTOM: 5,//-3
        POS_MIDDLE_BOTTOM: 6,//4
        POS_RIGHT_BOTTOM: 7,//3
        POS_MIDDLE: 8,
        POS_MAX: 9,
        _instance: BounceFontsManager,
        getInstance: function () {
            if (this._instance == null) {
                this._instance = new BounceFontsManager();
            }
            return this._instance;
        }
    },
    properties: {
        _endOffX: null,
        _endOffY: null,
        _bounceQueues: null,
        _scheduler:null,
        _running:false,
    },
    ctor: function () {
        this._endOffX = [-80, 0, 60, -80, 80, -80, 0, 80, 0];
        this._endOffY = [-80, -80, -30, 0, 0, 60, 60, 60, 0];
        this._bounceQueues = {};
    },
    _updatePositionInfo:function(char,from,to,posType){
        let stuffOffSetY = char.stuffOffSetY;
        switch (posType) {
            case BounceFontsManager.POS_LEFT_TOP:
                from.x = to.x - 30;
                from.y = to.y - stuffOffSetY;
                break;
            case BounceFontsManager.POS_MIDDLE_TOP:
                from.x = to.x;
                from.y = to.y - stuffOffSetY;
                break;
            case BounceFontsManager.POS_RIGHT_TOP:
                from.x = to.x + 30;
                from.y = to.y - stuffOffSetY;
                break;
            case BounceFontsManager.POS_LEFT:
                from.x = to.x - 30;
                from.y = to.y - stuffOffSetY * 0.5;
                break;
            case BounceFontsManager.POS_MIDDLE:
                from.x = to.x ;
                from.y = to.y - stuffOffSetY * 0.5;
                break;
            case BounceFontsManager.POS_RIGHT:
                from.x = to.x + 30;
                from.y = to.y - stuffOffSetY * 0.5;
                break;
            case BounceFontsManager.POS_LEFT_BOTTOM:
                from.x = to.x - 30;
                break;
            case BounceFontsManager.POS_MIDDLE_BOTTOM:
                from.x = to.x;
                break;
            case BounceFontsManager.POS_RIGHT_BOTTOM:
                from.x = to.x + 30;
                break;
            default:
                from.y = to.y - stuffOffSetY;
                break;
        }
        to.x = from.x + this._endOffX[posType];
        to.y = from.y + this._endOffY[posType];
    },
    addFightBounce(char, text, direction, fadeOut = false) {
        let posType;
        switch (direction) {
            case Direction.Up:
                posType = BounceFontsManager.POS_MIDDLE_TOP;
                break;
            case Direction.LeftUp:
                posType = BounceFontsManager.POS_LEFT_TOP;
                break;
            case Direction.Left:
                posType = BounceFontsManager.POS_LEFT;
                break;
            case Direction.LeftDown:
                posType = BounceFontsManager.POS_LEFT_BOTTOM;
                break;
            case Direction.Down:
                posType = BounceFontsManager.POS_MIDDLE_BOTTOM;
                break;
            case Direction.RightDown:
                posType = BounceFontsManager.POS_RIGHT_BOTTOM;
                break;
            case Direction.Right:
                posType = BounceFontsManager.POS_RIGHT;
                break;
            case Direction.RightUp:
                posType = BounceFontsManager.POS_RIGHT_TOP;
                break;
            default:
                break;
        }

        let from = char.pos.clone();
        let to = char.pos.clone();
        this._updatePositionInfo(char,from,to,posType);
        let queueKey=char.id+"_"+posType;
        let queue=this._bounceQueues[queueKey];
        if(!queue){
            queue=[];
            this._bounceQueues[queueKey]=queue;
        }
        queue.push({text:text,from:from,to:to,fadeOut:fadeOut});
        if(this._scheduler==null){
            this._scheduler=cc.director.getScheduler();
        }
        if(!this._running){
            this._running=true;
            this._scheduler.schedule(this._scheduleUpdateBounce,this,0.1);
        }
    },
    _scheduleUpdateBounce:function(){
        let left=0;
        for(let key in this._bounceQueues){
            let queue=this._bounceQueues[key];
            let queueLen=queue.length;
            if(queueLen>0){
                queueLen--;
                let bounceObj=queue.shift();
                this._createBounceFont(bounceObj);
            }
            left+=queueLen;
        }
        if(left<=0){
            this._running=false;
            this._scheduler.unschedule(this._scheduleUpdateBounce,this,0.1);
        }
    },
    _createBounceFont:function(bounceInfo){
        let font=GameObjectFactory.getInstance().getObject(SceneConst.FONT).getComponent("BounceFont");
        font.text=bounceInfo.text;
        font.autoCulling=false;
        font.scene=RpgGlobal.scene;
        font.fadeOut=bounceInfo.fadeOut;
        font.render = RpgGlobal.scene.renderEffect;
        font.setPos(bounceInfo.from.x,bounceInfo.from.y);
        RpgGlobal.scene.addObject(font,SceneConst.TOP_LAYER);
        font.startBouncing(bounceInfo.to.x,bounceInfo.to.y);
    }

});
module.exports=BounceFontsManager;