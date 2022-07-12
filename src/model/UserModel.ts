import {DataTypes, Model, Options, Sequelize} from 'sequelize';
import {User} from '../interface/User';

const options: Options = {
	dialect: 'sqlite',
	storage: './sqlite3.db',
	logging: true,
};

class UserModel extends Model<User> {

}

UserModel.init(
	{
		userId: {
			type: DataTypes.STRING(30),
			// field: 'user_id',
			primaryKey: true,
			allowNull: false,
			comment: 'Slack User Id'
		},
		userName: {
			type: DataTypes.STRING(30),
			// field: 'user_name',
			allowNull: false,
			comment: 'Slack User Korean Name'
		},
		jadeUserId: {
			type: DataTypes.STRING(30),
			// field: 'jade_user_id',
			allowNull: false,
			comment: 'Jade User Id'
		},
		jadeUserPassword: {
			type: DataTypes.STRING(30),
			// field: 'jade_user_password',
			allowNull: false,
			comment: 'Jade User Password'
		}
	}, {
		modelName: 'User',
		tableName: 'User',
		underscored: true,
		timestamps: true,
		sequelize: new Sequelize(options)
	}
);

export default UserModel;
