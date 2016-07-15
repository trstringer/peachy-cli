# Peachy :peach:

*The cross-platform and cross-data-source query CLI*

### Currently supported data sources

 - [MySQL](#mysql-sql-server-and-sql-azure)
 - [MongoDB](#mongodb)
 - [SQL Server](#mysql-sql-server-and-sql-azure)
 - [SQL Azure](#mysql-sql-server-and-sql-azure)
 - [DocumentDB](#documentdb)

## Future development

The idea behind this tool is to add all of the main and popular data sources.  This CLI is basically just an interactive shim over the [peacherine module](https://github.com/tstringer/peacherine).  For instance, development work will start in order to add Postgres as an available data source to query

## Installation

```
$ npm install -g peachy
```

## Usage

```
$ peachy -h
```

Output:

```
  Usage: peachy [options]

  Options:

    -h, --help                          output usage information
    -V, --version                       output the version number
    -s, --datasources                   list available data source types
    -l, --list                          list available connections in config (~/.peachy)
    -t, --test                          test connection
    -c, --connection <connection-name>  connection name (from ~/.peachy)
    -i, --collection <collection-name>  collection to perform the action on
    -f, --filter <filter-json>          filter for searching and updating documents
    -u, --update <update-json>          document update options
    -o, --operation <operation-name>    action to take on data source
    -d, --document <document-json>      the document to insert, update, or delete from a collection
    -q, --query <query>                 query text applicable for certain data sources

  Operations:

    queryCollection (mongodb, documentdb)
      (all)        --collection  target collection
      (documentdb) --query       query to run
      (mongodb)    --filter      filter to search (optional)
    createDocument (mongodb, documentdb)
      (all)        --collection  target collection
      (all)        --document    document to insert
    updateDocuments (mongodb)
      (mongodb)    --collection  target collection
      (mongodb)    --filter      filter to update (optional)
      (mongodb)    --update      update options to apply to doc
    deleteDocuments (mongodb)
      (mongodb)    --collection  target collection
      (mongodb)    --filter      filter to delete (optional)

    Note: RDMBSes take the query param text to run

    Config file setup: running any command will create the 
      base config file. I.e. run "peachy -l" which will list 
      all of the connections in configuration, and if the config 
      file does not exist it will create it at ~/.peachy
```

## Examples

### List all available connections (or create a new config file in ~/.peachy)

```
$peachy -l
```

> :bulb: If there is not ~/.peachy configuration file then running this will create a base file.  This is the recommended workflow so you don't have to manually create the JSON file, and you can just modify it manually after-the-fact

### List available data sources

```
$ peachy -s
```

### Test a connection to any data source

```
$peachy -c <connection-name> -t
```

# MySQL, SQL Server, and SQL Azure

```
$ peachy -c <connection-name> -q "select * from information_schema.tables"
```

# MongoDB

**query all documents** in the collection

```
$ peachy -c <connection-name> -i <collection-name>
```

**query with a filter**

```
$ peachy -c <connection-name> -i <collection-name> -f <json-filter>
```

**insert a document** in the collection

```
$ peachy -c <connection-name> -i <collection-name> -o createDocument -d <json-document>
```

**update documents** (or a document) in the collection

```
$ peachy -c <connection-name> -i <collection-name> -o updateDocuments -f <json-filter> -u <json-update-obj>
```

**delete documents** (or a document) in the collection

```
$ peachy -c <connection-name> -i <collection-name> -o deleteDocuments -f <json-filter>
```

# DocumentDB

**query documents**

```
$ peachy -c <connection-name> -i <collection-name> -q "select * from c"
```

**insert a document** in the collection

```
$ peachy -c <connection-name> -i <collection-name> -o createDocument -d <json-document>
```