const program = require('commander');
const package = require('../package');
const connectionManager = require('./connection-manager');
const chalk = require('chalk');

program
  .version(package.version)
  .option('-l, --list', 'list available data sources')
  .parse(process.argv);

const displayInformation = 
  (message) => { console.log(chalk.green(message)); };
const displayWarning = 
  (message) => { console.log(chalk.yellow(message)); };
const displayError = 
  (message) => { console.log(chalk.bold.red(message)); };

if (program.list) {
  const dataSourceTypes = connectionManager.getDataSourceTypes();

  for (let i = 0; i < dataSourceTypes.length; i++) {
    displayInformation(dataSourceTypes[i]);
  }
}
else {
  connectionManager.getConnection('mssql-test', (err, connection) => {
    if (err) {
      displayError(err.message);
    }
    else {
      if (!connection) {
        displayWarning('Connection not found');
        displayInformation('Modify ~/.peachy to specify connections');
      }
    }
  });
}