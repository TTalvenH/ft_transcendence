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
		this.latestRefresh = 0;
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
	init() {
		if (currentUser.getUser() && Date.now() - currentUser.latestRefresh > 15*60*1000) {
			console.log('refreshing token');
			currentUser.refreshToken();
		}
		this.routes.some(route => {
			let regEx = new RegExp(`^${route.path}$`);
			let path = window.location.pathname;

			if (path.match(regEx)) {
				handleSidePanel();
				let req = { path };
				return route.handler(this, req);
			}
		});
	}
}

const router = new Router();

router.get('/', homeHandler);

router.get('/login', loginHandler);

router.get('/register', registerHandler);

router.get('/log-out', logOutHandler);

router.get('/edit-profile', editProfileHandler);

router.get('/pong', pongHandler);

router.get('/profile', profileHandler);

class User {
	setUser(data) {
		const user = {
			username: data.user.username,
			id: data.user.id,
			accessToken: data.tokens.access,
			lastActive: data.user.last_active
		}

		this.latestRefresh = Date.now();
		// Convert the user object to a JSON string
		const expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate() + 5);

		// Convert the user object to a JSON string
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
		if (user) {
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
					localStorage.setItem('currentUser', JSON.stringify(user));
					this.latestRefresh = Date.now();
				}
				else {
					this.removeUser();
					showToast(circle_xmark + 'Session Has Expired', true);
					window.pushState({}, "", "/");
					router.init();
				}
			} catch (error) {
				console.log('error == ' + error);
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

const routes = {
	"/": homeHandler,
	"/pong": pongHandler,
	"/login": loginHandler,
	"/register": registerHandler,
	"/profile": profileHandler,
	"/edit-profile": editProfileHandler,
	"/log-out": logOutHandler,
};

function handleSidePanel() {
	const userData = currentUser.getUser();
	const loginButton = document.getElementById('loginButton');
	const logoutButton = document.getElementById('logoutButton');
	const profileButton = document.getElementById('profileButton');
	if (userData) {
		loginButton.style.display = 'none';
		logoutButton.style.display = 'block';
		profileButton.style.display = 'block';
	} else {
		logoutButton.style.display = 'none';
		profileButton.style.display = 'none';
		loginButton.style.display = 'block';
	}

}

function addGameOptions() {
	alert("add game options");
	console.log("test")
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
				currentUser.setUser(data);
				showToast(profileSuccess, false);
				history.pushState({}, "", "/profile");
				handleLocation();

			} else {
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
			handleLocation();
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
		handleLocation();
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
	// const response = await fetch(`/users/get-user-profile/${username}/`, {
	// 	method: 'GET',
	// 	headers: {
	// 		'Authorization': 'Bearer ' + userData.accessToken
	// 	},
	// });
	// if (response.ok) {
	// 	const data = await response.json();
	// 	console.log(data);
	// 	data.friends.forEach(createFriendRow);
	// 	const userName = document.getElementById('username');
	// 	userName.innerText = data.username;
	// 	const matchBodyEl = document.getElementById('matchHistoryBody');
	// 	data.match_history.forEach((match) => {
	// 		const matchRow = document.createElement('tr');
	// 		const opponent = document.createElement('td');
	// 		const score = document.createElement('td');
	// 		const date = document.createElement('td');
	// 		if (match.player1Name === userData.username) {
	// 			opponent.innerText = match.player2Name;
	// 		} else {
	// 			opponent.innerText = match.player1Name;
	// 		}
	// 		score.innerText = match.player1Hp + ' - ' + match.player2Hp;
	// 		if (match.winner === userData.username) {
	// 			score.style.color = '#70d170';
	// 		} else {
	// 			score.style.color = 'red';
	// 		}
	// 		date.innerText = match.dateTime;
	// 		matchRow.appendChild(opponent);
	// 		matchRow.appendChild(score);
	// 		matchRow.appendChild(date);
	// 		matchBodyEl.appendChild(matchRow);
	// 	})
	// } else {
	// 	showToast(somethingWentWrong, true);
	// 	history.pushState({}, "", "/");
	// 	handleLocation();
	// 	return;
	// }
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
}

async function loginHandler() {
    const registerBox = document.getElementById('registerBox');
    if (registerBox) 
		registerBox.remove();
    if (!window.loginFormHTML) {
        window.loginFormHTML = await fetchHTML("/users/login.html");
    }
    const userContainer = document.getElementById('userContainer');
    userContainer.innerHTML = ''; // Clear the UI container
    userContainer.insertAdjacentHTML('beforeend', window.loginFormHTML);

    // Add event listener to the login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

// could remove this function

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
			console.log(loginData.user.username);
            currentUsername = formData.get('username');
			if (loginData.otp_required && !loginData.otp_verified) {
				showToast(loginSuccess, false);
				showToast(notVerified, true);
				showToast(reActivate, false);
				currentUser.setUser(loginData);
				history.pushState({}, "", "/");
				router.init();
			}
            else if (loginData.otp_required && loginData.otp_verified) {
                loginForm.remove();
                await loadOtpForm();
            }
			else {
				showToast(loginSuccess, false);
				currentUser.setUser(loginData);
				history.pushState({}, "", "/");
				router.init();
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

        if (otpResponse.ok) {
			const otpData = await otpResponse.json();
			showToast(loginSuccess, false);
			currentUser.setUser(otpData);
			history.pushState({}, "", "/");
			handleLocation();
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
            showToast(`Error: ${errorResult.detail || 'Something went wrong'}`, true);
        }
    } catch (error) {
        showToast('Something went wrong', true);
    }
}

async function handleRegistrationResponse(result) {
    const userContainer = document.getElementById('userContainer');
    if (result.otp && result.qr_html) {
        userContainer.innerHTML = '';
        userContainer.insertAdjacentHTML('beforeend', result.qr_html);

        const otpForm = document.getElementById('otpForm');
        if (otpForm) {
            otpForm.addEventListener('submit', (event) => handleOtpVerificationSubmit(event, result.user.username));
        } else {
            console.error('OTP form not found');
        }
    } else {
        showToast('Registration successful', false);
        history.pushState({}, "", "/");
        handleLocation();
    }
}

async function handleOtpVerificationSubmit(event, username) {
    event.preventDefault();
    
    const otpForm = event.target;
    const otpFormData = new FormData(otpForm);
    otpFormData.append('username', username);

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
            handleLocation();
        } else {
            showToast(verificationFailed, true);
        }
    } catch (error) {
        showToast('Something went wrong', true);
    }
}

async function pongHandler() {
	const userData = currentUser.getUser();
	const userContainer = document.getElementById('userContainer');
	const sidePanel = document.getElementById('sidePanel');
	const ui = document.getElementById('ui');
	userContainer.innerHTML = "";
	sidePanel.style.display = 'none'; // Using display
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
	// todo make a function out of this and cache html element
	one_v_oneButton.addEventListener('click', async () => {
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
			} else {
				console.log("watafak")
				showToast(somethingWentWrong, true);
			}
		} catch (error) {
			console.error(error);
			showToast(somethingWentWrong, true);
		}
	})
	// window.pong.gameGlobals.gameState = GameStates.PLAYING;
}

async function handleLocation() {
	handleSidePanel();
	const url = new URL(window.location.href);
	const path = url.pathname;
	currentRoute = window.location.href;
	const handler = routes[path] || routes["/404"];
	await handler();
}

let currentRoute = "";

window.route = (event) => {
    event.preventDefault();
    const href = event.currentTarget.href;
	console.log('href = ' + href)
	console.log('currentRoute = ' + currentRoute)
    if (href !== currentRoute) { // Check if the new route is different from the current one
        window.history.pushState({}, "", href);
		currentRoute = href;
		console.log(href)
		router.init();
    }
};

const pong = new Pong();

pong.gameLoop();
router.init();


// window.onpopstate = handleLocation;
// handleLocation();


// async function registerHandler() {
// 	const loginBox = document.getElementById('loginBox');
// 	if (loginBox) {
// 		loginBox.remove();
// 	}

// 	if (!registerFormHTML) {
// 		registerFormHTML = await fetch("/users/register.html").then(response => {
// 			if (!response.ok) throw new Error('Failed to fetch registration form');
// 			return response.text();
// 		});
// 	}

// 	const userContainer = document.getElementById('userContainer');
// 	userContainer.insertAdjacentHTML('beforeend', registerFormHTML);

// 	const registerForm = document.getElementById('registerForm');
// 	if (registerForm) {
// 		registerForm.addEventListener('submit', async (event) => {
// 			event.preventDefault();

// 			const formData = new FormData(registerForm);

// 			try {
// 				const response = await fetch('/users/create-user', {
// 					method: 'POST',
// 					body: formData
// 				});

// 				if (response.ok) {
// 					const result = await response.json();
// 					console.log(result.otp);
// 					if (result.otp && result.otp.html) {
// 						userContainer.innerHTML = '';
// 						const qrHTML = result.otp.html;
// 						document.getElementById('userContainer').insertAdjacentHTML('beforeend', qrHTML);
// 					} else {
// 						alert('Registration successful');
// 					}
// 				} else {
// 					const errorData = await response.json();
// 					alert(`Registration failed: ${errorData.detail}`);
// 				}
// 			} catch (error) {
// 				console.error('Error registering user:', error);
// 				alert('An error occurred during registration. Please try again later.');
// 			}
// 		});
// 	} else {
// 		console.error('Register form not found');
// 	}
// }


// async function temp_registerHandler() {
// 	const userContainer = document.getElementById('userContainer');
// 	userContainer.innerHTML = "";
// 	if (!registerFormHTML) // we only fetch once and then save it locally
// 		registerFormHTML = await fetch("/users/register.html").then((data) => data.text());
// 	userContainer.insertAdjacentHTML('beforeend', registerFormHTML);
// 	// Add event listener to the registration form
// 	const registerForm = document.getElementById('registerForm');
// 	registerForm.addEventListener('submit', async (event) => {
// 		event.preventDefault(); // Prevent default form submission behavior
// 		// Get form data
// 		const formData = new FormData(registerForm);
// 		try {
// 			// Send form data to the backend
// 			const response = await fetch('/users/create-user', {
// 				method: 'POST',
// 				body: formData
// 			});

// 			if (response.ok) {
// 				showToast(registerSuccess, false);
// 				history.pushState({}, "", "/");
// 				handleLocation();
// 			} else {
// 				const data = await response.json();
// 				if (data)
// 					showToast(circle_xmark + data.detail, true);
// 				else
// 					showToast(somethingWentWrong, true);
// 			}
// 		} catch (error) {
// 			showToast(somethingWentWrong, true);
// 		}
// 	});
// }


// async function loginHandler2() {
// 	const userContainer = document.getElementById('userContainer');
// 	userContainer.innerHTML = "";
// 	if (!loginFormHTML)
// 		loginFormHTML = await fetch("/users/login.html").then((data) => data.text());
// 	userContainer.insertAdjacentHTML('beforeend', loginFormHTML);
//     // Add event listener to the registration form
//     const loginForm = document.getElementById('loginForm');
//     loginForm.addEventListener('submit', async (event) => {
//         event.preventDefault(); // Prevent default form submission behavior

//         // Get form data
//         const formData = new FormData(loginForm);
        
//         try {
//             // Send form data to the backend
//             const response = await fetch('/users/login-user', {
// 				method: 'POST',
// 				body: formData
//             });
//             if (response.ok) {
// 				const data = await response.json();
// 				currentUser.setUser(data);
// 				showToast(loginSuccess, false);
// 				history.pushState({}, "", "/");
// 				router.init();
// 				// handleLocation();
//             } else {
//                 showToast(loginFail, true);
//             }
//         } catch (error) {
//             showToast(somethingWentWrong, true);
//         }
// 	});
// }