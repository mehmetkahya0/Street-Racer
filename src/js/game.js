import { Car } from './car.js';
import { Track } from './track.js';
import { sprites } from '../../assets/sprites/sprites.js';
import { playSound } from '../../assets/audio/sounds.js';
import { getRandomInt, delay } from './utils.js';

class Game {
    constructor() {
        this.track = new Track();
        this.init();
        this.bindEvents();
        this.raceFinished = false; // Yeni: yarış bitişini kontrol etmek için
        this.setupRaceFinishListener();
    }

    bindEvents() {
        document.getElementById('start-race').addEventListener('click', () => this.startRace());
    }

    async init() {
        try {
            await this.loadAssets();
            document.getElementById('loading-screen').style.display = 'none';
            document.querySelector('.game-wrapper').style.display = 'flex';
            this.initCarSelection();

            // Add at the beginning of your game initialization
            const accelerateBtn = document.getElementById('accelerateBtn');
            const turboBtn = document.getElementById('turboBtn');

            // Mobile control event listeners
            if (accelerateBtn && turboBtn) {
                accelerateBtn.addEventListener('touchstart', () => {
                    keys.ArrowRight = true;
                });

                accelerateBtn.addEventListener('touchend', () => {
                    keys.ArrowRight = false;
                });

                turboBtn.addEventListener('touchstart', () => {
                    keys.Space = true;
                });

                turboBtn.addEventListener('touchend', () => {
                    keys.Space = false;
                });
            }
        } catch (error) {
            console.error('Failed to initialize game:', error);
            document.getElementById('loading-screen').innerHTML = `
                <div class="error-message">
                    Failed to load game assets. Please refresh the page.
                </div>
            `;
        }
    }

    async loadAssets() {
        const imagePromises = [];
        
        // Load player car images
        sprites.cars.player.forEach(car => {
            imagePromises.push(this.preloadImage(car.url).catch(err => {
                console.warn(`Failed to load image for ${car.name}:`, err);
                return Promise.resolve(); // Continue despite error
            }));
        });
        
        // Load computer car images
        sprites.cars.computer.forEach(car => {
            imagePromises.push(this.preloadImage(car.url).catch(err => {
                console.warn(`Failed to load image for ${car.name}:`, err);
                return Promise.resolve(); // Continue despite error
            }));
        });

        return Promise.all(imagePromises);
    }

    preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = url;
        });
    }

    initCarSelection() {
        const carSelectionGrid = document.querySelector('.car-selection-grid');
        carSelectionGrid.innerHTML = ''; // Clear existing options
        
        sprites.cars.player.forEach(car => {
            // Convert speed to km/h (base speed * multiplier)
            const topSpeed = Math.floor(car.speed * 280); // 280 km/h max speed
            // Convert acceleration to 0-100 time in seconds
            const accelTime = (10 - (car.acceleration * 8)).toFixed(1); // Lower is better, range 2-10 seconds

            const carElement = document.createElement('div');
            carElement.className = 'car-option';
            carElement.innerHTML = `
                <img src="${car.url}" alt="${car.name}">
                <h3>${car.name}</h3>
                <div class="car-stats">
                    <div>Top Speed: ${topSpeed} km/h</div>
                    <div>0-100 km/h: ${accelTime}s</div>
                </div>
            `;
            carElement.onclick = () => this.selectCar(car);
            carSelectionGrid.appendChild(carElement);
        });

        // Show car selection screen
        document.getElementById('car-selection').classList.add('active');
    }

    async selectCar(car) {
        const allCarOptions = document.querySelectorAll('.car-option');
        allCarOptions.forEach(option => option.classList.remove('selected'));
        
        event.currentTarget.classList.add('selected');
        
        // Convert display values to game mechanics values
        const topSpeed = car.speed * 280;
        const accelTime = 10 - (car.acceleration * 8);
        
        // Update stats display
        document.getElementById('speed-stat').style.width = `${(topSpeed / 280) * 100}%`;
        document.getElementById('speed-value').textContent = `${topSpeed} km/h`;
        document.getElementById('accel-stat').style.width = `${((10 - accelTime) / 8) * 100}%`;
        document.getElementById('accel-value').textContent = `${accelTime}s`;
        
        // Create cars with converted values
        this.playerCar = new Car('player', car.url, {
            speed: car.speed * 5,
            acceleration: car.acceleration * 0.2
        });
        
        // Bilgisayar arabası - rastgele seç
        const computerCars = sprites.cars.computer;
        const randomCar = computerCars[Math.floor(Math.random() * computerCars.length)];
        
        // Bilgisayar arabasını oluştur
        this.computerCar = new Car('computer', randomCar.url, {
            speed: randomCar.speed * 5,
            acceleration: randomCar.acceleration * 0.2
        });
        this.computerCar.name = randomCar.name; // İsmi sakla
        
        // Stats güncelle
        document.getElementById('speed-stat').style.width = `${car.speed * 100}%`;
        document.getElementById('accel-stat').style.width = `${car.acceleration * 100}%`;
        document.getElementById('start-race').disabled = false;
    }

    async startRace() {
        if (!this.playerCar || !this.computerCar) return;

        // Ekranları düzgün şekilde değiştir
        document.getElementById('car-selection').classList.add('hidden');
        const raceDisplay = document.getElementById('race-display');
        raceDisplay.style.display = 'block';
        
        // Pisti hazırla
        this.track = new Track();
        
        // Pistin tamamen yüklenmesini bekle
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Araçları ekle
        this.track.addCar(this.playerCar);
        this.track.addCar(this.computerCar);

        // UI sıfırla
        document.getElementById('current-speed').textContent = '0';
        document.getElementById('boost-bar').style.transform = 'scaleX(1)';
        
        // Kontrolleri ayarla
        this.setupControls();

        // Geri sayım
        const countDown = document.createElement('div');
        countDown.className = 'countdown';
        raceDisplay.appendChild(countDown);
        
        for (let i = 3; i > 0; i--) {
            countDown.textContent = i;
            playSound('raceStart');
            await delay(1000);
        }
        
        countDown.textContent = 'GO!';
        playSound('raceStart');
        await delay(500);
        countDown.remove();

        // Yarışı başlat
        this.playerCar.startRace();
        this.computerCar.startRace();
        this.startRaceTimer();
        this.raceFinished = false; // Yarış başlarken sıfırla
    }

    setupControls() {
        const handleKeyDown = (e) => {
            if (e.code === 'ArrowRight' || e.code === 'Space') {
                e.preventDefault();
                this.playerCar.setAccelerating(true);
            } else if (e.code === 'ShiftLeft') {
                e.preventDefault();
                this.playerCar.activateBoost(true);
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === 'ArrowRight' || e.code === 'Space') {
                e.preventDefault();
                this.playerCar.setAccelerating(false);
            } else if (e.code === 'ShiftLeft') {
                e.preventDefault();
                this.playerCar.activateBoost(false);
            }
        };

        // Remove any existing listeners
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);

        // Add new listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Mobile controls
        const accelerateBtn = document.getElementById('accelerateBtn');
        const turboBtn = document.getElementById('turboBtn');

        if (accelerateBtn && turboBtn) {
            const touchHandlers = {
                accelerateStart: (e) => {
                    e.preventDefault();
                    this.playerCar.setAccelerating(true);
                },
                accelerateEnd: (e) => {
                    e.preventDefault();
                    this.playerCar.setAccelerating(false);
                },
                turboStart: (e) => {
                    e.preventDefault();
                    this.playerCar.activateBoost(true);
                },
                turboEnd: (e) => {
                    e.preventDefault();
                    this.playerCar.activateBoost(false);
                }
            };

            accelerateBtn.addEventListener('touchstart', touchHandlers.accelerateStart);
            accelerateBtn.addEventListener('touchend', touchHandlers.accelerateEnd);
            turboBtn.addEventListener('touchstart', touchHandlers.turboStart);
            turboBtn.addEventListener('touchend', touchHandlers.turboEnd);
        }
    }

    startRaceTimer() {
        const startTime = performance.now();
        let lastTime = 0;
        
        const updateTimer = () => {
            if (!this.isRacing) return;
            
            const currentTime = performance.now();
            const elapsed = currentTime - startTime;
            
            // Only update if a new second has passed
            if (Math.floor(elapsed/1000) > Math.floor(lastTime/1000)) {
                const totalSeconds = Math.floor(elapsed / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                
                const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                document.getElementById('race-time').textContent = timeStr;
            }
            
            lastTime = elapsed;
            
            // Check race completion
            if (this.playerCar?.position >= window.innerWidth * 0.8 || 
                this.computerCar?.position >= window.innerWidth * 0.8) {
                this.isRacing = false;
                this.endRace();
                return;
            }
            
            requestAnimationFrame(updateTimer);
        };

        this.isRacing = true;
        requestAnimationFrame(updateTimer);
    }

    endRace() {
        if (this.raceFinished) return;
        this.raceFinished = true;

        this.playerCar?.stopRace();
        this.computerCar?.stopRace();
        
        const playerDistance = this.playerCar.getDistance();
        const computerDistance = this.computerCar.getDistance();
        
        this.showRaceResults(playerDistance >= computerDistance);
    }

    setupRaceFinishListener() {
        window.addEventListener('raceFinished', (event) => {
            const { winner, position, car } = event.detail;
            this.showRaceResults(winner === 'player');
        });
    }

    showRaceResults(isPlayerWinner) {
        // Ensure race display is hidden
        document.getElementById('race-display').style.display = 'none';
        
        // Show results screen
        const resultsScreen = document.getElementById('race-results');
        const resultTitle = resultsScreen.querySelector('.result-title');
        
        if (isPlayerWinner) {
            resultTitle.innerHTML = `🏆 YOU WIN! 🏆<br><small>You beat ${this.computerCar.name}!</small>`;
            playSound('raceFinish');
        } else {
            resultTitle.innerHTML = `😢 YOU LOSE! 😢<br><small>${this.computerCar.name} was faster!</small>`;
            playSound('carCrash');
        }
        
        // Show results screen
        resultsScreen.style.display = 'block';
        
        // Setup buttons
        document.getElementById('play-again').onclick = () => this.restartRace();
        document.getElementById('back-to-menu').onclick = () => this.backToMenu();
    }

    async restartRace() {
        // Sonuç ekranını gizle
        document.getElementById('race-results').style.display = 'none';
        document.getElementById('race-display').style.display = 'none';
        
        // Yeni yarış için state'i sıfırla
        this.raceFinished = false;
        
        // Yeni araçlar oluştur
        const currentPlayerCar = this.playerCar;
        const currentComputerCar = this.computerCar;
        
        this.playerCar = new Car('player', currentPlayerCar.element.style.backgroundImage.slice(5, -2), {
            speed: currentPlayerCar.maxSpeed,
            acceleration: currentPlayerCar.acceleration
        });
        
        this.computerCar = new Car('computer', currentComputerCar.element.style.backgroundImage.slice(5, -2), {
            speed: currentComputerCar.maxSpeed,
            acceleration: currentComputerCar.acceleration
        });

        // Yeni yarışı başlat
        await this.startRace();
    }

    backToMenu() {
        // Tüm ekranları temizle
        document.getElementById('race-results').style.display = 'none';
        document.getElementById('race-display').style.display = 'none';
        
        // State'i sıfırla
        this.raceFinished = false;
        
        // Car selection ekranını göster
        const carSelection = document.getElementById('car-selection');
        carSelection.style.display = 'flex';
        carSelection.classList.remove('hidden');
        
        // Yeni seçim için hazırla
        this.initCarSelection();
    }
}

// Initialize game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});