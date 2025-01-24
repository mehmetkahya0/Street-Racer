export class Track {
    constructor() {
        this.element = document.getElementById('track-container');
        this.width = window.innerWidth;
        this.init();
    }

    init() {
        this.element.innerHTML = '';
        
        // Set track container dimensions
        this.element.style.width = '100vw';
        this.element.style.height = '100vh';
        this.element.style.position = 'fixed';
        this.element.style.left = '0';
        this.element.style.top = '0';
        
        // Lanes container
        const lanesContainer = document.createElement('div');
        lanesContainer.className = 'lanes-container';
        lanesContainer.style.width = '100%';
        
        // Create lanes
        const computerLane = document.createElement('div');
        computerLane.className = 'lane computer-lane';
        
        const playerLane = document.createElement('div');
        playerLane.className = 'lane player-lane';
        
        lanesContainer.appendChild(computerLane);
        lanesContainer.appendChild(playerLane);
        this.element.appendChild(lanesContainer);

        // Create finish line at 80% of screen width
        const finishLine = document.createElement('div');
        finishLine.id = 'finish-line';
        const finishPosition = Math.floor(window.innerWidth * 0.8);
        finishLine.style.left = `${finishPosition}px`;
        this.element.appendChild(finishLine);

        this.lanesContainer = lanesContainer;
    }

    addCar(car) {
        // Remove any existing instances
        if (car.element.parentNode) {
            car.element.parentNode.removeChild(car.element);
        }

        // Add car to track
        this.element.appendChild(car.element);
        
        // Get correct lane
        const lane = this.lanesContainer.querySelector(
            car.type === 'player' ? '.player-lane' : '.computer-lane'
        );
        
        // Calculate positions
        const laneRect = lane.getBoundingClientRect();
        const startPosition = 50;
        
        // Position car
        car.element.style.visibility = 'hidden';
        car.element.style.left = `${startPosition}px`;
        car.position = startPosition;
        
        // Center car in lane
        const carTop = laneRect.top + (laneRect.height - car.element.offsetHeight) / 2;
        car.element.style.top = `${carTop}px`;
        
        // Set z-index and make visible
        car.element.style.zIndex = car.type === 'player' ? 3 : 2;
        requestAnimationFrame(() => {
            car.element.style.visibility = 'visible';
        });
    }
}