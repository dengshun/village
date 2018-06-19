let StuffLayout = cc.Enum({
    /**绝对坐标布局**/
    LAYOUT_FOOT_ABSOLUTE: "foot_absolute",
    /**绝对坐标布局**/
    LAYOUT_HEAD_ABSOLUTE: "head_absolute",
    /**自动布局-垂直**/
    LAYOUT_HEAD_VERTICAL: "head_vertical",
    /**自动布局-水平**/
    LAYOUT_HEAD_HORIZONTAL: "head_horizontal",
});
let BaseStuff = cc.Class({
    extends:cc.Component,
    properties: {
        type:{
            default: 0,
            serializable: false,
            visible:false,
        },
        _owner: {
            default: null,
            serializable: false, 
        },
        _offsetX: {
            type: cc.Integer,
            serializable: false,
            default: 0,
        },
        _offsetY: {
            type: cc.Integer,
            serializable: false,
            default: 0,
        },
        owner: {
            set: function (value) {
                this._owner = value;
            },
            get: function () {
                return this._owner;
            },
            visible: false,
        },
        /**LAYOUT_FOOT_ABSOLUTE:锚点在脚下，绝对坐标布局,LAYOUT_HEAD_ABSOLUTE锚点在头上，相对坐标布局，LAYOUT_HEAD_VERTICAL：锚点在头上,自动布局-垂直;LAYOUT_HEAD_HORIZONTAL：锚点在头上,自动布局-水平**/
        _layout: {
            serializable: false,
            default: StuffLayout.LAYOUT_HEAD_VERTICAL,
        },
        offsetX: {
            set: function (value) {
                this._offsetX = value;
            },
            get: function () {
                return this._offsetX;
            },
            visible: false
        },
        offsetY: {
            set: function (value) {
                this._offsetY = value;
            },
            get: function () {
                return this._offsetY;
            },
            visible: false
        },
        layout: {
            set: function (value) {
                this._layout = value;
            },
            get: function () {
                return this._layout;
            },
            visible: false
        },
        _disposed: {
            serializable: false,
            default: false,
        },
        disposed: {
            set: function (value) {
                this._disposed = value;
            },
            get: function () {
                return this._disposed;
            },
            visible: false,
        },
    },
    renew: function (...args) {
        if(this._disposed){
            this._disposed = false;
            this._offsetX=0;
            this._offsetY=0;
            this._layout=StuffLayout.LAYOUT_HEAD_VERTICAL;
        }
    },
    dispose: function () {
        this._disposed = true;
        this._owner=null;
    }
});
BaseStuff.Layout = StuffLayout;
module.exports = BaseStuff;