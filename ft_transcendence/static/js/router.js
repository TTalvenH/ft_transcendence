import { GameStates } from "./pong/pong.js";

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

class User {
	constructor() {
		this.username = "";
		this.id = -1;
		this.accessToken = "";
		this.refreshToken = "";
		this.lastActive = -1;
	}
};

let currentUser = new User();

function showToast(msg, error) {
	console.log(msg);
	let toastBox = document.getElementById('toastBox');
	console.log(toastBox);
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
	}, 2000)
}

let currentUsername = null;

const routes = {
	"/": homeHandler,
	"/pong": pongHandler,
	"/login": loginHandler2,
	"/register": registerHandler2,
	"/profile": profileHandler,
	"/edit-profile": editProfileHandler,
	"/log-out": logOutHandler,
};

function handleSidePanel() {
	const userData = JSON.parse(localStorage.getItem('currentUser'));
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

async function logOutHandler() {
	const userData = JSON.parse(localStorage.getItem('currentUser'));
	const response = await fetch("/users/log-out-view", {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + userData.accessToken
		},
	});
	if (response.ok) {
		localStorage.removeItem('currentUser');
		history.pushState({}, "", "/");
		handleLocation();
		showToast(logoutSuccess, false);
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
	})
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
				// Replace the image source with the selected image
				profileImage.src = e.target.result;
				profileImage.onload = function() {
					// Make sure the image is loaded before displaying it
					profileImage.style.display = 'block';
				}
			}
			reader.readAsDataURL(selectedFile);
		}
	});

	const updateProfileForm = document.getElementById('updateProfileForm');
	updateProfileForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		const userData = JSON.parse(localStorage.getItem('currentUser'));
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
			currentUser.username = data.user.username;
			currentUser.id = data.user.id;
			currentUser.accessToken = data.tokens.access;
			currentUser.refreshToken = data.tokens.refresh;
			currentUser.lastActive = data.user.last_active;
			localStorage.setItem('currentUser', JSON.stringify(currentUser));
			showToast(profileSuccess, false);
			history.pushState({}, "", "/profile");
			handleLocation();
		} else {
			showToast(somethingWentWrong, true);
		}
	});

	const checkBox = document.getElementById('flexSwitchCheckDefault');
	checkBox.addEventListener('change', (event) => {
		const passwordFields = document.querySelectorAll('.passwordField');
		if (event.target.checked) {
			passwordFields.forEach((passwordField) => {
				passwordField.style.display = 'block';
			});
		} else {
			passwordFields.forEach((passwordField) => {
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
	const userData = JSON.parse(localStorage.getItem('currentUser'));
	const urlParams = new URLSearchParams(window.location.search);
	let username = urlParams.get('username');
	if (!username) {
		username = JSON.parse(localStorage.getItem('currentUser')).username;
		if (!username) {
			history.pushState({}, "", "/");
			handleLocation();
			return;
		}
	} else if (username === userData.username) {
		history.pushState({}, "", "/profile");
	}
	const userContainer = document.getElementById('userContainer');
	let profileHTML;
	const profileResponse = await fetch("/users/profile.html", {
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
	const response = await fetch(`/users/get-user-profile/${username}/`, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + userData.accessToken
		},
	});
	if (response.ok) {
		const data = await response.json();
		console.log(data);
		data.friends.forEach(createFriendRow);
		const userName = document.getElementById('username');
		userName.innerText = data.username;
		const matchBodyEl = document.getElementById('matchHistoryBody');
		data.match_history.forEach((match) => {
			const matchRow = document.createElement('tr');
			const opponent = document.createElement('td');
			const score = document.createElement('td');
			const date = document.createElement('td');
			if (match.player1Name === userData.username) {
				opponent.innerText = match.player2Name;
			} else {
				opponent.innerText = match.player1Name;
			}
			score.innerText = match.player1Hp + ' - ' + match.player2Hp;
			if (match.winner === userData.username) {
				score.style.color = '#70d170';
			} else {
				score.style.color = 'red';
			}
			date.innerText = match.dateTime;
			matchRow.appendChild(opponent);
			matchRow.appendChild(score);
			matchRow.appendChild(date);
			matchBodyEl.appendChild(matchRow);
		})
	} else {
		showToast(somethingWentWrong, true);
		history.pushState({}, "", "/");
		handleLocation();
		return;
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
}

async function loginHandler() {
    const registerBox = document.getElementById('registerBox');
    if (registerBox) registerBox.remove();
    
    if (!window.loginFormHTML) {
        window.loginFormHTML = await fetchHTML("/users/login.html");
    }
    
    const uiElement = document.getElementById('ui');
    uiElement.innerHTML = ''; // Clear the UI container
    uiElement.insertAdjacentHTML('beforeend', window.loginFormHTML);

    // Add event listener to the login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

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
            const data = await response.json();
			currentUsername = formData.get('username');
            if (data.otp_required) {
                // Remove login form before loading OTP form
                loginForm.remove();
                await loadOtpForm();
            } else {
                alert('Login successful!');
                // Redirect or handle success
            }
        } else {
            alert('Login failed!');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again later.');
    }
}

async function loadOtpForm() {
    if (!window.otpFormHTML) {
        window.otpFormHTML = await fetchHTML("/users/qr_prompt.html");
    }
    
    const uiElement = document.getElementById('ui');
    uiElement.innerHTML = ''; // Clear the UI container
    uiElement.insertAdjacentHTML('beforeend', window.otpFormHTML);

    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        otpForm.addEventListener('submit', handleOtpSubmit);
    }

    // Optionally, insert user data into the OTP form if needed
    // Example: if the OTP form needs the username, you can do:
    // const usernameField = document.getElementById('usernameField');
    // if (usernameField && currentUsername) {
    //     usernameField.value = currentUsername.username;
    // }
}

async function handleOtpSubmit(event) {
    event.preventDefault();

    const otpForm = event.target;
    let otpFormData = new FormData(otpForm);

    // Optionally, append user data to the OTP form data if needed
    if (currentUsername) {
		otpFormData.append('username', currentUsername);
	}

    try {
        let otpResponse = await fetch('/users/validate-otp', {
            method: 'POST',
            body: otpFormData
        });

        if (otpResponse.ok) {
            const result = await otpResponse.json();
            alert('Login successful!');
            // Redirect or handle success
        } else {
            alert('Invalid OTP.');
        }
    } catch (error) {
        console.error('Error during OTP validation:', error);
        alert('An error occurred during OTP validation. Please try again later.');
    }
}

async function loginHandler2() {
	const userContainer = document.getElementById('userContainer');
	userContainer.innerHTML = "";
	if (!loginFormHTML)
		loginFormHTML = await fetch("/users/login.html").then((data) => data.text());
	userContainer.insertAdjacentHTML('beforeend', loginFormHTML);
    // Add event listener to the registration form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        // Get form data
        const formData = new FormData(loginForm);
        
        try {
            // Send form data to the backend
            const response = await fetch('/users/login-user', {
				method: 'POST',
				body: formData
            });
            if (response.ok) {
				const data = await response.json();
				currentUser.username = data.user.username;
				currentUser.id = data.user.id;
				currentUser.accessToken = data.tokens.access;
				currentUser.refreshToken = data.tokens.refresh;
				currentUser.lastActive = data.user.last_active;
				console.log(currentUser);
				localStorage.setItem('currentUser', JSON.stringify(currentUser));
                // Registration successful
                // Redirect to another page or handle the response as needed
				showToast(loginSuccess, false);
				history.pushState({}, "", "/");
				handleLocation();
            } else {
                showToast(loginFail, true);
            }
        } catch (error) {
            showToast(somethingWentWrong, true);
        }
	});
}




// async function loginHandler() {
// 	const registerBox = document.getElementById('registerBox');
// 	if (registerBox)
// 		registerBox.remove();
// 	if (!loginFormHTML)
// 		loginFormHTML = await fetch("/users/login.html").then((data) => data.text());
//     document.getElementById('ui').insertAdjacentHTML('beforeend', loginFormHTML);
//     // Add event listener to the registration form
//     const loginForm = document.getElementById('loginForm');
//     loginForm.addEventListener('submit', async (event) => {
//         event.prev entDefault(); // Prevent default form submission behavior

//         // Get form data
//         let formData = new FormData(loginForm);
        
//         try {
//             // Send form data to the backend
//             const response = await fetch('/users/login-user', {
//                 method: 'POST',
//                 body: formData
//             });

//             if (response.ok) {
//                 // Registration successful
//                 alert('Login successful!');
//                 // Redirect to another page or handle the response as needed
//             } else {
//                 // Registration failed
//                 alert('Login failed!');
//             }
//         } catch (error) {
//             console.error('Error couldnt login', error);
//             alert('An error occurred during registration. Please try again later.');
//         }
//     });
// }


async function registerHandler() {
	const loginBox = document.getElementById('loginBox');
	if (loginBox) {
		loginBox.remove();
	}

	if (!registerFormHTML) {
		registerFormHTML = await fetch("/users/register.html").then(response => {
			if (!response.ok) throw new Error('Failed to fetch registration form');
			return response.text();
		});
	}

	document.getElementById('ui').insertAdjacentHTML('beforeend', registerFormHTML);

	const registerForm = document.getElementById('registerForm');
	if (registerForm) {
		registerForm.addEventListener('submit', async (event) => {
			event.preventDefault(); // Prevent default form submission behavior

			const formData = new FormData(registerForm);

			try {
				const response = await fetch('/users/create-user', {
					method: 'POST',
					body: formData
				});

				if (response.ok) {
					const result = await response.json();

					if (result.otp && result.otp.html) {
						const qrHTML = result.otp.html;
						document.getElementById('ui').insertAdjacentHTML('beforeend', qrHTML);
					} else {
						alert('Registration successful');
					}
				} else {
					const errorData = await response.json();
					alert(`Registration failed: ${errorData.detail}`);
				}
			} catch (error) {
				console.error('Error registering user:', error);
				alert('An error occurred during registration. Please try again later.');
			}
		});
	} else {
		console.error('Register form not found');
	}
}

async function registerHandler2() {
	const userContainer = document.getElementById('userContainer');
	userContainer.innerHTML = "";
	if (!registerFormHTML) // we only fetch once and then save it locally
		registerFormHTML = await fetch("/users/register.html").then((data) => data.text());
    userContainer.insertAdjacentHTML('beforeend', registerFormHTML);
    // Add event listener to the registration form
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        // Get form data
		const formData = new FormData(registerForm);
        try {
            // Send form data to the backend
            const response = await fetch('/users/create-user', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showToast(registerSuccess, false);
				history.pushState({}, "", "/");
				handleLocation();
            } else {
                showToast(registerFail, true);
            }
        } catch (error) {
            showToast(somethingWentWrong, true);
        }
    });
}

// async function test() {
// 	const data = {
// 		username: 'pena123',
// 		email: 'qweds@dk.ff',
// 		password: 'Testisalis1234@',
// 		confirm_password: 'Testisalis1234@',
// 		enable_otp: 'true'
// 	};

// 	try {
// 		const response = await fetch('http://127.0.0.1:8000/users/create-user', {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json',
// 			},
// 			body: JSON.stringify(data)
// 		});

// 		if (response.ok) {
// 			const result = await response.json();
// 			const html = result.otp.html;
// 			document.getElementById('userContainer').insertAdjacentHTML('beforeend', html);
// 		} else {
// 			console.error('Error:', response.statusText);
// 		}
// 	} catch (error) {
// 		console.error('An error occurred:', error);
// 	}
// }

// function getCookie(name) {
// 	let cookieValue = null;
// 	if (document.cookie && document.cookie !== '') {
// 		const cookies = document.cookie.split(';');
// 		for (let i = 0; i < cookies.length; i++) {
// 			const cookie = cookies[i].trim();
// 			if (cookie.substring(0, name.length + 1) === (name + '=')) {
// 				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
// 				break;
// 			}
// 		}
// 	}
// 	return cookieValue;
// }

async function pongHandler() {
    const html = await fetch("/pong/").then((data) => data.text());
	document.getElementById('ui').style.display = 'none'; // Using display
	document.getElementById('ui').style.visibility = 'hidden';
	window.pong.gameGlobals.gameState = GameStates.PLAYING;
}

async function handleLocation() {
	handleSidePanel();
	const url = new URL(window.location.href);
	currentRoute = url;
	const path = url.pathname;
	const handler = routes[path] || routes["/404"];
	await handler();
}

let currentRoute = "";

window.route = (event) => {
    event.preventDefault();
    const href = event.currentTarget.href;
    if (href !== currentRoute) { // Check if the new route is different from the current one
        currentRoute = href;
        window.history.pushState({}, "", currentRoute);
        handleLocation();
    }
};


window.pong.gameLoop();
window.onpopstate = handleLocation;
handleLocation();