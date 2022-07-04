import sqlite, {Database} from 'sqlite3';
import User from '../interface/User';

const createSql: string =
	'CREATE TABLE IF NOT EXISTS USERS (' +
		'user_id varchar(20) primary key' +
		', user_name varchar(10)' +
		', jade_user_id varchar(20)' +
		', jade_user_password varchar(100)' +
		', create_date timestamp' +
	')';

const selectAllSql: string =
	'SELECT' + ' ' +
		'user_id' +
		', user_name' +
		', jade_user_id' +
		', jade_user_password' +
		', create_date' + ' ' +
	'FROM USERS' + ' ' +
	'WHERE 1 = 1';

const selectOne: string =
	'SELECT' + ' ' +
		'user_id' +
		', user_name' +
		', jade_user_id' +
		', jade_user_password' +
		', create_date ' + ' ' +
	'FROM USERS' + ' ' +
	'WHERE 1 = 1' + ' ' +
		'AND user_id = #{userId}';

class Sqlite3 {
	private filePath: string = './sqlite3.db';
	private sqlite3: sqlite.sqlite3 = sqlite.verbose();
	private db: Database = new this.sqlite3.Database(this.filePath);
	
	constructor() {
	
	}
	
	public createTable(): void {
		this.db.run(createSql);
		
		this.db.close();
	}
	
	public selectAll(): Array<User> {
		this.db.all(selectAllSql)
		
		return [];
	}
	
	public insertUserOne(user: User): void {
		// this.db.
	}
}
