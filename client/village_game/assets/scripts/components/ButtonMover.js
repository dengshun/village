cc.Class({
    extends: cc.Component,
    properties: {
        
    },
    onLoad: function () {
        this.initY=this.node.getPositionY();
    },
    _addEventListeners:function(){
        this.node.on(cc.Node.EventType.TOUCH_START,this._touchStartHandler,this);
        this.node.on(cc.Node.EventType.TOUCH_END,this._touchEndHandler,this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL,this._touchCancelHandler,this);
    },
    _removeEventListeners:function(){
        this.node.off(cc.Node.EventType.TOUCH_START,this._touchStartHandler,this);
        this.node.off(cc.Node.EventType.TOUCH_END,this._touchEndHandler,this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL,this._touchCancelHandler,this);
    },
    _touchStartHandler:function(event){
        this.node.setPositionY(this.initY-20);
    },
    _touchEndHandler:function(event){
        this.node.setPositionY(this.initY);
    },
    _touchCancelHandler:function(event){
        this.node.setPositionY(this.initY);
    },
    onEnable:function(){
        this._addEventListeners();
    },
    onDisable:function(){
        this._removeEventListeners();
        this._touchEndHandler(null);
    },
    onDestroy:function(){
        this._removeEventListeners();
    }
});
