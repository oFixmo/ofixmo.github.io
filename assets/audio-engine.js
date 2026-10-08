class AudioEngineClass {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
        this.resumeEventAdded = false;
    }

    async init(silent = false) {
        if (this.initialized) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.initialized = true;

        const resumeContext = async () => {
            if (this.ctx && this.ctx.state === 'suspended') {
                await this.ctx.resume();
            }
        };

        if (!silent) {
            await resumeContext();
        }

        // Always try to resume on first user interaction to ensure hover sounds work
        if (!this.resumeEventAdded) {
            const events = ['click', 'keydown', 'touchstart'];
            const resumeHandler = () => {
                resumeContext();
                events.forEach(e => document.removeEventListener(e, resumeHandler));
            };
            events.forEach(e => document.addEventListener(e, resumeHandler, { once: true }));
            this.resumeEventAdded = true;
        }
    }

    setMuted(muted) {
        this.muted = muted;
    }

    play(type) {
        if (!this.initialized || this.muted || !this.ctx) return;
        if (this.ctx.state === 'suspended') return; // Cannot play if suspended

        const time = this.ctx.currentTime;

        if (type === 'hover') {
            // Very subtle, quick organic tick
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            // Start high, drop fast
            osc.frequency.setValueAtTime(1000, time);
            osc.frequency.exponentialRampToValueAtTime(300, time + 0.015);
            
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.04, time + 0.002);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
            
            osc.start(time);
            osc.stop(time + 0.02);
        }
        else if (type === 'click') {
            // Elegant, satisfying pop
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, time);
            osc.frequency.exponentialRampToValueAtTime(100, time + 0.04);
            
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.12, time + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
            
            osc.start(time);
            osc.stop(time + 0.05);
        }
        else if (type === 'whoosh') {
            const bufferSize = this.ctx.sampleRate * 0.5;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, time);
            filter.frequency.exponentialRampToValueAtTime(2000, time + 0.2);
            filter.frequency.exponentialRampToValueAtTime(200, time + 0.5);
            
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.05, time + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            
            noise.start(time);
            noise.stop(time + 0.5);
        }
    }
}

const AudioEngine = new AudioEngineClass();
