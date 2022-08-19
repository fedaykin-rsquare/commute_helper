import UserModel from '../model/UserModel';

export interface User {
	userId: string;
	userName: string;
	jadeUserId: string;
	jadeUserPassword: string;
	salt: string;
}

export function convertToUser(userModel: UserModel): User {
	return {
		userId: userModel.getDataValue('userId'),
		userName: userModel.getDataValue('userName'),
		jadeUserId: userModel.getDataValue('jadeUserId'),
		jadeUserPassword: userModel.getDataValue('jadeUserPassword'),
		salt: userModel.getDataValue('salt'),
	}
}
