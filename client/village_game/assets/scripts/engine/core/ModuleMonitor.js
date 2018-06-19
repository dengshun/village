let ModuleMonitor = cc.Class({
    name:"ModuleMonitor",
    statics: {
        _instance: null,
        getInstance: function () {
            if (this._instance == null) {
                this._instance = new ModuleMonitor();
            }
            return this._instance;
        }
    },
    properties: {
        _hash: null,
        hash:{
            visible:false,
            get:function(){
                return this._hash;
            }
        }
    },
    ctor:function(){
        this._hash = [];
    },
    setUp: function () {
    },
    takeModule: function (moduleId) {
        let len = this._hash.length;
        for (let i = 0; i < len; i++) {
            let module = this._hash[i];
            if (module.moduleId == moduleId) {
                return module;
            }
        }
        return null;
    },
    removeModule: function (moduleId) {
        let len = this._hash.length;
        for (let i = 0; i < len; i++) {
            let module = this._hash[i];
            if (module.moduleId == moduleId) {
                this._hash.splice(i,1);
                break;
            }
        }
    },
    addModule: function (module) {
        if (module && this.takeModule(module.moduleId) == null) {
            this._hash.push(module);
        }
        cc.log("add module=========:"+module.moduleId);
    }
});
module.exports = ModuleMonitor;
