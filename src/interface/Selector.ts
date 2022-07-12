
export declare interface Selector {
	company: string,
	id: string,
	password: string,
	login: string,
	startWork: string,
	endWork: string,
	blockFrame: string,
	save: string,
}

export const selector: Selector = {
	company: '#S_C_CD',
	id: '#S_USER_ID',
	password: '#S_PWD',
	login: '#btn_login',
	startWork: '#S_WORK_STA_BTN',
	endWork: '#S_WORK_END_BTN',
	blockFrame: '.modalCon iframe',
	save: '.save'
};
