//显示控制器升级进度
_.values(Game.rooms).filter(r=>r.controller.level).forEach(r=>{let p=r.controller.progress,n=r.name;require("Update").add(()=>{let r=Game.rooms[n];r.controller.room.visual.text("+"+(r.controller.progress*100/r.controller.progressTotal-p).toFixed(5)+"%",r.controller.pos.x,r.controller.pos.y-1);r.controller.room.visual.text((p=r.controller.progress*100/r.controller.progressTotal).toFixed(5)+"%",r.controller.pos.x,r.controller.pos.y-1.75)})});
//自动探房
require("Events").on("MyRoomUpdate",r=>r.controller.level>2&&require("Rooms").findNear(r.name))