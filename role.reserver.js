var roleReserver = {
    name: "reserver",
    /** @param {Creep} creep **/
    run: function(creep) {
        let flag = Game.flags["reserve"];
        if (flag) {
            creep.moveTo(flag);
            if (flag.room) {
                if (Game.flags["claim"]) {
                    creep.claimController(flag.room.controller)
                } else {
                    creep.reserveController(flag.room.controller)
                }
            }
        }
	}
};

module.exports = roleReserver