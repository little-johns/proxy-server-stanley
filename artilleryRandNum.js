function makeNumbers () {
  if (Math.random() >= 0.5 ) {
    return Math.random() * 1000000;
  } else {
    return Math.random() * 10000000;
  }
}

module.exports = {makeNumbers: makeNumbers}