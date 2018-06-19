cc.Class({
    extends: cc.Component,
    properties: {
        id:"",
        _modal:true,
        _loaded:false,
        loaded:{
            get:function(){
                return this._loaded;
            }
        },
        modal:{
            get:function(){
                return this._modal;
            },
            set:function(value){
                this._modal=value;
            }
        }
    },
    onLoad: function () {
        this._loaded=true;
    },
    registerLayout:function(id){
        this.id=id;
        cc.hj.panelMgr.registe(id,this.node);
    },
    onClose:function(){

    },
    onOpen:function(data){

    }
});
