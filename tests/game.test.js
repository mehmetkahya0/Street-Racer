import { Car } from '../src/js/car.js';
import { Track } from '../src/js/track.js';
import { selectRandomCar } from '../src/js/utils.js';

describe('Car Selection', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="track-container">
                <div id="finish-line"></div>
            </div>
            <div id="current-speed"></div>
            <div id="boost-bar"></div>
        `;
    });

    test('should select a car randomly from available options', () => {
        const cars = [
            { name: 'Car1', speed: 10 },
            { name: 'Car2', speed: 15 },
            { name: 'Car3', speed: 20 }
        ];
        const selectedCar = selectRandomCar(cars);
        expect(cars).toContainEqual(selectedCar);
    });
});

describe('Race Mechanics', () => {
    let track;
    let playerCar;
    let computerCar;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="track-container">
                <div id="finish-line"></div>
            </div>
            <div id="current-speed"></div>
            <div id="boost-bar"></div>
        `;
        
        track = new Track();
        playerCar = new Car('player', 'test-car.png', { speed: 10, acceleration: 0.2 });
        computerCar = new Car('computer', 'test-car.png', { speed: 15, acceleration: 0.2 });
    });

    test('cars should start at position 50', () => {
        playerCar.startRace();
        computerCar.startRace();
        expect(playerCar.position).toBe(50);
        expect(computerCar.position).toBe(50);
    });

    test('boost should increase speed', () => {
        playerCar.startRace();
        playerCar.setAccelerating(true);
        const normalSpeed = playerCar.currentSpeed;
        playerCar.activateBoost(true);
        expect(playerCar.currentSpeed).toBeLessThanOrEqual(normalSpeed * playerCar.boostMultiplier);
    });
});