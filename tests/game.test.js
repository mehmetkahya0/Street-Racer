const { Car } = require('../src/js/car');
const { Track } = require('../src/js/track');
const { selectRandomCar } = require('../src/js/utils');

describe('Car Selection', () => {
    test('should select a car randomly from available options', () => {
        const cars = [new Car('Car1', 10), new Car('Car2', 15), new Car('Car3', 20)];
        const selectedCar = selectRandomCar(cars);
        expect(cars).toContain(selectedCar);
    });
});

describe('Race Mechanics', () => {
    let track;
    let car1;
    let car2;

    beforeEach(() => {
        track = new Track(100);
        car1 = new Car('Car1', 10);
        car2 = new Car('Car2', 15);
    });

    test('should move cars towards the finish line', () => {
        car1.move();
        car2.move();
        expect(car1.position).toBeGreaterThan(0);
        expect(car2.position).toBeGreaterThan(0);
    });

    test('should declare the winner correctly', () => {
        car1.position = 100;
        car2.position = 90;
        expect(track.declareWinner(car1, car2)).toBe(car1.name);
    });
});