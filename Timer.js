const Events = require("Events");
const Update = require("Update");

const times = [1, 2, 5, 10, 20, 50, 100];

Update.add(() => {
    for (let i = 0; i < times.length; i++) {
        let time = times[i];
        if (!(Game.time % time)) Events.fire(time + "t")
    }
})