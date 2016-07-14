const program = require('commander');
const package = require('../package');
const connectionManager = require('./connection-manager');
const chalk = require('chalk');
const peacherine = require('peacherine');

program
  .version(package.version)
  .option('-s, --datasources', 'list available data source types')
  .option('-l, --list', 'list available connections in config (~/.peachy)')
  .option('-t, --test', 'test connection')
  .option('-c, --connection <connection-name>', 'connection name (from ~/.peachy)')
  .option('-o, --collection <collection-name>', 'collection to perform the action on')
  .option('-f, --filter <filter-json>', 'filter for searching and updating documents')
  .option('-u, --update <update-json>', 'document update options')
  .option('-a, --action <action-name>', 'action to take on data source')
  .option('-d, --document <document-json>', 'the document to insert, update, or delete from a collection')
  .option('-q, --query <query>', 'query text applicable for certain data sources')
  .on('--help', () => {
    console.log('  Actions:');
    console.log('');
    console.log('    queryCollection (mongodb, documentdb)');
    console.log('      (all)        --collection  target collection');
    console.log('      (documentdb) --query       query to run');
    console.log('      (mongodb)    --filter      filter to search (optional)');
    console.log('    createDocument (mongodb, documentdb)');
    console.log('      (all)        --collection  target collection');
    console.log('      (all)        --document    document to insert');
    console.log('    updateDocuments (mongodb)');
    console.log('      (mongodb)    --collection  target collection');
    console.log('      (mongodb)    --filter      filter to update (optional)');
    console.log('      (mongodb)    --update      update options to apply to doc');
    console.log('    deleteDocuments (mongodb)');
    console.log('      (mongodb)    --collection  target collection');
    console.log('      (mongodb)    --filter      filter to delete (optional)');
    console.log('');
    console.log('    Note: RDMBSes take the query param text to run');
  })
  .parse(process.argv);

const displayInformation = 
  (message) => { console.log(chalk.green(message)); };
const displayWarning = 
  (message) => { console.log(chalk.yellow(message)); };
const displayError = 
  (message) => { console.log(chalk.bold.red(message)); };
const displayResult = 
  (result) => { console.log(JSON.stringify(result, null, '  ')); }

function handleConnection(connection) {
  const action = {};
  switch (connection.dataSourceType) {
    case 'mssql':
      if (!program.query) {
        displayError('query must be specified');
        process.exit(1);
      }
      action.query = program.query;
      break;
    case 'documentdb':
      if (program.query) {
        if (!program.collection) {
          displayError('you must specify a collection to query');
          process.exit(1);
        }

        action.query = program.query;
        action.collection = program.collection;
        action.operation = 'queryCollection';
      }
      else if (program.action) {
        // the user has specified a particular action so we need 
        // to take the appropriate response to carry out their wish
        switch (program.action) {
          case 'queryCollection':
            if (!program.collection || !program.query) {
              displayError('you must specify the collection and query');
              process.exit(1);
            }

            action.operation = program.action;
            action.collection = program.collection;
            action.query = program.query;
            break;
          case 'createDocument':
            if (!program.collection || !program.document) {
              displayError('you must specify the collection and the document to insert');
              process.exit(1);
            }

            action.operation = program.action;
            action.collection = program.collection;
            try {
              action.document = JSON.parse(program.document);
            }
            catch (ex) {
              displayError(ex.message);
              process.exit(1);
            }
            break;
          default:
            displayError(`unknown action ${program.action} for ${connection.dataSourceType}`);
            process.exit(1);
            break;
        }
      }
      break;
    case 'mongodb':
      displayWarning('mongodb not implemented yet');
      break;
    case 'mssql':
      displayWarning('mssql not implemented yet');
      break;
    default:
      displayError(`unknown data source type: ${connection.dataSourceType}`);
      process.exit(1);
      break;
  }

  // if we get to this point then all is well and we are ready to 
  // run the action with the given connection
  peacherine.run(connection, action, (err, result) => {
    if (err) {
      displayError(err.message);
      process.exit(1);
    }
    else {
      displayResult(result);
      process.exit(0);
    }
  });
}

function testConnection(connection) {
  peacherine.testConnection(connection, (err) => {
    if (err) {
      displayWarning(`failed connection to ${connection.name}`);
      process.exit(1);
    }
    else {
      displayInformation(`connection successful to ${connection.name}`);
      process.exit(0);
    }
  });
}

// user wants to list out available data sources
if (program.datasources) {
  const dataSourceTypes = connectionManager.getDataSourceTypes();

  for (let i = 0; i < dataSourceTypes.length; i++) {
    displayInformation(dataSourceTypes[i]);
  }
}
else if (program.list) {
  connectionManager.getAllConnections((err, connections) => {
    if (err) {
      displayError(err);
      process.exit(1);
    }
    else {
      const connectionsForDisplay = connections.map(
        (connection) => {
          return { 
            name: connection.name, 
            dataSourceType: connection.dataSourceType}; });

      displayResult(connectionsForDisplay);
      process.exit(0);
    }
  });
}
// user wants to interact with a particular connection 
// we need to first make sure that an actual connection 
// name was specified
else {
  // if the user didn't specify a connection name then 
  // there is nothing we can do here
  if (!program.connection) {
    displayError('you must specify a connection name');
  }
  else {
    connectionManager.getConnection(program.connection, (err, connection) => {
      // error retrieving the connection! this is most likely 
      // a file issue. this will *not* be thrown if the connection 
      // is not found
      if (err) {
        displayError(err.message);
      }
      else {
        // connection does not exist in the config file
        if (!connection) {
          displayWarning(`Connection '${program.connection}' not found`);
          displayInformation('Modify ~/.peachy to specify connections');
        }
        // connection exists and was found/retrieved
        else {
          // user wants to do a connection test on the connection
          if (program.test) {
            testConnection(connection);
          }
          // user wants to do an actual querying operation so pass 
          // the connection off to do the custom handling
          else {
            handleConnection(connection);
          }
        }
      }
    });
  }
}