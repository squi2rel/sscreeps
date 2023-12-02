/*
Init -> main
ClearCreep: Memory -> main
CreepUpdate: Creep -> main
RoomUpdate: Room -> main
{n}t -> Timer
*/

const strict = false;

var events = {};
var removed = {};
module.exports = {
    on: (n, l) => {
        if (!events[n]) events[n] = [];
        events[n].push(l)
    },
    once: (n, l) => {
        if (!events[n]) events[n] = [];
        events[n].push(function that(...args) {
            if (!removed[n]) removed[n] = [];
            removed[n].push(that);
            l(...args)
        })
    },
    fire: (n, ...args) => {
        if (strict) {
            events[n] && events[n].forEach(e => e(...args))
        } else {
            events[n] && events[n].forEach(e => {
                try {
                    e(...args)
                } catch (er) {
                    let msg = "Error on event " + n + ": " + er.stack;
                    Game.notify(msg);
                    console.log(msg)
                }
            })
        }
        if (removed[n]) _.pull(events[n], ...removed[n]);
        delete removed[n]
    }
}