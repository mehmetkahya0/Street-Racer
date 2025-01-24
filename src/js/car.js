export class Car {
    constructor(type, spriteUrl, stats = {}) {
        this.type = type;
        this.element = document.createElement('div');
        this.element.className = `car ${type}-car`;
        this.element.style.backgroundImage = `url(${spriteUrl})`;
        this.speed = 0;
        this.position = 0;
        this.maxSpeed = stats.speed || 5;
        this.acceleration = stats.acceleration || 0.2;
        this.deceleration = 0.1; // New: deceleration rate
        this.boostMultiplier = 1.5; // New: boost speed multiplier
        this.boost = 100;
        this.isBoostActive = false;
        this.isRacing = false;
        this.isAccelerating = false; // Yeni: gaz pedalı kontrolü
        this.lastTimestamp = null;
        this.currentSpeed = 0; // Gerçek hız değeri için yeni değişken
    }

    startRace() {
        // Reset states
        this.speed = 0;
        this.position = 50; // Start from 50px
        this.currentSpeed = 0;
        this.boost = 100;
        this.isBoostActive = false;
        this.isAccelerating = false;
        this.isRacing = true;
        
        // Reset visual position without animation
        this.element.style.transition = 'none';
        this.element.style.left = `${this.position}px`;
        
        // Re-enable animations after initial positioning
        requestAnimationFrame(() => {
            this.element.style.transition = 'left 0.1s linear';
        });
        
        this.lastFrame = null;
        requestAnimationFrame(this.animate);
    }

    animate = (timestamp) => {
        if (!this.isRacing) return;

        if (!this.lastTimestamp) this.lastTimestamp = timestamp;
        const deltaTime = (timestamp - this.lastTimestamp) / 16.67;
        this.lastTimestamp = timestamp;

        // Improved speed calculations
        if (this.type === 'player') {
            let targetSpeed = 0;
            
            if (this.isAccelerating) {
                targetSpeed = this.maxSpeed;
                if (this.isBoostActive && this.boost > 0) {
                    targetSpeed *= this.boostMultiplier;
                    this.boost = Math.max(0, this.boost - deltaTime);
                }
            }

            // Smoother acceleration/deceleration
            const speedChange = this.isAccelerating ? 
                this.acceleration * deltaTime : 
                -this.deceleration * deltaTime;
            
            this.currentSpeed = Math.max(0, Math.min(
                this.currentSpeed + speedChange,
                targetSpeed
            ));
        } else {
            // Improved AI car behavior
            const targetSpeed = this.maxSpeed * 0.9; // AI cars run at 90% speed
            this.currentSpeed = Math.min(
                this.currentSpeed + (this.acceleration * 0.5 * deltaTime),
                targetSpeed
            );
        }

        // Update position
        this.position += this.currentSpeed * deltaTime;
        this.element.style.left = `${this.position}px`;

        // Update UI
        if (this.type === 'player') {
            const speedKMH = Math.floor(this.currentSpeed * 30); // Better speed conversion
            document.getElementById('current-speed').textContent = speedKMH;
            document.getElementById('boost-bar').style.transform = 
                `scaleX(${this.boost / 100})`;
        }

        // Check race completion - Updated logic
        const finishLine = document.getElementById('finish-line').getBoundingClientRect().left;
        if (this.position < finishLine - 50) {
            requestAnimationFrame(this.animate);
        } else {
            this.isRacing = false;
            this.stopRace();
            const event = new CustomEvent('raceFinished', { 
                detail: { 
                    winner: this.type, 
                    position: this.position,
                    car: this
                }
            });
            window.dispatchEvent(event);
        }
    }

    stopRace() {
        this.isRacing = false;
        this.currentSpeed = 0;
        this.isAccelerating = false;
        this.isBoostActive = false;
    }

    activateBoost(active) {
        this.isBoostActive = active && this.boost > 0;
    }

    setAccelerating(isAccelerating) {
        this.isAccelerating = isAccelerating;
    }

    getDistance() {
        return this.position;
    }
}