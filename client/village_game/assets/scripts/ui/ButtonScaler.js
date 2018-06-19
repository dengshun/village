cc.Class({
    extends: cc.Component,

    properties: {
        pressedScale: 1.1,
        transDuration: 0
    },

    onLoad: function () {
        let self = this;
        self.initScale = this.node.scale;
        self.scaleFlag=self.initScale<0?-1:1;
        self.button = this.node.getComponent(cc.Button);
        if(!self.button){
            self.button=this;
        }
        self.scaleDownAction = cc.scaleTo(this.transDuration, this.pressedScale*self.scaleFlag);
        self.scaleUpAction = cc.scaleTo(this.transDuration, this.initScale);
        function onTouchDown(event) {
            if (self.button.enabled) {
                this.stopAllActions();
                this.runAction(self.scaleDownAction);
            }
        }
        function onTouchUp(event) {
            if (self.button.enabled) {
                this.stopAllActions();
                this.runAction(self.scaleUpAction);
            }
        }
        this.button.onDisable = this.onButtonDisable.bind(this);
        this._addEventListeners();
    },
    _addEventListeners: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this._touchStartHandler, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._touchEndHandler, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._touchCancelHandler, this);
    },
    _removeEventListeners: function () {
        this.node.off(cc.Node.EventType.TOUCH_START, this._touchStartHandler, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this._touchEndHandler, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._touchCancelHandler, this);
    },
    _touchStartHandler: function (event) {
        if (this.button.enabled) {
            this._scaleDown();
        }
    },
    _touchEndHandler: function (event) {
        if (this.button.enabled) {
            this._scaleUp();
        }
    },
    _touchCancelHandler: function (event) {
        if (this.button.enabled) {
            this._scaleUp();
        }
    },
    onButtonDisable: function () {
        if (this.button.enabled == false) {
            this._scaleUp();
        }
    },
    _scaleDown: function () {
        this.node.stopAllActions();
        this.node.runAction(this.scaleDownAction);
    },
    _scaleUp: function () {
        this.node.stopAllActions();
        this.node.runAction(this.scaleUpAction);
    },
    onDestroy:function(){
        this._removeEventListeners();
    },
    scaleButton: function () {
       this._scaleDown();
    },
});
