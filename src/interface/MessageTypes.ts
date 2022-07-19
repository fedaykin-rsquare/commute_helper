
export interface MessageTypes {
	wake: string
	register: string
	start: string
	end: string
	info: string
}

export const messageTypes: MessageTypes = {
	wake: '일어나',
	register: '등록',
	start: '출근',
	end: '퇴근',
	info: '내정보'
}
