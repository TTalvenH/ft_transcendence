import { router } from "./router.js";
import { Pong } from "./pong/pong.js";
import { gameHandler } from "./gameHandler.js";
import { loginHandler, registerHandler, editProfileHandler, profileHandler, tournamentInfoHandler, homeHandler } from "./userHandler.js";

const pong = new Pong();

router.set('/', homeHandler);
router.set('/login', loginHandler);
router.set('/register', registerHandler);
router.set('/edit-profile', editProfileHandler);
router.set('/match', gameHandler);
router.set('/profile', profileHandler);
router.set('/tournament', tournamentInfoHandler);



window.route = (event) => {
    event.preventDefault();
	const newPath = new URL(event.currentTarget.href).pathname;
	console.log('haloooo');
	if (router.currentPath === newPath && router.currenSearchParams === event.currentTarget.search) {
		return ;
	}
	window.history.pushState({}, "", event.currentTarget.href);
	router.handleLocation();
};

pong.gameLoop();

window.onpopstate = () => router.handleLocation();

router.handleLocation();

export { pong  }