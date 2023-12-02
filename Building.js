function amount(creep, build, type, max = Infinity) {
    return Math.min(creep.store.getFreeCapacity(type), build.store[type], max)
}

function amountDrop(creep, build, type, max = Infinity) {
    return Math.min((creep.store[type] || 0), build.store.getFreeCapacity(type), max)
}

function withdrawKeep(creep, build, type, min) {
    let amount = Math.min(build.store[type] - min, creep.store.getFreeCapacity(type));
    return amount > 0 ? creep.withdraw(build, type, amount) : ERR_NOT_ENOUGH_RESOURCES
}

function withdraw(creep, build, type, max) {
    if (!type) type = _.keys(build.store)[0];
    return creep.withdraw(build, type, amount(creep, build, type, max))
}

function withdrawExcept(creep, build, type, max) {
    type = _.keys(build.store).find(s => s != type);
    if (!type) return ERR_NOT_ENOUGH_RESOURCES;
    return creep.withdraw(build, type, amount(creep, build, type, max))
}

function transfer(creep, build, type, max) {
    if (!type) type = _.keys(creep.store)[0];
    return creep.transfer(build, type, amountDrop(creep, build, type, max))
}

function hasItem(build, type, amount) {
    return build.store && (type ? (build.store[type] || 0) > (amount || 0) : build.store.getUsedCapacity() > (amount || 0))
}

function hasItemExcept(build, type) {
    return (build.store[type] || 0) < build.store.getUsedCapacity()
}

function usedPercent(build, type) {
    return (build.store[type] || 0) / build.store.getCapacity(type)
}

module.exports = {
    amount,
    amountDrop,
    withdraw,
    withdrawKeep,
    withdrawExcept,
    withdrawWithout: withdrawExcept,
    transfer,
    hasItem,
    hasItemExcept,
    usedPercent
}