const RpgGlobal = require("RpgGlobal");
let SpGraphicsManager = cc.Class({
    statics: {
        _instance: null,
        getInstance: function() {
            if (this._instance == null) {
                this._instance = new SpGraphicsManager();
            }
            return this._instance;
        }
    },
    properties: {
        _loadQueue: null,
        _spDict: null,
        _currentLoading: null,
    },
    ctor: function() {
        this._loadQueue = [];
        this._spDict = {};
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
            this._loadSPData();
        }
    },
    _loadSPData: function() {
        let self = this;
        let pathPrefix = RpgGlobal.avatarPath;
        let path = `${pathPrefix}/sp/${this._currentLoading}`;
        let pHandler = function(completedCount, totalCount, item) {}
        let cHandler = function(error, resource) {
            if (!error) {
                self._spDict[self._currentLoading] = cc.loader.getRes(path, sp.SkeletonData);
            }
            self._loadNext();
        }
        cc.loader.loadRes(path, sp.SkeletonData, pHandler, cHandler);
    },
    hasGraphics: function(graphicsName) {
        return this._spDict[graphicsName] !== undefined;
    },
    getGraphicsData: function(graphicsName) {
        let data = this._spDict[graphicsName];
        if (data) {
            return data;
        }
        return null;
    },
});