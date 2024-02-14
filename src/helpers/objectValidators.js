function removeUndefinedKeys(obj) {
    for (const key in obj) {
      if (obj[key] === undefined || obj[key] === null) {
        delete obj[key];
      }
    }
    return obj;
}

module.exports = { removeUndefinedKeys }