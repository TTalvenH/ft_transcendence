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
	}

	async refreshToken() {
		let user = this.getUser();
		// check if latest refresh was more than 15 minutes ago
		if (user && user.latestRefresh < Date.now() - 15*60*1000) {
			console.log('refreshing token, latestRefresh = ' + new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(user.latestRefresh)));
			try {
				const cookie = document.cookie.split('; ').find(row => row.startsWith('refresh='));
				const refreshToken = cookie ? cookie.split('=')[1] : null;
				const body = refreshToken ? JSON.stringify({refresh: refreshToken}) : null;
				const response = await fetch('http://127.0.0.1:8000/users/token/refresh_token', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: body
				})
				if (response.ok) {
					const data = await response.json();
					user.accessToken = data.access;
					user.latestRefresh = Date.now();
					localStorage.setItem('currentUser', JSON.stringify(user));
				}
				else {
					this.removeUser();
					window.pushState({}, "", "/");
					router.handleLocation();
				}
			} catch (error) {
				showToast(somethingWentWrong, true);
			}
		}
	}
};

export {User}