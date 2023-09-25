import {Injectable, Logger} from '@nestjs/common'
import {DataDto, MessageDto} from './dto/messageDto'
import {ClientsList} from './interfaces/clientInterface'

@Injectable()
export class WsService {
	private readonly logger = new Logger('WsService Logger')

	addClientToList(clients: ClientsList, client: WebSocket, user: string) {
		const payload = {event: 'userIn', data: {user: user}}
		clients.forEach((_, client) => {
			client.send(JSON.stringify(payload))
		})
		clients.set(client, {user})
	}

	sendMessageForClient(client: WebSocket, data: MessageDto[]) {
		if (data.length) {
			data.forEach(msg => {
				client.send(JSON.stringify(msg))
			})
		}
	}

	sendMessageForAllClients(clients: ClientsList, payload: DataDto, messageList: MessageDto[]) {
		this.messageListHandler(payload, messageList)
		const response = {
			event: 'message',
			data: {
				user: payload.user,
				message: payload.message,
				date: new Date(),
			},
		}
		clients.forEach((_, client) => {
			client.send(JSON.stringify(response))
		})
	}

	messageListHandler(payload: DataDto, messageList: MessageDto[]) {
		const response = {
			event: 'message',
			data: {
				user: payload.user,
				message: payload.message,
				date: new Date(),
			},
		}
		if (messageList.length > 10) {
			messageList.shift()
			return messageList.push(response)
		}
		messageList.push(response)
	}

	removeClient(clients: ClientsList, currentClient: WebSocket) {
		const user = clients.get(currentClient)
		const payload = {event: 'userOut', data: {user: user}}
		clients.forEach((_, client) => {
			client.send(JSON.stringify(payload))
		})
		clients.delete(currentClient)
	}

	sendOnlineCount(clients: ClientsList) {
		const response = {event: 'onlineUsers', data: {onlineUsers: clients.size}}
		clients.forEach((_, client) => {
			client.send(JSON.stringify(response))
		})
	}
}
