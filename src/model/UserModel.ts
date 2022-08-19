import {DataTypes, Model, Options, Sequelize} from 'sequelize';
import {User} from '../interface/User';
import CipherModule from '../crypto/CipherModule';

const cipherModule: CipherModule = new CipherModule();
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
		},
		salt: {
			type: DataTypes.STRING(32),
			allowNull: false,
			comment: 'salt'
		},
	}, {
		modelName: 'User',
		tableName: 'User',
		underscored: true,
		timestamps: true,
		sequelize: new Sequelize(options)
	}
);

UserModel.beforeCreate((userModel, options) => {
	const jadeUserPassword: string = userModel.getDataValue('jadeUserPassword');
	const encryptedText: string = cipherModule.encrypt(jadeUserPassword);
	
	userModel.setDataValue('jadeUserPassword', encryptedText);
	userModel.setDataValue('salt', cipherModule.getSalt());
});

UserModel.afterFind((userModel, options) => {
	if (userModel != null && userModel instanceof UserModel) {
		const jadeUserPassword: string = userModel.getDataValue('jadeUserPassword');
		const salt: string = userModel.getDataValue('salt');
		const decryptedText: string = cipherModule.decrypt(jadeUserPassword, salt);
		
		userModel.setDataValue('jadeUserPassword', decryptedText);
	}
});

export default UserModel;
