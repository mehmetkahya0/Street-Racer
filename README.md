# 2D Drag Racing Game

## Overview
This project is a 2D drag racing game built using HTML, CSS, and JavaScript. Players can select their cars, and the computer will randomly select a car for the race. The game features a straight track with a finish line.

## Project Structure
```
2d-race-game
├── src
│   ├── js
│   │   ├── game.js        # Main game logic
│   │   ├── car.js         # Car class definition
│   │   ├── track.js       # Track class definition
│   │   └── utils.js       # Utility functions (getRandomInt, delay, formatTime, calculateDistance)
│   ├── css
│   │   └── styles.css     # Game styles
│   └── index.html         # Main HTML file
├── assets
│   ├── audio
│   │   └── sounds.js      # Audio management
│   └── sprites
│       └── sprites.js     # Sprite management
├── tests
│   └── game.test.js       # Unit tests
├── package.json            # NPM configuration
└── README.md               # Project documentation
```

## Setup Instructions
1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Run `npm install` to install the necessary dependencies.
4. Run `npm start` to start the live server and open `src/index.html` in your web browser to start the game.

## Gameplay
- Select your car from the car selection screen.
- The computer will randomly select a car.
- Race on a straight track and see who reaches the finish line first!

## License
This project is licensed under the MIT License.