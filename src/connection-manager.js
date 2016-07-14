const fs = require('fs');
const peacherine = require('peacherine');

module.exports = (() => {
  const configFileName = '.peachy';
  const fullConfigPath = `${getHomeDirectory()}/${configFileName}`;
  const baseConfigFilePath = `${__dirname}/config.sample.json`;
  
  function getHomeDirectory() {
    if (process.platform === 'win32') {
      return process.env.USERPROFILE;
    }
    else {
      return process.env.HOME;
    }
  }

  function configFileExists(callback) {
    fs.access(fullConfigPath, (err) => {
      if (err) {
        callback(false);
      }
      else {
        callback(true);
      }
    });
  }
  
  function copyBaseConfigIfNotExists(callback) {
    configFileExists((exists) => {
      if (!exists) {
        const reader = fs.createReadStream(baseConfigFilePath);
        const writer = fs.createWriteStream(fullConfigPath);

        reader.on('error', callback);
        writer
          .on('error', callback)
          .on('close', callback);

        reader.pipe(writer);
      }
      else {
        callback();
      }
    });
  }

  function getConnection(name, callback) {
    getAllConnections((err, connections) => {
      if (err) {
        callback(err);
      }
      else {
        if (connections && connections.length > 0) {
          callback(null, connections.filter(
            (connection) => connection.name === name)[0]);
        }
        else {
          callback();
        }
      }
    });
  }

  function getAllConnections(callback) {
    copyBaseConfigIfNotExists((err) => {
      if (err) {
        callback(err);
      }
      else {
        fs.readFile(fullConfigPath, (err, data) => {
          if (err) {
            callback(err);
          }
          else {
            try {
              const dataObj = JSON.parse(data);

              if (dataObj.connections) {
                callback(null, dataObj.connections);
              }
              else {
                callback();
              }
            }
            catch (ex) {
              callback(ex);
            }
          }
        });
      }
    });
  }
  
  return {
    getConnection,
    getAllConnections,
    getDataSourceTypes: peacherine.getDataSourceTypes
  };
})();