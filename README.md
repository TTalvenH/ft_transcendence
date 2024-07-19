# ft_transcendence

Welcome to **ft_transcendence**, a single-page application where the classic game of Pong is reimagined. Dive into the nostalgia of arcade gaming with modern twists and features.

![screenshot](https://github.com/user-attachments/assets/99c925e7-6f0f-45fe-bf4e-a48a16498a9c)


## Features

- **Single-Page Application**: Smooth navigation with browser's Back and Forward buttons.
- **Compatibility**: Fully compatible with the latest stable version of Google Chrome.
- **Live Pong Game**: Engage in 1v1 battles or join a tournament mode for more competitive play.
- **User Registration**: Sign up, log in, add friends, and personalize your profile for the tournaments.
- **Matchmaking System**: Organized pairing for tournament plays, announcing upcoming matches.
- **Two-Factor Authentication**: Extra layer of security with 2FA.
- **Security**: Enhanced protection against common web vulnerabilities and secure HTTPS connections.
- **JSON web tokens**: JSON web token implementation for scalability and security.

## Modules Utilized

- **Backend Framework**: Django REST for a robust backend experience.
- **Frontend Toolkit**: Bootstrap for responsive and intuitive UI/UX design.
- **Database**: PostgreSQL for consistent and reliable data management.
- **User Management**: Standard user authentication, profile customization, and friend system.
- **Game Customization**: Tailor your Pong game with various power-ups and maps.
- **Two-Factor Authentication**: Extra layer of security with 2FA and JWT implementation.
- **Advanced 3D Graphics**: ThreeJS/WebGL for an immersive visual experience.
- **Another game**: Added another game called Knockoff using ThreeJS/WebGL.
- **Expanding Browser Compatibility**: Project works best with chrome but should work with other browsers aswell.

## Quick Start

Launch the project with ease using Docker:

with makefile:
```bash
make
```

or with Docker Compose:
```bash
docker-compose up --build -d
```

then open latest version of chrome and locate to
```bash
https://localhost:8000
```

when you want to close the site:
```bash
make fclean
```
or
```bash
docker-compose down
```

## How to Play

### Pong

- **Player One**: Use the **Up** and **Down** arrow keys to move your paddle up and down.
- **Player Two**: Use the **W** key to move your paddle up and the **S** key to move your paddle down.

### Knockoff Game

- **Player One**: Use the **Up**, **Down**, **Left**, and **Right** arrow keys to move in all directions.
- **Player Two**: Use the **W**, **A**, **S**, and **D** keys to move in all directions.

## Videos

### Registration and Login System
[![Watch the video](https://img.youtube.com/vi/dWnPV6us0lA/0.jpg)](https://www.youtube.com/watch?v=dWnPV6us0lA&ab_channel=EetuKoljonen)
### Pong game
[![Watch the video](https://img.youtube.com/vi/bScU6FsHiWQ/0.jpg)](https://www.youtube.com/watch?v=bScU6FsHiWQ&ab_channel=EetuKoljonen)
### Knockoff game
[![Watch the video](https://img.youtube.com/vi/yRv9RnrHI-Q/0.jpg)](https://www.youtube.com/watch?v=yRv9RnrHI-Q&ab_channel=EetuKoljonen)
## Two-Factor authentication
[![Watch the video](https://img.youtube.com/vi/Vh5YpbQqU6c/0.jpg)](https://www.youtube.com/watch?v=Vh5YpbQqU6c&ab_channel=EetuKoljonen)
