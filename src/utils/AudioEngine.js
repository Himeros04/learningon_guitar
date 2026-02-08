/**
 * AudioEngine.js
 * Handles precise timing for the Metronome using Web Audio API
 */
class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.nextNoteTime = 0.0;
        this.timerID = null;
        this.isPlaying = false;
        this.bpm = 60;
        this.lookahead = 25.0; // ms
        this.scheduleAheadTime = 0.1; // s
        this.currentBeatInBar = 0;
        this.beatsPerBar = 4;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    nextNote() {
        const secondsPerBeat = 60.0 / this.bpm;
        this.nextNoteTime += secondsPerBeat;
        this.currentBeatInBar++;
        if (this.currentBeatInBar >= this.beatsPerBar) {
            this.currentBeatInBar = 0;
        }
    }

    scheduleNote(beatNumber, time) {
        if (!this.audioContext) return;

        // Create oscillator for the beep
        const osc = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();

        osc.connect(envelope);
        envelope.connect(this.audioContext.destination);

        // Accent the first beat
        if (beatNumber === 0) {
            osc.frequency.value = 880.0; // High A
        } else {
            osc.frequency.value = 440.0; // A
        }

        envelope.gain.value = 1;
        envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

        osc.start(time);
        osc.stop(time + 0.03);
    }

    scheduler() {
        if (!this.audioContext) return;

        // While there are notes that will need to play before the next interval,
        // schedule them and advance the pointer.
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentBeatInBar, this.nextNoteTime);
            this.nextNote();
        }

        if (this.isPlaying) {
            this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
        }
    }

    start() {
        if (this.isPlaying) return;

        this.init();
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.isPlaying = true;
        this.currentBeatInBar = 0;
        this.nextNoteTime = this.audioContext.currentTime + 0.05;
        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        if (this.timerID) {
            window.clearTimeout(this.timerID);
        }
    }

    setBpm(bpm) {
        this.bpm = bpm;
    }
}

// Singleton instance
const audioEngine = new AudioEngine();
export default audioEngine;
