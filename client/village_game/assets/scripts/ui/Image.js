let Image = cc.Class({
    extends: cc.Component,
    statics: {
        _waitingQueues: null,
        _currentLoading: null,
        _loadNext: function () {
            let self=this;
            this._currentLoading = this._waitingQueues.shift();
            if (this._currentLoading) {
                let resource = null;
                if (String(this._currentLoading.url).lastIndexOf(".jpg") >= 0 || String(this._currentLoading.url).lastIndexOf(".png") >= 0) {
                    resource = this._currentLoading.url;
                } else {
                    resource = { url: this._currentLoading.url, type: "png" }
                }
                cc.loader.load(resource, function (err, texture) {
                    self._currentLoading.completeHandler.call(self._currentLoading.target,err,texture);
                    self._currentLoading=null;
                    self._loadNext();
                });
            }
        },
    },
    properties: {
        _source: "",
        source: {
            set: function (value) {
                if (this._source != value) {
                    this._source = value;
                    if (Image._waitingQueues == null) {
                        Image._waitingQueues = [];
                    }
                    Image._waitingQueues.push({ url: this._source, completeHandler: this._loadComplete, target: this });
                    if(!Image._currentLoading){
                        Image._loadNext();
                    }
                }
            },
            get: function () {
                return this._source;
            },
            visible: false
        },
        _img: null,
    },
    onLoad: function () {
        this._img = this.node.getComponent(cc.Sprite);
    },
    _loadComplete: function (err, texture) {
        if (err) {
            cc.log("image err:"+err);
            this.node.emit("loadError");
            this._img.spriteFrame = null;
        } else {
            this._img.spriteFrame = new cc.SpriteFrame(texture);
        }
    },
})