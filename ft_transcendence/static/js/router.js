//variables where we save the html content when it is first fetched
let loginFormHTML;
let registerFormHTML;
const loginSuccess = '<i class="fa-regular fa-circle-check"></i> Login Success';
const loginFail = '<i class="fa-regular fa-circle-xmark"></i> Login Fail';
const registerSuccess = '<i class="fa-regular fa-circle-check"></i> Registeration Success';
const registerFail = '<i class="fa-regular fa-circle-xmark"></i> Registeration Fail';
const logoutSuccess = '<i class="fa-regular fa-circle-check"></i> You have been logged out';
const logoutFail = '<i class="fa-regular fa-circle-xmark"></i> Logout Failed';
const somethingWentWrong = '<i class="fa-regular fa-circle-xmark"></i> Something went wrong';
const profileSuccess = '<i class="fa-regular fa-circle-check"></i>  Profile updated successfully';
const addFriendSuccess = '<i class="fa-regular fa-circle-check"></i>  Friend added successfully';
const addFriendFail = '<i class="fa-regular fa-circle-xmark"></i>  User not found';
const addFriendAlreadyFriend = '<i class="fa-regular fa-circle-xmark"></i>  User already a friend';
const circle_xmark = '<i class="fa-regular fa-circle-xmark"></i>';
const circle_check = '<i class="fa-regular fa-circle-check"></i>';
const verificationFailed = '<i class="fa-regular fa-circle-xmark"></i> Verification failed';
const notVerified = '<i class="fa-regular fa-circle-xmark"></i> OTP was activated but not verified';
const reActivate = '<i class="fa-regular fa-circle-xmark"></i> Please setup 2FA in profile settings';

class Router {
	constructor() {
		this.routes = [];
		this.currentPath = '';
		this.currenSearchParams = '';
	}
	get(path, handler) {
		// Check if path and handler are provided
		if (!path || !handler) throw new Error('path and handler are required');
		// Check if path is a string
		if (typeof path !== 'string') throw new TypeError('path must be a string');
		// Check if handler is a function
		if (typeof handler !== 'function') throw new TypeError('handler must be a function');
		this.routes.forEach(route => {
			if (route.path === path) throw new Error(`Route with path ${path} already exists`);
		});
		const route = {
			path,
			handler
		};
		this.routes.push(route);
	}

	async init() {
		handleSidePanel();
		this.currentPath = window.location.pathname;
		this.currenSearchParams = window.location.search;
		await currentUser.refreshToken();
		const route = this.routes.find(route => {
			const regEx = new RegExp(`^${route.path}$`);
			return this.currentPath.match(regEx);
		});
		if (route) {
			let req = { path: this.currentPath };
			return route.handler(this, req);
		} else {
			history.pushState({}, "", "/");
		}
    }
}

const router = new Router();

router.get('/', homeHandler);

router.get('/login', loginHandler);

router.get('/register', registerHandler);

router.get('/edit-profile', editProfileHandler);

router.get('/pong', pongHandler);

router.get('/profile', profileHandler);

router.get('/tournament', tournamentInfoHandler);

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
		console.log(document.cookie);
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
		console.log(user);
		// check if latest refresh was more than 15 minutes ago
		if (user && user.latestRefresh < Date.now() - 15*60*1000) {
			console.log('refreshing token, latestRefresh = ' + new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(user.latestRefresh)));
			try {
				const cookie = document.cookie.split('; ').find(row => row.startsWith('refresh='));
				const refreshToken = cookie ? cookie.split('=')[1] : null;
				const body = refreshToken ? JSON.stringify({refresh: refreshToken}) : null;
				console.log(body);
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
					router.init();
				}
			} catch (error) {
				showToast(somethingWentWrong, true);
			}
		}
	}
};

let currentUser = new User();

function showToast(msg, error) {
	let toastBox = document.getElementById('toastBox');
	let toastDiv = document.createElement('div');

	toastDiv.classList.add('toast');
	toastDiv.innerHTML = msg;
	console.log(msg.length);
	if (msg.length > 80) {
		toastDiv.style.minWidth = '450px';
	}
	console.log(toastDiv);
	toastBox.appendChild(toastDiv);
	if (error) {
		toastDiv.classList.add('fail');
	}
	setTimeout(() => {
		toastDiv.remove();
	}, 4000)
}

import { GameStates, Pong } from "./pong/pong.js";
import { pongStartHandler, pongMatchOverHandler } from "./routeHandlers/pongHandlers.js";

const gameOverData = {
	player1: {
		name: "",
		hitpoints: 0,
	},
	player2: {
		name: "",
		hitpoints: 0,
	},
	winner: "",
	matchTimeLength: 0,
	dateTime: 0,
};

export const gameOverEvent = new CustomEvent('endMatch', { detail: gameOverData });

function handleSidePanel() {
	const userData = currentUser.getUser();
	const loginButton = document.getElementById('loginButton');
	const playButton = document.getElementById('startButton');
	const logoutButton = document.getElementById('logoutButton');
	const profileButton = document.getElementById('profileButton');
	if (userData) {
		playButton.style.display = 'block';
		loginButton.style.display = 'none';
		logoutButton.style.display = 'block';
		profileButton.style.display = 'block';
	} else {
		playButton.style.display = 'none';
		logoutButton.style.display = 'none';
		profileButton.style.display = 'none';
		loginButton.style.display = 'block';
	}

}

const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', logOutHandler);

async function tournamentInfoHandler() {
	console.log('tournamentInfoHandler');
	const userData = currentUser.getUser();
	const urlParams = new URLSearchParams(window.location.search);
	let id = urlParams.get('id');
	if (!id) {
		history.pushState({}, "", "/");
		router.init();
		return;
	}
	const response = await fetch(`/pong/get_tournament_info/${id}/`, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + userData.accessToken
		},
	})
	if (!response.ok) {
		showToast(somethingWentWrong, true);
		return;
	}
	const data = await response.text();
	const userContainer = document.getElementById('userContainer');
	userContainer.innerHTML = "";
	userContainer.insertAdjacentHTML('beforeend', data);

	const cancelButton = document.getElementById('cancel');
	cancelButton.addEventListener('click', () => {
		history.pushState({}, "", "/profile");
		router.init();
	});
}

async function logOutHandler() {
	const userData = currentUser.getUser();
	console.log('userdata = ' + userData.accessToken);
	const response = await fetch("/users/log-out-view", {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + userData.accessToken
		},
	});
	if (response.ok) {
		currentUser.removeUser();
		showToast(logoutSuccess, false);
		history.pushState({}, "", "/");
		router.init();
	} else {
		showToast(logoutFail, true);
	}
}

async function homeHandler() {
	const userContainer = document.getElementById('userContainer');
	userContainer.innerHTML = "";
}

async function editProfileHandler() {
	const userData = JSON.parse(localStorage.getItem('currentUser'));
	const userContainer = document.getElementById('userContainer');
	const updateProfileResponse = await fetch("/users/update_profile.html", {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + userData.accessToken,
		},
	});
	if (!updateProfileResponse.ok) {
		showToast(somethingWentWrong, true);
		return;
	}
	const updateProfileHTML = await updateProfileResponse.text();
	userContainer.innerHTML = "";
	userContainer.insertAdjacentHTML('beforeend', updateProfileHTML);

	const input = document.getElementById('imageInput');
	const profileImage = document.getElementById('profileImage');
	let selectedFile = null;

	input.addEventListener('change', async (event) => {
		selectedFile = input.files[0];
		if (selectedFile) {
			var reader = new FileReader();
			reader.onload = function(e) {
				profileImage.src = e.target.result;
				profileImage.onload = function() {
					profileImage.style.display = 'block';
				}
			}
			reader.readAsDataURL(selectedFile);
		}
	});

	const updateProfileForm = document.getElementById('updateProfileForm');
	const otpEnabledInput = document.getElementById('otpEnabled');
	const flexSwitch2FA = document.getElementById('flexSwitch2FA');

	// Set the hidden input value based on the switch's initial state
	otpEnabledInput.value = flexSwitch2FA.checked;

	flexSwitch2FA.addEventListener('change', () => {
		otpEnabledInput.value = flexSwitch2FA.checked;
	});

	updateProfileForm.addEventListener('submit', async (event) => {
		try {
			event.preventDefault();
			const userData = currentUser.getUser();
			const formData = new FormData(updateProfileForm);
			if (selectedFile) {
				formData.append('image', selectedFile);
			}

			const response = await fetch('/users/update-user-profile', {
				method: 'PUT',
				headers: {
					'Authorization': 'Bearer ' + userData.accessToken
				},
				body: formData
			});
			if (response.ok) {
				const data = await response.json();
				let current_user_data = JSON.parse(localStorage.getItem('currentUser'));
				current_user_data.username = data.user.username;
				current_user_data.id = data.user.id;
				localStorage.setItem('currentUser', JSON.stringify(current_user_data));
				if (data.otp_setup_needed) {
					const otpResponse = await fetch('/users/otpSetup-profile', {
						method: 'POST',
						headers: {
							'Authorization': 'Bearer ' + userData.accessToken,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ enable_otp: true })
					});
					
					if (otpResponse.ok) {
						const otpResult = await otpResponse.json();
						await handleOtpVerification(otpResult);
					} else {
						const otpError = await otpResponse.json();
						showToast(`Error: ${otpError.detail || 'OTP setup failed'}`, true);
						return;
					}
				}
				else {
					showToast(profileSuccess, false);
					history.pushState({}, "", "/profile");
					router.init();
				}
			} 
			else {
				const data = await response.json();
				if (data)
					showToast(circle_xmark + data.detail, true);
				else
					showToast(somethingWentWrong, true);
			}	
		}
		catch (error) {
			showToast(somethingWentWrong, true);
		}
	});

	const checkBox = document.getElementById('flexSwitchCheckDefault');
	checkBox.addEventListener('change', (event) => {
		const passwordFields = document.querySelectorAll('.passwordField');
		if (event.target.checked) {
			passwordFields.forEach((passwordField) => {
				const passwordInput = passwordField.getElementsByTagName('input')[0];
				passwordInput.setAttribute('required', '');
				passwordField.style.display = 'block';
			});
		} else {
			passwordFields.forEach((passwordField) => {
				const passwordInput = passwordField.getElementsByTagName('input')[0];
				passwordInput.removeAttribute('required', '');
				passwordField.style.display = 'none';
			});
		}
	});
}

async function handleOtpVerification(data) {
    const userContainer = document.getElementById('userContainer');
    userContainer.innerHTML = '';
    userContainer.insertAdjacentHTML('beforeend', data.qr_html);

	const otpForm = document.getElementById('otpForm');
	if (otpForm) {
		console.log('OTP form found');
		otpForm.addEventListener('submit', (event) => handleOtpVerificationSubmitFromProfile(event, data.username));
	} else {
		console.error('OTP form not found');
	}
}

async function handleOtpVerificationSubmitFromProfile(event, username) {
	event.preventDefault();

	const otpForm = event.target;
	const otpFormData = new FormData(otpForm);
	otpFormData.append('username', username);

	try {
		const userData = JSON.parse(localStorage.getItem('currentUser'));
		const verifyResponse = await fetch('/users/verify-otp', {
			method: 'POST',
			body: otpFormData
		});

		if (verifyResponse.ok) {
			const verifyResult = await verifyResponse.json();
			showToast(profileSuccess, false);
			history.pushState({}, "", "/profile");
			router.init();
		} else {
			showToast(verificationFailed, true);
		}
	} catch (error) {
		console.log(error);
		showToast(somethingWentWrong, true);
	}
}

function createFriendRow(friend) {
	const friendBodyEl = document.getElementById('friendsBody');
	const friendRow = document.createElement('tr');
	const profileLink = document.createElement('a');
	const friendName = document.createElement('td');
	const friendStatus = document.createElement('td');
	
	profileLink.classList.add('profileLink');
	profileLink.href = `/profile?username=${friend.username}`;
	profileLink.onclick = function(event) { route(event); };
	friendName.innerText = friend.username;
	friendStatus.innerText = '•';
	friendStatus.style.textAlign = 'center';
	
	if (friend.is_active) {
		friendStatus.style.color = '#70d170';
	} else {
		friendStatus.style.color = 'red';
	}
	profileLink.appendChild(friendName);
	friendRow.appendChild(profileLink);
	friendRow.appendChild(friendStatus);
	friendBodyEl.appendChild(friendRow);
}

async function profileHandler() {
	const userData = currentUser.getUser();
	const urlParams = new URLSearchParams(window.location.search);
	let username = urlParams.get('username');
	if (!username) {
		if (!userData) {
			history.pushState({}, "", "/");
			router.init();
			return;
		}
		username = userData.username;
	} else if (username === userData.username) {
		history.pushState({}, "", "/profile");
	}
	const userContainer = document.getElementById('userContainer');
	let profileHTML;
	const profileResponse = await fetch(`/users/profile.html/${username}/`, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + userData.accessToken
		},
	})
	if (profileResponse.ok) {
		profileHTML = await profileResponse.text();
	} else {
		showToast(somethingWentWrong, true);
		history.pushState({}, "", "/");
		router.init();
		return;
	}

	userContainer.innerHTML = "";
	userContainer.insertAdjacentHTML('beforeend', profileHTML);
	const editProfileButton = document.getElementById('editProfile');
	const addFriendDiv = document.getElementById('addFriendDiv');
	if (username === userData.username) {
		editProfileButton.style.display = 'flex';
		addFriendDiv.style.display = 'flex';
	} else {
		editProfileButton.style.display = 'none';
		addFriendDiv.style.display = 'none';
	}
	const addFriendButton = document.getElementById('addFriendButton');
	addFriendButton.addEventListener('click', async (event) => {
		event.preventDefault();
		const friendInput = document.getElementById('friendInput');
		if (friendInput.value) {
			const response = await fetch(`/users/add-friend/${friendInput.value}/`, {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer ' + userData.accessToken
				}
				});
			if (response.ok) {
				const data = await response.json();
				console.log(data);
				createFriendRow(data);
				showToast(addFriendSuccess, false);
			} else {
				if (response.status === 400) {
					showToast(addFriendAlreadyFriend, true);
				} else {
					showToast(addFriendFail, true);
				}
			}
		}
	});

	const switchTable = document.getElementById('switchButton');
	switchTable.addEventListener('click', () => {
		console.log('click');
		const match_history_table = document.getElementById('match_history');
		console.log(match_history_table.style.display);
		const tournament_history_table = document.getElementById('tournament_history');
		const tableHeader = document.getElementById('tableHeader');
		if (match_history_table.style.display === 'none') {
			tableHeader.innerText = 'Match History';
			match_history_table.style.display = 'block';
			tournament_history_table.style.display = 'none';
		} else {
			tableHeader.innerText = 'Tournament History';
			match_history_table.style.display = 'none';
			tournament_history_table.style.display = 'block';
		}
	})
}

async function loginHandler() {
    if (!window.loginFormHTML) {
        window.loginFormHTML = await fetchHTML("/users/login.html");
    }
    const userContainer = document.getElementById('userContainer');
    userContainer.innerHTML = '';
    userContainer.insertAdjacentHTML('beforeend', window.loginFormHTML);

    // Add event listener to the login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

// could remove this function or use it in everything

async function fetchHTML(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            return response.text();
        } else {
            console.error(`Error fetching ${url}: ${response.statusText}`);
            alert(`Error loading form. Please try again later.`);
            return '';
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('An error occurred while loading the form. Please try again later.');
        return '';
    }
}

let loginData = null;
let currentUsername = null;

async function handleLoginSubmit(event) {
    event.preventDefault();
    const loginForm = event.target;
    let formData = new FormData(loginForm);
    try {
        let response = await fetch('/users/login-user', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            loginData = await response.json();
			console.log('loginData');
			console.log(loginData);
            currentUsername = formData.get('username');
			if (loginData.email_otp_required)
			{
				loginForm.remove();
                await loadOtpForm();
			}
			if (loginData.otp_required && !loginData.otp_verified) {
				console.log(loginData.otp_required);
				console.log(loginData.otp_verified);
				showToast(loginSuccess, false);
				showToast(notVerified, true);
				showToast(reActivate, false);
				currentUser.setUser(loginData);
				history.pushState({}, "", "/");
				router.init()
			}
            else if (loginData.otp_required && loginData.otp_verified) {
                loginForm.remove();
                await loadOtpForm();
            }
			else {
				showToast(loginSuccess, false);
				history.pushState({}, "", "/");
				handleLocation();
			}
		}
		else {
			const errorData = await response.json()
			showToast(errorData, true);
		}
		}
	catch (error) {
		console.log(error);
        showToast(somethingWentWrong, true);
    }
}

async function loadOtpForm() {
    if (!window.otpFormHTML) {
        window.otpFormHTML = await fetchHTML("/users/qr_prompt.html");
    }
    
    const userContainer = document.getElementById('userContainer');
    userContainer.innerHTML = ''; // Clear the Usercontainer
    userContainer.insertAdjacentHTML('beforeend', window.otpFormHTML);

    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        otpForm.addEventListener('submit', handleOtpSubmit);
    }
}

async function handleOtpSubmit(event) {
    event.preventDefault();

    const otpForm = event.target;
    let otpFormData = new FormData(otpForm);

    if (currentUsername) {
		otpFormData.append('username', currentUsername);
	}

    try {
        let otpResponse = await fetch('/users/validate-otp', {
            method: 'POST',
            body: otpFormData
        });
		console.log(otpResponse.data);
        if (otpResponse.ok) {
			const otpData = await otpResponse.json();
			showToast(loginSuccess, false);
			currentUser.setUser(otpData);
			history.pushState({}, "", "/");
			router.init()
        } else {
			showToast(verificationFailed, true);
        }
    } catch (error) {
        console.error('Error during OTP validation:', error);
        alert('An error occurred during OTP validation. Please try again later.');
    }
}

async function registerHandler() {
    const userContainer = document.getElementById('userContainer');
    userContainer.innerHTML = "";

    if (!registerFormHTML) {
        registerFormHTML = await fetch("/users/register.html").then((data) => data.text());
    }

    userContainer.insertAdjacentHTML('beforeend', registerFormHTML);

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    } else {
        console.error('Registration form not found');
    }
}

async function handleRegisterSubmit(event) {
    event.preventDefault();
    
    const registerForm = event.target;
    const formData = new FormData(registerForm);
    
	// Log the FormData to ensure it's correct
	for (var pair of formData.entries()) {
		console.log(pair[0]+ ': ' + pair[1]);
	}

    try {
        const response = await fetch('/users/create-user', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            await handleRegistrationResponse(result);
        } else {
            const errorResult = await response.json();
            showToast(circle_xmark + `${errorResult.detail || 'Something went wrong'}`, true);
        }
    } catch (error) {
        showToast('Something went wrong', true);
    }
}

async function handleRegistrationResponse(result) {
    const userContainer = document.getElementById('userContainer');
    if (!userContainer) {
        console.error('User container not found');
        return;
    }

    console.log('Handling registration response:', result);

    if (result.otp && result.otp.email_otp) {
        try {
            if (!window.verifyHTML) {
                window.verifyHTML = await fetchHTML("/users/qr_prompt.html");
            }
            userContainer.innerHTML = '';
            userContainer.insertAdjacentHTML('beforeend', window.verifyHTML);
            console.log('Inserted verify HTML');
        } catch (error) {
            console.error('Error fetching verify HTML:', error);
        }
    } else if (result.otp && result.qr_html) {
        userContainer.innerHTML = '';
        userContainer.insertAdjacentHTML('beforeend', result.qr_html);
        console.log('Inserted QR HTML');
    }

    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        otpForm.addEventListener('submit', (event) => handleOtpVerificationSubmit(event, result.user.username));
        console.log('OTP form found and event listener added');
    } else {
        console.error('OTP form not found');
    }

	showToast('Registration successful', false);
	history.pushState({}, "", "/");
	router.init();
}


async function handleOtpVerificationSubmit(event, username) {
    event.preventDefault();
    
    const otpForm = event.target;
    const otpFormData = new FormData(otpForm);
    otpFormData.append('username', username);
	console.log('hi there2');
    try {
        const verifyResponse = await fetch('/users/verify-otp', {
            method: 'POST',
            body: otpFormData
        });
        
        const verifyResult = await verifyResponse.json();
        
        if (verifyResponse.ok) {
            const userContainer = document.getElementById('userContainer');
            userContainer.innerHTML = '';
            showToast('Registration successful', false);
            history.pushState({}, "", "/");
			router.init();
        } else {
            showToast(verificationFailed, true);
        }
    } catch (error) {
        showToast('Something went wrong', true);
    }
}

async function one_v_oneHandler() {
	const userData = currentUser.getUser();
	try {
		const one_v_oneResponse = await fetch("/pong/1v1.html", {
			method: "GET",
			headers: {
				'Authorization': `Bearer ${userData.accessToken}`,
			}
		});
		if (one_v_oneResponse.ok) {
			const one_v_oneHTML = await one_v_oneResponse.text();
			userContainer.innerHTML = "";
			userContainer.insertAdjacentHTML('beforeend', one_v_oneHTML);
			const startGameButton = document.getElementById('startGame');

			let mode = "guest";

			const guestButton = document.getElementById('guestButton');
			guestButton.addEventListener('click', async () => {
				const buttons = document.getElementById('buttons');
				const guestHeader = document.getElementById('guestHeader');

				buttons.remove();

				guestHeader.style.display = "block";
				startGameButton.style.display = "block";
			});

			const userButton = document.getElementById('userButton');
			userButton.addEventListener('click', async () => {
				const buttons = document.getElementById('buttons');
				buttons.remove();

				const username = document.getElementById('username');
				username.style.display = "block";

				startGameButton.style.display = "block";
				mode = "user";
			})

			const cancelButton = document.getElementById('cancel');
			cancelButton.addEventListener('click', () => {
				history.pushState({}, "", "/pong");
				router.init();
			})


			startGameButton.addEventListener('click', async () => {
				await currentUser.refreshToken();
				if (mode === "guest") {
					const ui = document.getElementById('ui');
					userContainer.innerHTML = "";
					ui.style.display = 'none';
					const data = {
						tournament_match: false,
						player1: {
							username: userData.username,
							id: userData.id
						},
						player2: {
							username: "Guest",
							id: -1
						}
					}
					pong.startGame(data);
					return ;
				}
				const username_input = document.getElementById('username_input');
				if (username_input) {
					const username = username_input.value;
					if (!username) {
						showToast(circle_xmark + 'Please enter a username', true);
						return ;
					}
					// todo check if user exists
					console.log(username);
					try {
						const response = await fetch(`/users/get-user/${username}/`, {
							method: "POST",
							headers: {
								'Authorization': `Bearer ${userData.accessToken}`,
							}
						})
						if (response.ok) {
							const player2Data = await response.json();
							console.log(player2Data);
							const ui = document.getElementById('ui');
							userContainer.innerHTML = "";
							ui.style.display = 'none';
							const data = {
								tournament_match: false,
								player1: {
									username: userData.username,
									id: userData.id
								},
								player2: {
									username: player2Data.username,
									id: player2Data.id
								}
							}
							pong.startGame(data);
						} else {
							showToast(somethingWentWrong, true);
						}
					}
					catch (error) {
						console.error(error);
						showToast(somethingWentWrong, true);
					}
				}
			})
		} else {
			console.log("watafak")
			showToast(somethingWentWrong, true);
		}
	} catch (error) {
		console.error(error);
		showToast(somethingWentWrong, true);
	}
}

async function controlsHandler() {
	const userData = currentUser.getUser();
	if (!userData) {
		return;
	}
	try {
		const userContainer = document.getElementById('userContainer');
		userContainer.innerHTML = "";
		const response = await fetch("/pong/controls.html", {
			method: "GET",
			headers: {
				'Authorization': `Bearer ${userData.accessToken}`,
			}
		});
		if (response.ok) {
			const html = await response.text();
			userContainer.insertAdjacentHTML('beforeend', html);
			const cancelButton = document.getElementById('cancel');
			cancelButton.addEventListener('click', () => {
				history.pushState({}, "", "/pong");
				router.init();
			})
		} else {
			showToast(somethingWentWrong, true);
		}	
	}
	catch (error) {
		console.error(error);
		showToast(somethingWentWrong, true);
	}
}

async function pongHandler() {
	const userData = currentUser.getUser();
	if (!userData) {
		history.pushState({}, "", "/");
		router.init();
		return ;
	}
	const userContainer = document.getElementById('userContainer');
	userContainer.innerHTML = "";
	const response = await fetch("/pong/gameMenu.html", {
		method: "GET",
		headers: {
			'Authorization': `Bearer ${userData.accessToken}`,
		}
	});
	if (response.ok) {
		const html = await response.text();
		userContainer.insertAdjacentHTML('beforeend', html);
	} else {
		showToast(somethingWentWrong, true);
	}

	const one_v_oneButton = document.getElementById('one_v_one');
	one_v_oneButton.addEventListener('click', one_v_oneHandler);

	const controlsButton = document.getElementById('controls');
	controlsButton.addEventListener('click', controlsHandler);

	const tournamentButton = document.getElementById('tournament');
	tournamentButton.addEventListener('click', tournamentHandler);
}

function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

async function tournamentHandler() {
	const userData = currentUser.getUser();
	if (!userData) {
		history.pushState({}, "", "/");
		router.init();
		return ;
	}
	const userContainer = document.getElementById('userContainer');
	userContainer.innerHTML = "";
	const response = await fetch("/pong/tournament.html", {
		method: "GET",
		headers: {
			'Authorization': `Bearer ${userData.accessToken}`,
		}
	});
	if (response.ok) {
		const html = await response.text();
		userContainer.insertAdjacentHTML('beforeend', html);

		const cancelButton = document.getElementById('cancel');
		cancelButton.addEventListener('click', () => {
			history.pushState({}, "", "/pong");
			router.init();
		})

		let players = [{username: userData.username, id: userData.id}];
		const addPlayerButtons = document.querySelectorAll('.addUserButton');
		for (let i = 0; i < addPlayerButtons.length; i++) {
			addPlayerButtons[i].addEventListener('click', async () => {
				await currentUser.refreshToken();
				const input = addPlayerButtons[i].previousElementSibling;
				if (!input) {
					return ;
				}
				if (!input.value) {
					showToast(circle_xmark + 'Please enter a username', true);
					return ;
				}
				if (input.value === userData.username) {
					showToast(circle_xmark + 'You cannot add yourself', true);
					return ;
				}
				if (players.find(player => player.username === input.value)) {
					showToast(circle_xmark + 'User already added', true);
					return ;
				}
				const response = await fetch(`/users/get-user/${input.value}/`, {
					method: "POST",
					headers: {
						'Authorization': `Bearer ${userData.accessToken}`,
					}
				})
				if (response.ok) {
					const data = await response.json();
					const playerHeader = document.getElementById('player' + (i));
					playerHeader.innerHTML = data.username;
					players.push(data);
					const playerInput = document.getElementById('player' + (i) + '_input');
					playerHeader.style.display = 'block';
					playerInput.style.display = 'none';
				} else {
					if (response.status === 404) {
						showToast(circle_xmark + 'User not found', true);
						return ;
					}
					showToast(somethingWentWrong, true);
				}
				// input.focus();
			})
		}
		
		const startTournament = document.getElementById('startTournament');
		startTournament.addEventListener('click', async () => {
			if (players.length < 4) {
				showToast(circle_xmark + 'Please add at least 3 players', true);
				return ;
			}
			console.log(players);
			shuffleArray(players);
			console.log(players);
			tournamentData = [
				{
					tournament_match: true,
					player1: players[0],
					player2: players[1],
				},
				{
					tournament_match: true,
					player1: players[2],
					player2: players[3],
				},
				{
					tournament_match: true,
					player1: null,
					player2: null,
				}
			]
			// tournamentData = {
			// 	type: 'tournament',
			// 	match_one: {
			// 		player1: players[0],
			// 		player2: players[1],
			// 	},
			// 	match_two: {
			// 		player1: players[2],
			// 		player2: players[3],
			// 	},
			// 	match_three: {
			// 		player1: null,
			// 		player2: null,
			// 	}

			// }
			const response = await fetch("/pong/tournament_match.html", {
				method: "GET",
				headers: {
					'Authorization': `Bearer ${userData.accessToken}`,
				}
			})
			if (response.ok) {
				if (!window.tournamentMatchHTML) {
					window.tournamentMatchHTML = await response.text();
				}
				nextMatch(tournamentData[0]);
			} else {
				showToast(somethingWentWrong, true);
			}
		})
	} else {
		showToast(somethingWentWrong, true);
	}
}

let tournamentData = null;

function nextMatch(gameData) {
	const sidePanelDiv = document.getElementById('sidePanelDiv');
	sidePanelDiv.style.display = 'none';
	const userContainer = document.getElementById('userContainer');
	userContainer.innerHTML = "";
	userContainer.insertAdjacentHTML('beforeend', window.tournamentMatchHTML);
	const player_one = document.getElementById('player_one');
	const player_two = document.getElementById('player_two');
	player_one.innerHTML = gameData.player1.username;
	player_two.innerHTML = gameData.player2.username;
	isTournament = true;

	const nextMatch = document.getElementById('nextMatch');
	nextMatch.addEventListener('click', async () => {
		userContainer.innerHTML = "";
		pong.startGame(gameData);
	})
}

window.route = (event) => {
    event.preventDefault();
	const newPath = new URL(event.currentTarget.href).pathname;
	console.log('haloooo');
	if (router.currentPath === newPath && router.currenSearchParams === event.currentTarget.search) {
		return ;
	}
	window.history.pushState({}, "", event.currentTarget.href);
	router.init();
};

const pong = new Pong();

pong.gameLoop();
window.onpopstate = () => router.init();

const gameToggle = document.getElementById('check');
gameToggle.addEventListener('change', (event) => {
	pong.changeGame();
	gameToggle.disabled = true;
});

router.init();

let isTournament = false;
let matchIds = [];

export async function handleMatchEnd(gameData) {
	const userData = JSON.parse(localStorage.getItem('currentUser'));
	console.log("handleMatchEnd called");
	if (gameData) {
		console.log("gamedata = " + JSON.stringify(gameData));
		// const body = {
		// 	game: gameData.game,
		// 	tournament_match: gameData.tournament_match,
		// 	player1: gameData.player1.id,
		// 	player1Hp: gameData.player1.hitpoints,
		// 	player2: gameData.player2.id,
		// 	player2Hp: gameData.player2.hitpoints,
		// 	timePlayed: gameData.matchTimeLength,
		// 	dateTime: gameData.dateTime
		// }
		// console.log(JSON.stringify(body));
		const response = await fetch('/pong/create-match', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + userData.accessToken,
			},
			body: JSON.stringify(gameData)
		});
		if (response.ok) {
			if (isTournament) {
				const data = await response.json();
				console.log('is tournament = ' + isTournament);
				matchIds.push(data.id);
				const winner = gameData.player1Hp > gameData.player2Hp ? {username: gameData.player1Name, id: gameData.player1} : {username: gameData.player2Name, id: gameData.player2};
				console.log('winner = ' + winner.username);
				if (!tournamentData[2].player1) {
					tournamentData[2].player1 = winner;
				} else {
					tournamentData[2].player2 = winner;
				}
				if (matchIds.length === 3) {
					const tournament_response = await fetch('/pong/create-tournament', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': 'Bearer ' + userData.accessToken,
						},
						body: JSON.stringify({
							game: gameData.game,
							match_one: matchIds[0],
							match_two: matchIds[1],
							match_final: matchIds[2],
						})
					})
					if (tournament_response.error) {
						showToast(somethingWentWrong, true);
					}
					matchIds = [];
					isTournament = false;
				} else {
					console.log('matchIds asd = ' + matchIds.length);
					// setTimeout(() => {
					// 	nextMatch(tournamentData[matchIds.length]);
					// }, 5000);
					nextMatch(tournamentData[matchIds.length]);
				}
			}
		} else {
			showToast(somethingWentWrong, true);
		}
		if (!isTournament) {
			if (matchIds.length > 0) {
				matchIds = [];
				isTournament = false;
			}
			const sidePanelDiv = document.getElementById('sidePanelDiv');
			sidePanelDiv.style.display = 'block';
			router.init();
		}
	}
}