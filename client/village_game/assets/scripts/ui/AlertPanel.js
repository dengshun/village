var PanelBase = require("PanelBase");
cc.Class({
    extends: PanelBase,
    properties: {
        _bg: cc.Node,
        _title: cc.Label,
        _content: cc.RichText,
        _okBtn: cc.Node,
        _okLabel: cc.Label,
        _cancelBtn: cc.Node,
        _cancelLabel: cc.Label,
        _callBack: null,
    },
    onLoad: function () {
        this._super();
        this._bg = cc.find("bg", this.node);
        this._title = cc.find("title", this.node).getComponent(cc.Label);
        this._content = cc.find("content", this.node).getComponent(cc.RichText);
        this._okBtn = cc.find("okBtn", this.node);
        this._cancelBtn = cc.find("cancelBtn", this.node);
        this._okLabel = cc.find("label", this._okBtn).getComponent(cc.Label);
        this._cancelLabel = cc.find("label", this._cancelBtn).getComponent(cc.Label);
        this._okBtn.on(cc.Node.EventType.TOUCH_END, this._touchHandler, this);
        this._cancelBtn.on(cc.Node.EventType.TOUCH_END, this._touchHandler, this);
    },
    updateView: function (title, content, callBack, flags, okLabel, cancelLabel) {
        this._callBack = callBack;
        this._title.string = title;
        this._content.string = content;
        this._okLabel.string = okLabel;
        this._cancelLabel.string = cancelLabel;
        this._okBtn.active = (flags & 1) == 1;
        this._cancelBtn.active = ((flags >> 1) & 1) == 1;
        if (this._cancelBtn.active == false || this._okBtn.active == false) {
            this._okBtn.x = 0;
            this._cancelBtn.x = 0;
        } else {
            this._okBtn.x = -130;
            this._cancelBtn.x = 130;
        }
        this.scheduleOnce(function(){
            this._validateSize();
        })
    },
    _validateSize:function(){
        this._bg.height = Math.max(this._content.node.height, 100) + 200;
        this._title.node.y = this._bg.height / 2 - 46;
        this._content.node.y=-((this._bg.height-80-this._okBtn.height-20)-this._content.node.height)/2+this._bg.height / 2-80;
        if(this._content.node.width<500){
            this._content.node.x=(this._content.node.width-500)/2;
        }else{
            this._content.node.x=0;
        }
        this._cancelBtn.y = this._okBtn.y = -this._bg.height / 2 + 20 + this._okBtn.height / 2;
    },
    onOpen: function (data) {

    },
    _touchHandler: function (evt) {
        var SimpleGameAlert = require("SimpleGameAlert");
        var target = evt.target;
        if (this._callBack) {
            if (target == this._okBtn) {
                this._callBack(SimpleGameAlert.OK);
            } else {
                this._callBack(SimpleGameAlert.CANCEL);
            }
        }
        SimpleGameAlert.hide();
    }
});
