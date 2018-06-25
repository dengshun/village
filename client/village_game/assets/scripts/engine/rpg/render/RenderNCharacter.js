const Render = require("Render");
const RpgGlobal = require("RpgGlobal");
let RenderNCharacter = cc.Class({
    name: "RenderNCharacter",
    extends: Render,
    render: function(dt, target) {
        let p = RpgGlobal.scene.map.getScreenPosition(target.posX, target.posY);
        target.node.setPosition(p.x, p.y);
        target.graphicsRes.render(dt, [target.bodyNode]);
    },
});
module.exports = RenderNCharacter;