import UserModel from '../model/UserModel';
import {convertToUser, User} from '../interface/User';
import sqlite, {Database} from 'sqlite3';
import {Op} from 'sequelize';
import {Attributes, DestroyOptions} from 'sequelize/types/model';

const createSql: string =
		'CREATE TABLE IF NOT EXISTS User (' +
			'user_id varchar(20) primary key' +
			', user_name varchar(10)' +
			', jade_user_id varchar(20)' +
			', jade_user_password varchar(100)' +
			', created_at timestamp' +
			', updated_at timestamp' +
		')';

class UserRepository {
	private filePath: string = './sqlite3.db';
	private sqlite3: sqlite.sqlite3 = sqlite.verbose();
	private db: Database = new this.sqlite3.Database(this.filePath);
	
	constructor() {
	
	}
	
	public async createTable(): Promise<boolean> {
		const table: Database = await this.db.run(createSql);
		
		return table != null;
	}
	
	public async findByUserId(userId: string): Promise<User | null> {
		const userOne: UserModel | null = await UserModel.findByPk(userId);
		
		if (userOne != null) {
			return convertToUser(userOne);
		}
		
		return null;
	}
	
	public async insertOne(userOne: User): Promise<User> {
		const insertedUser: UserModel = await UserModel.create(userOne);
		
		return convertToUser(insertedUser);
	}
	
	public async deleteOne(userId: string): Promise<number> {
		const where: DestroyOptions<Attributes<UserModel>> = {
			where: {
				userId: {
					[Op.eq]: userId
				}
			}
		};
		const count: number = await UserModel.destroy(where);
		
		return count;
	}
}

export default UserRepository;
