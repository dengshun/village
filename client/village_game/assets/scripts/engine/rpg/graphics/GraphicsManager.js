const RpgGlobal = require("RpgGlobal");
const SceneConst = require("SceneConst");
let GraphicsManager = cc.Class({
    statics: {
        _instance: null,
        getInstance: function() {
            if (this._instance == null) {
                this._instance = new GraphicsManager();
            }
            return this._instance;
        }
    },
    properties: {
        _loadQueue: null,
        _dataDict: null,
        _sheetDict: null,
        _currentLoading: null,
    },
    ctor: function() {
        this._loadQueue = [];
        this._dataDict = {};
        this._sheetDict = {};
    },
    load: function(graphicsName) {
        if (!this.hasGraphics(graphicsName)) {
            if (this._loadQueue.indexOf(graphicsName) == -1) {
                this._loadQueue.push(graphicsName);
            }
            if (!this._currentLoading && this._loadQueue.length > 0) {
                this._loadNext();
            }
        } else {}
    },
    _loadNext: function() {
        let self = this;
        this._currentLoading = this._loadQueue.shift();
        if (this._currentLoading) {
            this._loadData();
        }
    },
    _loadData: function() {
        let self = this;
        let type = this._currentLoading.split("_")[0];
        let pathPrefix = RpgGlobal.avatarPath;
        if (type == SceneConst.EFFECT_TYPE) {
            pathPrefix = RpgGlobal.effectPath;
        }
        let dataPath = `${pathPrefix}/frames/data/${this._currentLoading}`;
        var pHandler = function(completedCount, totalCount, item) {}
        var cHandler = function(error, resource) {
            if (!error) {
                self._dataDict[self._currentLoading] = cc.loader.getRes(dataPath);
                self._loadSpriteAlats();
            } else {
                self._loadNext();
            }
        }
        cc.loader.loadRes(dataPath, pHandler, cHandler);
    },
    _loadSpriteAlats: function() {
        let self = this;
        let type = this._currentLoading.split("_")[0];
        let pathPrefix = RpgGlobal.avatarPath;
        if (type == SceneConst.EFFECT_TYPE) {
            pathPrefix = RpgGlobal.effectPath;
        }
        let texPath = `${pathPrefix}/frames/texture/${this._currentLoading}`;
        var pHandler = function(completedCount, totalCount, item) {}
        var cHandler = function(error, resource) {
            if (!error) {
                self._sheetDict[self._currentLoading] = cc.loader.getRes(texPath, cc.SpriteAtlas);
            }
            self._currentLoading = null;
            self._loadNext();
        }
        cc.loader.loadRes(texPath, cc.SpriteAtlas, pHandler, cHandler);
    },
    hasGraphics: function(graphicsName) {
        return this._dataDict[graphicsName] !== undefined;
    },
    getData: function(graphicsName) {
        let data = this._dataDict[graphicsName];
        if (data) {
            return data.avatar;
        }
        return null;
    },
    getSpriteAtlas: function(graphicsName) {
        return this._sheetDict[graphicsName];
    }
});