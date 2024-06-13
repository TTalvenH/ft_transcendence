import { pong, router } from "./main.js"
import { currentUser } from "./user.js";

const circle_xmark = '<i class="fa-regular fa-circle-xmark"></i>';
const circle_check = '<i class="fa-regular fa-circle-check"></i>';

const gameToggle = document.getElementById('check');
gameToggle.addEventListener('change', (event) => {
	pong.changeGame();
	gameToggle.disabled = true;
});

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
logoutButton.addEventListener('click', async () => {
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
        showToast(circle_check + 'You are now logged out', false);
        history.pushState({}, "", "/");
        router.handleLocation();
    } else {
        showToast(circle_xmark + 'Log out failed', true);
    }
});

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

function cancelButtonClick(path) {
	console.log('mulli2');

	history.pushState({}, "", path);
	router.handleLocation();
}

export { showToast, handleSidePanel, createFriendRow, cancelButtonClick, circle_check, circle_xmark }