import { pong } from "./main.js";
import { cancelButtonClick, circle_xmark, showToast } from "./utils.js"
import { currentUser } from "./user.js"
import { router } from "./router.js"

async function gameHandler() {
	const userData = currentUser.getUser();
	if (!userData) {
		history.pushState({}, "", "/");
		router.handleLocation();
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
		showToast(circle_xmark + 'Something went wrong', true);
	}

	document.getElementById('one_v_one').addEventListener('click', one_v_oneHandler);

	document.getElementById('controls').addEventListener('click', controlsHandler);

	document.getElementById('tournament').addEventListener('click', tournamentHandler);
}

function guestButtonClick() {
	const startGameButton = document.getElementById('startGame');
	const buttons = document.getElementById('buttons');
	const guestHeader = document.getElementById('guestHeader');

	buttons.remove();
	guestHeader.style.display = "block";
	startGameButton.style.display = "block";
}

function userButtonClick() {
	const startGameButton = document.getElementById('startGame');
	const buttons = document.getElementById('buttons');
	buttons.remove();

	const username = document.getElementById('username');
	username.style.display = "block";
	startGameButton.style.display = "block";
}

function one_v_oneStartButtonClick(mode) {
	const userData = currentUser.getUser();
	currentUser.refreshToken();
	if (mode === "guest") {
		const ui = document.getElementById('ui');
		ui.style.display = 'none';
		userContainer.innerHTML = "";
		const data = {
			tournament_match: false,
			player1: {
				username: userData.username,
				id: userData.id
			},
			player2: {
				username: "Guest",
				id: null
			}
		};
		pong.startGame(data);
		return;
	}
	const username_input = document.getElementById('username_input');
	if (username_input) {
		const username = username_input.value;
		if (!username) {
			showToast(circle_xmark + 'Please enter a username', true);
			return;
		}
		fetch(`/users/get-user/${username}/`, {
			method: "POST",
			headers: {
				'Authorization': `Bearer ${userData.accessToken}`,
			}
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('User fetch failed');
			}
			return response.json();
		})
		.then(player2Data => {
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
			};
			pong.startGame(data);
		})
		.catch(error => {
			showToast(circle_xmark + 'Something went wrong', true);
		});
	}
}

function one_v_oneHandler() {
	const userData = currentUser.getUser();
	fetch("/pong/1v1.html", {
		method: "GET",
		headers: {
			'Authorization': `Bearer ${userData.accessToken}`,
		}
	})
	.then(one_v_oneResponse => {
		if (!one_v_oneResponse.ok) {
			throw new Error('Failed to fetch 1v1 HTML');
		}
		return one_v_oneResponse.text();
	})
	.then(one_v_oneHTML => {
		const userContainer = document.getElementById('userContainer');
		userContainer.innerHTML = "";
		userContainer.insertAdjacentHTML('beforeend', one_v_oneHTML);
		let mode = 'guest';
		
		document.getElementById('guestButton').addEventListener('click', guestButtonClick);

		// Using arrow functions to pass the correct arguments without immediate invocation
		document.getElementById('userButton').addEventListener('click', () => {
			mode = 'user'
			userButtonClick();
		});

		document.getElementById('cancel').addEventListener('click', () => cancelButtonClick("/match"));

		document.getElementById('startGame').addEventListener('click', () => one_v_oneStartButtonClick(mode));
	})
	.catch(error => {
		showToast(circle_xmark + 'Something went wrong', true);
	});
}

function controlsHandler() {
	const userData = currentUser.getUser();
	if (!userData) {
		return;
	}
	const userContainer = document.getElementById('userContainer');
	userContainer.innerHTML = "";

	fetch("/pong/controls.html", {
		method: "GET",
		headers: {
			'Authorization': `Bearer ${userData.accessToken}`,
		}
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Failed to fetch controls HTML');
		}
		return response.text();
	})
	.then(html => {
		userContainer.insertAdjacentHTML('beforeend', html);
		document.getElementById('cancel').addEventListener('click', () => cancelButtonClick("/match"));
	})
	.catch(error => {
		showToast(circle_xmark + 'Something went wrong', true);
	});
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
		router.handleLocation();
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

		document.getElementById('cancel').addEventListener('click', () => cancelButtonClick("/match"));

		let players = [{username: userData.username, id: userData.id}];
		const addPlayerButtons = document.querySelectorAll('.addUserButton');
		for (let i = 0; i < addPlayerButtons.length; i++) {
			addPlayerButtons[i].addEventListener('click', async () => {
				currentUser.refreshToken();
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
					showToast(circle_xmark + 'Something went wrong', true);
				}
			})
		}
		
		const startTournament = document.getElementById('startTournament');
		startTournament.addEventListener('click', async () => {
			if (players.length < 4) {
				showToast(circle_xmark + 'Please add at least 3 players', true);
				return ;
			}
			if (pong.gameGlobals.gameState !== GameStates.MENU) {
				showToast(circle_xmark + 'Game loading', true);
				return ;
			}
			shuffleArray(players);
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
				nextMatch(tournamentData[0], 'Match One');
			} else {
				showToast(circle_xmark + 'Something went wrong', true);
			}
		})
	} else {
		showToast(circle_xmark + 'Something went wrong', true);
	}
}

let tournamentData = null;

function nextMatch(gameData, matchHeaderText) {
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

	const matchHeader = document.getElementById('matchHeader');
	matchHeader.innerText = matchHeaderText;

	const nextMatch = document.getElementById('nextMatch');
	nextMatch.addEventListener('click', async () => {
		if (pong.gameGlobals.gameState !== GameStates.MENU) {
			showToast(circle_xmark + 'Game loading', true);
			return ;
		}
		userContainer.innerHTML = "";
		pong.startGame(gameData);
	})
}

let isTournament = false;
let matchIds = [];

async function handleTournamentData(data, gameData) {
	const userData = JSON.parse(localStorage.getItem('currentUser'));
	matchIds.push(data.id);
	const winner = gameData.player1Hp > gameData.player2Hp ? {username: gameData.player1Name, id: gameData.player1} : {username: gameData.player2Name, id: gameData.player2};
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
			showToast(circle_xmark + 'Something went wrong', true);
		}
		matchIds = [];
		isTournament = false;
	} else {
		let matchHeader = 'Match Two'
		if (matchIds.length === 2)
			matchHeader = 'Final Match'
		nextMatch(tournamentData[matchIds.length], matchHeader);
	}
}

async function handleMatchEnd(gameData) {
	const userData = JSON.parse(localStorage.getItem('currentUser'));
	if (gameData) {
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
				await handleTournamentData(data, gameData);
			}
		} else {
			showToast(circle_xmark + 'Something went wrong', true);
		}
		if (!isTournament) {
			if (matchIds.length > 0) {
				matchIds = [];
				isTournament = false;
			}
			const ui = document.getElementById('ui');
			ui.style.display = 'block';
			const sidePanelDiv = document.getElementById('sidePanelDiv');
			sidePanelDiv.style.display = 'block';
			router.handleLocation();
		}
	}
}

export { handleMatchEnd, gameHandler }
