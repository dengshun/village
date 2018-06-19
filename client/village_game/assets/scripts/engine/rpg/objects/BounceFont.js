 const GameObject=require("GameObject");
 const BOUNCE_TIME=0.8;
 const Utils=require("Utils");
 const RpgScene=require("RpgScene");
 cc.Class({
    extends:GameObject,
    properties:{
        _label:{
            type:cc.Label,
            serializable: false,
            default:null,
        },
        _text:{
            serializable: false,
            default:"0",
        },
        text:{
            get:function(){
                return this._text;
            },
            set:function(value){
                this._text=value;
                if(this._label){
                    this._label.string=this._text;
                }
            }
        },
        _timePassed:{
            serializable: false,
            default:0,
        },
        _startPos:{
            serializable: false,
            default:cc.v2(0,0),
        },
        _dx:{
            serializable: false,
            default:0,
        },
        _dy:{
            serializable: false,
            default:0,
        },
        _veloX:{
            serializable: false,
            default:0,
        },
        _veloY:{
            serializable: false,
            default:0,
        },
        fadeOut:{
            serializable: false,
            default:false,
            visible:false,
        },
        scene:{
            serializable: false,
            default:null,
            type:RpgScene,
            visible:false,
        }
    },
    onLoad:function(){
        this._super();
        this._bodyNode=this.node;
        this._label=this._bodyNode.getComponent(cc.Label);
        this._label.string=this._text;
    },
    renew: function (...args) {
        if(this._disposed){
            this._super();
            this._label.string="";
        }
    },
    startBouncing:function(toX,toY){
        this._timePassed=0;
        this._startPos=this.pos;
        this._dx=toX-this._posX;
        this._dy=toY-this._posY;
        this._veloX=this._dx/(BOUNCE_TIME*1000);
        this._veloY=this._dy/(BOUNCE_TIME*1000);
    },
    _renderHandler: function (dt) {
        this._timePassed+=dt;
        if(this._timePassed>BOUNCE_TIME){
            if(this.node.opacity<=0||this.fadeOut==false){
                if(this.scene){
                    this.scene.removeObject(this);
                }
            }else{
                this.node.opacity-=12;
            }
        }
        if(this.node.opacity==255){
            let ratio=Utils.easeOut(this._timePassed,0,1,BOUNCE_TIME);
            this.setPos(this._startPos.x+this._dx*ratio,this._startPos.y+this._dy*ratio);
        }else{
            this.setPos(this._posX+dt*1000*this._veloX,this._posY+dt*1000*this._veloY);
        }
        this._super();
    },
    dispose: function () {
        this._super();
        this.fadeOut=false;
        this.scene=null;
    }

 });
