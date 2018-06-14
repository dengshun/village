let PanelManager = cc.Class({
    name: "PanelManager",
    statics: {
        _instance: null,
        getInstance: function () {
            if (this._instance == null) {
                this._instance = new PanelManager();
            }
            return this._instance;
        }
    },
    properties: {
        _panelsDict: null,
        _panelsOpened: null,
        _moduleLayer: null,
        _modalMask: null,
        _closeQueue: null,
        _currentClose: null,
    },

    init: function (moduleLayer) {
        this._closeQueue = [];
        this._moduleLayer = moduleLayer;
        this._panelsDict = {};
        this._panelsOpened = [];
        this._modalMask = cc.find("modalMask", this._moduleLayer);
    },
    _manageModalMask: function () {
        let modal = false;
        let maxModalIndex = -1;
        let openedLen = this._panelsOpened.length;
        for (let i = openedLen - 1; i >= 0; i--) {
            let panel = this._panelsOpened[i];
            panel.setLocalZOrder(0);
            if (maxModalIndex == -1 && panel.getComponent("PanelBase").modal) {
                modal = true;
                maxModalIndex = i;
            }
        }
        if (modal) {
            this._modalMask.setLocalZOrder(maxModalIndex);
            for (let j = maxModalIndex; j < openedLen; j++) {
                let panel = this._panelsOpened[j];
                panel.setLocalZOrder(j + 1);
            }
        } else {
            this._modalMask.setLocalZOrder(0);
        }
        this._moduleLayer.active = this._panelsOpened.length > 0;
        this._modalMask.active = modal;
    },
    registe: function (id, panel) {
        this._panelsDict[id] = panel;
    },
    unregiste: function (id) {
        delete this._panelsDict[id];
    },
    getPanel: function (id) {
        return this._panelsDict[id];
    },
    openPanel: function (id, data, tween) {
        let panel = this.getPanel(id);
        if (panel) {
            if (!this._moduleLayer.active) {
                this._moduleLayer.active = true;
            }
            if (panel.parent == null) {
                if (panel.active == false) {
                    panel.active = true;
                }
                let panelBase = panel.getComponent("PanelBase");
                let loaded = panelBase.loaded;
                panel.x=0;
                panel.y=0;
                this._moduleLayer.addChild(panel);
                let index = this._panelsOpened.indexOf(panel);
                if (index < 0) {
                    this._panelsOpened.push(panel);
                }
                this._manageModalMask();
                panelBase.onOpen(data);
                tween = tween != undefined ? tween : true;
                if (tween) {
                    panel.scale = 0.001;
                    let scaleTo = cc.scaleTo(0.2, 1, 1);
                    let action;
                    if(!loaded){
                        let delay=cc.delayTime(0.1);
                        action=cc.sequence(delay,scaleTo);
                    }else{
                        action=scaleTo
                    }
                    panel.runAction(action);
                    
                }
            }
        } else {
            cc.log("no panel.....:" + id);
        }
    },
    closePanel: function (id, tween) {
        tween = tween != undefined ? tween : true;
        this._closeQueue.push({ id: id, tween: tween });
        if(!this._currentClose){
            this._excuteClose();
        }
    },
    _excuteClose: function () {
        this._currentClose = this._closeQueue.shift();
        if (this._currentClose) {
            let panel = this.getPanel(this._currentClose.id);
            let self = this;
            let endHandler = function () {
                panel.parent.removeChild(panel, false);
                panel.getComponent("PanelBase").onClose();
                panel.scale = 1;
                let index = self._panelsOpened.indexOf(panel);
                if (index >= 0) {
                    self._panelsOpened.splice(index, 1);
                }
                self._manageModalMask();
                self._currentClose=null;
                self._excuteClose();
            }
            if (panel && panel.parent) {
                if (this._currentClose.tween) {
                    let scaleTo = cc.scaleTo(0.1, 0.3, 0.3);
                    let callFunc = cc.callFunc(endHandler, this);
                    let action = cc.sequence(scaleTo, callFunc);
                    panel.runAction(action);
                } else {
                    endHandler();
                }
            }else{
                this._currentClose=null;
                this._excuteClose();
            }
        }
    },
    closeAllPanel: function () {
        for (let i = 0; i < this._panelsOpened.length; i++) {
            let panel = this._panelsOpened[i];
            if (panel.parent) {
                panel.parent.removeChild(panel, false);
            }
            panel.getComponent("PanelBase").onClose();
        }
        this._panelsOpened.splice(0, this._panelsOpened.length);
        this._manageModalMask();
    }
});
module.exports = PanelManager;