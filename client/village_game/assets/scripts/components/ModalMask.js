cc.Class({
    extends: cc.Component,

    properties: {
        mask: cc.Node,
    },


    onLoad: function () {

    },
    onEnable: function () {
        this.mask.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this)
        this.mask.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this)
    },
    onDisable: function () {
        this.mask.off(cc.Node.EventType.TOUCH_START, this._onTouchStart, this)
        this.mask.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this)
    },
    _onTouchStart: function (event) {
        event.stopPropagation();
    },
    _onTouchEnd: function (event) {
        event.stopPropagation();
    }
});
