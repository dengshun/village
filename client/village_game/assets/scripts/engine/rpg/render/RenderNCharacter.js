const Render = require("Render");
const RpgGlobal = require("RpgGlobal");
const FrameGraphicsBase = require("FrameGraphicsBase");
let RenderNCharacter = cc.Class({
    name: "RenderNCharacter",
    extends: Render,
    render: function(dt, target) {
        let p = RpgGlobal.scene.map.getScreenPosition(target.posX, target.posY);
        target.node.setPosition(p.x >> 0, p.y >> 0);
        if (target.graphicsRes instanceof FrameGraphicsBase) {
            target.graphicsRes.render(dt, [target.bodyNode]);
        }
    },
});
module.exports = RenderNCharacter;