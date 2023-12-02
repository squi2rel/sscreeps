require("FlagSuicide");

var roleSupport = {
    name: "support",
    /** @param {Creep} creep **/
    run: function(creep) {
        let flag = Game.flags["support"];
        if (flag) {
            if (creep.room != flag.room) {
                creep.moveTo(flag)
            } else {
                creep.memory.suicide = true
            }
        }
	}
};

module.exports = roleSupport