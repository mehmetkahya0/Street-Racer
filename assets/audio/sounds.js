// Basit bip sesleri kullanarak geçici çözüm
const createBeepSound = (frequency = 440, duration = 200, volume = 0.1) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;
    
    return {
        play: () => {
            oscillator.start();
            setTimeout(() => oscillator.stop(), duration);
        }
    };
};

const sounds = {
    carStart: createBeepSound(330, 300),
    carRev: createBeepSound(440, 200),
    carCrash: createBeepSound(110, 500),
    raceStart: createBeepSound(660, 200),
    raceFinish: createBeepSound(880, 300)
};

export function playSound(soundName) {
    try {
        if (sounds[soundName]) {
            sounds[soundName].play();
        }
    } catch (error) {
        console.warn('Sound playback failed:', error);
    }
}