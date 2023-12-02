const Finder = require("Finder");
const Building = require("Building");
const Pos = require("Pos");
const Settings = require("Settings");

const roleLab = {
    name: "lab",
    /** @param {Creep} creep **/
    run: function(creep) {
        Finder.findEnergy(creep, false, 20000, null, false, true, true)
	}
};

module.exports = roleLab