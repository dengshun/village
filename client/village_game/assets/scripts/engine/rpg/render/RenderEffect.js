const Render = require("Render");
const RpgGlobal = require("RpgGlobal");
let RenderNCharacter=cc.Class({
    name:"RenderEffect",
    extends: Render,
    render: function (target) {
        let p=RpgGlobal.scene.map.getScreenPosition(target.posX,target.posY);
        target.node.setPosition(p.x,p.y);
        if(target.graphicsRes){
            this._draw(target, target.directionNum, target.currentFrame);
        }
    },
    _draw: function (target, directionNum, frame) {
        target.graphicsRes.renderBody(target.bodyNode, directionNum, frame);
    }
});
module.exports=RenderNCharacter;
