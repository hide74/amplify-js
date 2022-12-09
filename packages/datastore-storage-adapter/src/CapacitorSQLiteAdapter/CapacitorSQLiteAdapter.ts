import { CommonSQLiteAdapter } from '../common/CommonSQLiteAdapter';
import CapacitorSQLiteDatabase from './CapacitorSQLiteDatabase';
import { SQLiteHook } from 'react-sqlite-hook';

export const CapacitorSQLiteAdapter: CommonSQLiteAdapter =
	new CommonSQLiteAdapter(new CapacitorSQLiteDatabase());

export let sqlite: SQLiteHook;

export const setHook = (hook: SQLiteHook) => {
	sqlite = hook;
};

// export default CapacitorSQLiteAdapter;
