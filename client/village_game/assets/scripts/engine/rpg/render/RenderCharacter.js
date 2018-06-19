const Render = require("Render");
const RpgGlobal = require("RpgGlobal");
let RenderCharacter=cc.Class({
    name:"RenderCharacter",
    extends: Render,
    render: function (target) {
        let p=RpgGlobal.scene.map.getScreenPosition(target.posX,target.posY);
        target.node.setPosition(p.x>>0,p.y>>0);
        if(target.bodyNode){
            this._draw(target, target.directionNum, target.currentFrame);
        }
    },
    _draw: function (target, directionNum, frame) {
        target.graphicsRes.renderBody(target.bodyNode, directionNum, frame);
        target.graphicsRes.renderWeapon(target.weaponNode,directionNum,frame);
    }
});
module.exports=RenderCharacter;