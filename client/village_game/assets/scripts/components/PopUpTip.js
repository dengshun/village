let TipItem = cc.Class({
    extends: cc.Node,
    name: "TipItem",
    properties: {
        _text: "",
        _textLab: cc.RichText,
    },
    ctor: function () {
    },
    onload: function () {
    },
    setText: function (text) {
        this._text = text;
        if (this._textLab == null) {
            this._textLab = this.addComponent(cc.RichText);
        }
        this._textLab.string = text;
    },
    reset: function () {
        this.opacity = 255;
    }
});
let PopUpTip = cc.Class({
    name: "PopUpTip",
    statics: {
        _instance: null,
        getInstance: function () {
            if (this._instance == null) {
                this._instance = new PopUpTip();
            }
            return this._instance;
        }
    },
    properties: {
        _itemPool: {
            type: [TipItem],
            default: [],
        },
        tipContainer: {
            visible: false,
            get: function () {
                return this._gameRoot;
            }
        },
        _gameRoot: cc.Node,
    },
    ctor: function () {
        PopUpTip._instance = this;
    },
    init: function (gameRoot) {
        this._gameRoot = gameRoot;
    },
    show2: function (text, target) {
        let pos = target.getPosition();
        let worldPos = target.convertToWorldSpaceAR(cc.p(0, 0));
        let localPos = this.tipContainer.convertToNodeSpaceAR(worldPos);
        this.show(text, localPos.x, localPos.y);
    },
    show: function (text, x, y) {
        let tipItem = this._itemPool.pop();
        if (!tipItem) {
            tipItem = new TipItem();
        } else {
            tipItem.reset();
            cc.log("from cache.......");
        }
        tipItem.setText(text);
        this._gameRoot.addChild(tipItem, cc.hj.GameConfig.LayerZOrder.LAYER_ZORDER_TIP);
        tipItem.setPosition(cc.p(x, y));
        let action = cc.sequence(cc.spawn(cc.fadeOut(1), cc.moveTo(0.5, cc.p(x, y + 30))), cc.callFunc(function () {
            this._gameRoot.removeChild(tipItem);
            this._itemPool.push(tipItem);
        }, this));
        tipItem.runAction(action);
    },
});
module.exports = PopUpTip;