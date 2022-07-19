
export declare interface Selectors {
	company: string,
	id: string,
	password: string,
	login: string,
	startWork: string,
	endWork: string,
	modalFrame: string,
	save: string,
}

export const selector: Selectors = {
	company: '#S_C_CD',
	id: '#S_USER_ID',
	password: '#S_PWD',
	login: '#btn_login',
	startWork: '#S_WORK_STA_BTN',
	endWork: '#S_WORK_END_BTN',
	modalFrame: '.modalCon iframe',
	save: '.save'
};
