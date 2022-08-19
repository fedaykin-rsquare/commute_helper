
export interface MessageTypes {
	register: string;
	start: string;
	end: string;
	info: string;
	info_delete: string;
	confirm_start: string;
	confirm_end: string;
}

export const messageTypes: MessageTypes = {
	register: '등록',
	start: '출근',
	end: '퇴근',
	info: '내정보',
	info_delete: '내정보 삭제',
	confirm_start: '출근 확인',
	confirm_end: '퇴근 확인'
}
