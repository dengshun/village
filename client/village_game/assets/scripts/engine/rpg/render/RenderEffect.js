const Render = require("Render");
const RpgGlobal = require("RpgGlobal");
const SpineGraphicsBase = require("SpineGraphicsBase");
let RenderNCharacter = cc.Class({
    name: "RenderEffect",
    extends: Render,
    render: function(dt, target) {
        let p = RpgGlobal.scene.map.getScreenPosition(target.posX, target.posY);
        target.node.setPosition(p.x, p.y);
        if (target.graphicsRes && (!(target.graphicsRes instanceof SpineGraphicsBase))) {
            target.graphicsRes.render(dt, [target.bodyNode]);
        }
    },
});
module.exports = RenderNCharacter;