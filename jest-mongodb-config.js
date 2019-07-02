module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: "bbtapp" // change to database that you want to test, same as the one in index.js
    },
    binary: {
      version: "3.6.10",
      skipMD5: true
    },
    autoStart: false
  }
};
