const tasks = {};

function addTask(type, amount, todo) {
    let task = {
        type,
        amount,
        todo
    };
    if (!tasks[role]) tasks[role] = [];
    tasks[role].push(task)
}

function acceptTask(task) {
    tasks[task.type].accepted = true
}

module.exports = {

};