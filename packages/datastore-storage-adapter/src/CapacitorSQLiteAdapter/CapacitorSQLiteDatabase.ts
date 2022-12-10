import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { PersistentModel } from '@aws-amplify/datastore';
import { DB_NAME } from '../common/constants';
import { CommonSQLiteDatabase, ParameterizedStatement } from '../common/types';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { sqlite } from './CapacitorSQLiteAdapter';

const logger = new Logger('CapacitorSQLiteDatabase');

class CapacitorSQLiteDatabase implements CommonSQLiteDatabase {
	private db: SQLiteDBConnection;

	public async init(): Promise<void> {
		// only open database once.
		if (!this.db) {
			this.db = await sqlite.createConnection(
				DB_NAME,
				false,
				'no-encryption',
				1,
				false
			);
			logger.debug(`> createConnection '${DB_NAME}' successful`);
			await this.db.open();
			logger.debug(`> open '${DB_NAME}' successful`);
		}
	}

	public async createSchema(statements: string[]): Promise<void> {
		logger.debug('> createSchema');
		await this.executeStatements(statements);
	}

	public async clear(): Promise<void> {
		logger.debug('> clear');
		await this.db.close();
		if (await this.db.isExists()) {
			await this.db.delete();
			logger.debug('> Database deleted');
		}
		await sqlite.closeConnection(DB_NAME);
	}

	public async get<T extends PersistentModel>(
		statement: string,
		params: (string | number)[]
	): Promise<T> {
		const results: T[] = await this.getAll(statement, params);
		logger.debug(`> [get] ${results}`);
		return results[0];
	}

	public async getAll<T extends PersistentModel>(
		statement: string,
		params: (string | number)[]
	): Promise<T[]> {
		logger.debug(`> [getAll] stattement: ${statement}, params: ${params}`);
		const resultSet = await this.db.query(statement, params);
		logger.debug(
			` [getAll] resultSet.values.legnth: ${resultSet.values.length}`
		);
		const result =
			resultSet && resultSet.values && resultSet.values.length > 0
				? resultSet.values
				: [];

		return result;
	}

	public async save(
		statement: string,
		params: (string | number)[]
	): Promise<void> {
		logger.debug(`> [save] stattement: ${statement}, params: ${params}`);
		await this.db.run(statement, params);
	}

	public async batchQuery<T = any>(
		queryParameterizedStatements: Set<ParameterizedStatement>
	): Promise<T[]> {
		const results: T[] = [];

		for (const [statement, params] of queryParameterizedStatements) {
			logger.debug(`> batchQuery: ${statement}, params: ${params}`);
			const resultSet = await this.db.query(statement, params);
			const result: T =
				resultSet && resultSet.values && resultSet.values.length > 0
					? resultSet.values[0]
					: undefined;
			results.push(result);
		}

		return results;
	}

	public async batchSave(
		saveParameterizedStatements: Set<ParameterizedStatement>,
		deleteParameterizedStatements?: Set<ParameterizedStatement>
	): Promise<void> {
		for (let [statement, params] of saveParameterizedStatements) {
			// if (statement.startsWith('INSERT'))
			// 	statement = statement.replace(/INSERT/, 'REPLACE')
			logger.debug(
				`> [batchSave#save] stattement: ${statement}, params: ${params}`
			);
			await this.db.run(statement, params, true);
		}
		if (deleteParameterizedStatements) {
			for (const [statement, params] of deleteParameterizedStatements) {
				logger.debug(
					`> [batchSave#delete] stattement: ${statement}, params: ${params}`
				);
				await this.db.run(statement, params, true);
			}
		}
	}

	public async selectAndDelete<T = any>(
		queryParameterizedStatement: ParameterizedStatement,
		deleteParameterizedStatement: ParameterizedStatement
	): Promise<T[]> {
		let results: T[] = [];

		const [queryStatement, queryParams] = queryParameterizedStatement;
		const [deleteStatement, deleteParams] = deleteParameterizedStatement;

		logger.debug(
			`> [selectAndDelete#query] stattement: ${queryStatement}, params: ${queryParams}`
		);
		const resultSet = await this.db.query(queryStatement, queryParams);
		const result: T =
			resultSet && resultSet.values && resultSet.values.length > 0
				? resultSet.values[0]
				: undefined;
		results = results.concat(result);
		logger.debug(
			`> [selectAndDelete#delete] stattement: ${deleteStatement}, params: ${deleteParams}`
		);
		await this.db.run(deleteStatement, deleteParams);

		return results;
	}

	private async executeStatements(statements: string[]): Promise<void> {
		for (const statement of statements) {
			logger.debug(`> [executeStatements] stattement: ${statement}`);
			await this.db.execute(statement);
		}
	}
}

export default CapacitorSQLiteDatabase;
