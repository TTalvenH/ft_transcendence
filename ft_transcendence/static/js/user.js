import { router } from "./main.js"
import { circle_xmark, showToast } from "./utils.js"

class User {
	setUser(data) {
		const user = {
			username: data.user.username,
			id: data.user.id,
			accessToken: data.tokens.access,
			lastActive: data.user.last_active,
			latestRefresh: Date.now()
		}

		const expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate() + 5);

		document.cookie = `refresh=${data.tokens.refresh}; expires=${expirationDate.toUTCString()}; path=/;`;
		localStorage.setItem('currentUser', JSON.stringify(user));
	}

	getUser() {
		return JSON.parse(localStorage.getItem('currentUser'));
	}

	removeUser() {
		localStorage.removeItem('currentUser');
		document.cookie = 'refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
	}

	refreshToken() {
		let user = this.getUser();
		if (user)
		{
			fetch(`http://127.0.0.1:8000/users/check_existance/${user.username}/`)
			.then(res => {
				if (res.status === 404) {
					this.removeUser();
					router.handleLocation();
					return ;
				}
			})
			.catch( () => {
				showToast(circle_xmark + 'Something went wrong', true);
			})
		}
		// check if latest refresh was more than 15 minutes ago
		if (user && user.latestRefresh < Date.now() - 15*60*1000) {
			console.log('refreshing token, latestRefresh = ' + new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(user.latestRefresh)));
			const cookie = document.cookie.split('; ').find(row => row.startsWith('refresh='));
			const refreshToken = cookie ? cookie.split('=')[1] : null;
			if (!refreshToken) {
				handleTokenRefreshError(new Error('No refresh token found'));
				return;
			}

			fetch('http://127.0.0.1:8000/users/token/refresh_token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ refresh: refreshToken })
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Failed to refresh token');
				}
				return response.json();
			})
			.then(data => {
				user.accessToken = data.access;
				user.latestRefresh = Date.now();
				localStorage.setItem('currentUser', JSON.stringify(user));
			})
			.catch(error => {
				handleTokenRefreshError(error);
			});
		}
	}
};

function handleTokenRefreshError(error) {
	currentUser.removeUser();
	window.pushState({}, "", "/");
	router.handleLocation();
	showToast(circle_xmark + 'Something went wrong', true);
}

export const currentUser = new User();