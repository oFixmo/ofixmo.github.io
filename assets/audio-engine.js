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
                try {
                    await this.ctx.resume();
                } catch (e) {}
            }
        };

        if (!silent) {
            await resumeContext();
        }

        if (!this.resumeEventAdded) {
            // Standard user gestures
            const clickEvents = ['click', 'keydown', 'touchstart', 'pointerdown', 'touchend'];
            const resumeHandler = () => {
                resumeContext();
                clickEvents.forEach(e => document.removeEventListener(e, resumeHandler));
            };
            clickEvents.forEach(e => document.addEventListener(e, resumeHandler, { once: true, capture: true }));
            
            // Aggressive unlock attempts on any movement/scroll
            const moveEvents = ['mousemove', 'wheel', 'scroll', 'pointermove'];
            const aggressiveHandler = () => {
                if (this.ctx && this.ctx.state === 'suspended') {
                    this.ctx.resume().then(() => {
                        moveEvents.forEach(e => document.removeEventListener(e, aggressiveHandler));
                    }).catch(() => {});
                } else if (this.ctx && this.ctx.state === 'running') {
                    moveEvents.forEach(e => document.removeEventListener(e, aggressiveHandler));
                }
            };
            moveEvents.forEach(e => document.addEventListener(e, aggressiveHandler, { capture: true, passive: true }));

            this.resumeEventAdded = true;
        }
    }

    setMuted(muted) {
        this.muted = muted;
    }

    async play(type) {
        if (!this.initialized || this.muted || !this.ctx) return;
        
        if (this.ctx.state === 'suspended') {
            try {
                await this.ctx.resume();
            } catch (e) {
                return;
            }
        }
        
        if (this.ctx.state === 'suspended') return;

        const time = this.ctx.currentTime;

        if (type === 'hover') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, time);
            osc.frequency.exponentialRampToValueAtTime(300, time + 0.015);
            
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.04, time + 0.002);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
            
            osc.start(time);
            osc.stop(time + 0.02);
        }
        else if (type === 'click') {
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
    }
}

const AudioEngine = new AudioEngineClass();
