import { Router } from "./router";
import { User } from "./user";

const router = new Router();
const user = new User();

router.set('/', homeHandler);

router.set('/login', loginHandler);

router.set('/register', registerHandler);

router.set('/edit-profile', editProfileHandler);

router.set('/match', gameHandler);

router.set('/profile', profileHandler);

router.set('/tournament', tournamentInfoHandler);

export { user }