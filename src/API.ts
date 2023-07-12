import axios from 'axios';

import { API_BASE_URL } from './config/Config';

export class API {
	static REQUEST = axios.create({
		baseURL: API_BASE_URL,
		headers: { 'ngrok-skip-browser-warning': 'true' },
		// timeout: 1000
	});

	static setBearerToken(token: string) {
		API.REQUEST = axios.create({
			baseURL: API_BASE_URL,
			headers: {
				'ngrok-skip-browser-warning': 'true',
				Authorization: 'Bearer ' + token,
			},
			//	timeout: 1000
		});
	}
}
