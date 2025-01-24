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

        // Delta time hesaplama
        if (!this.lastTimestamp) this.lastTimestamp = timestamp;
        const deltaTime = (timestamp - this.lastTimestamp) / 16.67; // 60 FPS'e normalize et
        this.lastTimestamp = timestamp;

        if (this.type === 'player') {
            // Daha yumuşak hızlanma ve yavaşlama
            const targetSpeed = this.isAccelerating ? 
                (this.isBoostActive ? this.maxSpeed * 1.5 : this.maxSpeed) : 0;

            // Hız değişimini yumuşat
            const speedDiff = targetSpeed - this.currentSpeed;
            this.currentSpeed += speedDiff * (this.isAccelerating ? 0.05 : 0.1) * deltaTime;

            // Boost yönetimi
            if (this.isBoostActive && this.boost > 0) {
                this.boost = Math.max(0, this.boost - deltaTime * 0.5);
            }
        } else {
            // Bilgisayar arabası için daha yumuşak hızlanma
            this.currentSpeed += (this.maxSpeed - this.currentSpeed) * 0.02 * deltaTime;
        }

        // Pozisyonu güncelle
        this.position += this.currentSpeed * deltaTime;
        this.element.style.left = `${this.position}px`;

        // UI güncellemeleri
        if (this.type === 'player') {
            // Hızı KM/H'ye çevir (yaklaşık değer)
            const speedKMH = Math.floor(this.currentSpeed * 15);
            document.getElementById('current-speed').textContent = speedKMH;
            document.getElementById('boost-bar').style.transform = 
                `scaleX(${this.boost / 100})`;
        }

        // Yarış bitişini kontrol et
        const finishLine = document.getElementById('finish-line').getBoundingClientRect().left;
        if (this.position < finishLine - 100) {
            requestAnimationFrame(this.animate);
        } else {
            this.isRacing = false;
            // Yarış bittiğinde event tetikle
            window.dispatchEvent(new CustomEvent('raceComplete', { 
                detail: { winner: this.type, position: this.position }
            }));
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