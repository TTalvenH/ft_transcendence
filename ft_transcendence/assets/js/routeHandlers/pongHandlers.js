import { GameStates, Pong } from "../pong/pong.js";

async function pongStartHandler() {
    const html = await fetch("/pong/start").then((data) => data.text());
    pong.pongStart(playerData);
}
async function pongMatchOverHandler() {
    const html = await fetch("/pong/matchover").then((data) => data.text());
}

export {
	pongStartHandler,
	pongMatchOverHandler,
};
