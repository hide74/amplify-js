var config = require('./webpack.config.js');

var entry = {
	'aws-amplify-datastore-storage-adapter': './lib-esm/index.js',
	'aws-amplify-datastore-sqlite-adapter-expo':
		'./lib-esm/ExpoSQLiteAdapter/ExpoSQLiteAdapter.js',
	'aws-amplify-datastore-sqlite-adapter-capacitor':
		'./lib-esm/CapacitorSQLiteAdapter/CapacitorSQLiteAdapter.js',
};
module.exports = Object.assign(config, { entry, mode: 'development' });
