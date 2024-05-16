import { GameStates } from "./pong/pong.js";

//variables where we save the html content when it is first fetched
let loginFormHTML;
let registerFormHTML;
const loginSuccess = '<i class="fa-regular fa-circle-check"></i> Login Success';
const loginFail = '<i class="fa-regular fa-circle-xmark"></i> Login Fail';
const registerSuccess = '<i class="fa-regular fa-circle-xmark"></i> Registeration Success';
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
	const userContainer = document.getElementById('userContainer');
	const updateProfileHTML = await fetch("/users/update_profile.html").then((data) => data.text());
	userContainer.innerHTML = "";
	userContainer.insertAdjacentHTML('beforeend', updateProfileHTML);
	const updateProfileForm = document.getElementById('updateProfileForm');
	updateProfileForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		const formData = new FormData(updateProfileForm);
		const response = await fetch('/users/update-user', {
			method: 'PUT',
			body: formData
		});
		if (response.ok) {
			showToast(profileSuccess, false);
		} else {
			showToast(somethingWentWrong, true);
		}
	});

	const input = document.getElementById('imageInput');
	const profileImage = document.getElementById('profileImage');
	input.addEventListener('change', async (event) => {
		var file = input.files[0];
		if (file) {
			var reader = new FileReader();
			reader.onload = function(e) {
				// Replace the image source with the selected image
				profileImage.src = e.target.result;
				profileImage.onload = function() {
					// Make sure the image is loaded before displaying it
					profileImage.style.display = 'block';
				}
			}
			reader.readAsDataURL(file);
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
	const friendName = document.createElement('td');
	const friendStatus = document.createElement('td');
	
	friendName.innerText = friend.username;
	friendStatus.innerText = '•';
	friendStatus.style.textAlign = 'center';
	
	if (friend.is_active) {
		friendStatus.style.color = '#70d170';
	} else {
		friendStatus.style.color = 'red';
	}
	
	friendRow.appendChild(friendName);
	friendRow.appendChild(friendStatus);
	friendBodyEl.appendChild(friendRow);
}

async function profileHandler() {
	const userContainer = document.getElementById('userContainer');
	const profileHTML = await fetch("/users/profile.html").then((data) => data.text());
	userContainer.innerHTML = "";
	userContainer.insertAdjacentHTML('beforeend', profileHTML);

	const userData = JSON.parse(localStorage.getItem('currentUser'));
	console.log(userData);
	const response = await fetch(`/users/get-user-profile/${userData.username}/`, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + userData.accessToken
		},
	});
	if (response.ok) {
		const data = await response.json();
		console.log(data);
		data.friends.forEach(createFriendRow);

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
	}
	const addFriendButton = document.getElementById('addFriendButton');
	addFriendButton.addEventListener('click', async (event) => {
		event.preventDefault();
		const friendInput = document.getElementById('friendInput');
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
	});
}

async function loginHandler() {
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


async function registerHandler() {
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


async function pongHandler() {
    const html = await fetch("/pong/").then((data) => data.text());
	document.getElementById('ui').style.display = 'none'; // Using display
	document.getElementById('ui').style.visibility = 'hidden';
	window.pong.gameGlobals.gameState = GameStates.PLAYING;
}

async function handleLocation() {
	handleSidePanel();
	const path = window.location.pathname;
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
