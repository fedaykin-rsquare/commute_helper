
export interface MessageTypes {
	register: string
	start: string
	end: string
	info: string
}

export const messageTypes: MessageTypes = {
	register: '등록',
	start: '출근',
	end: '퇴근',
	info: '내정보'
}
