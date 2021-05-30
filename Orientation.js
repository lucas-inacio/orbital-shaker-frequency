import { Accelerometer } from "expo-sensors";
import { FFT } from './lib/dsp/dsp';

class Orientation {
    MAX_SAMPLES = 256;
    SAMPLING_FREQ = 32;
    SAMPLING_INTERVAL_MS = 1000 / (this.SAMPLING_FREQ);
    UPDATE_INTERVAL_MS = 1000 / (8 * this.SAMPLING_FREQ);
    STABILIZATION_TIME_MS = 4000;
    constructor() {
        this.data = {
            fps: 0,
            accelerometer: null,
            freq: 0,
            accu: 0,
            samples: [],
            freqHistory: [],
            errorFactor: 1,
            delta: 0,
            lastTimeStamp: Date.now(),
            fft: new FFT(this.MAX_SAMPLES, this.SAMPLING_FREQ)
        }

        Accelerometer.setUpdateInterval(this.UPDATE_INTERVAL_MS);
    }

    setErrorFactor(errorFactor) {
        this.data.errorFactor = errorFactor;
    }

    computeSignalSpectrum(signal) {
        this.data.fft.forward(signal);
        return this.dominantFrequency();
    }

    dominantFrequency() {
        let biggest = 0;
        for (let i = 1; i < this.data.fft.spectrum.length; ++i) {
            if (this.data.fft.spectrum[i] > this.data.fft.spectrum[biggest])
                biggest = i;
        }

        return (biggest * this.SAMPLING_FREQ / this.MAX_SAMPLES);
    }

    _subscribe() {
        const sub = Accelerometer.addListener(accelerometerData => {
            if (isNaN(accelerometerData.x) ||
                isNaN(accelerometerData.y)) {
            
                return;
            }
    
            this.data.accu += this.UPDATE_INTERVAL_MS;            
            const now = Date.now();
            const delta = now - this.data.lastTimeStamp;
            const diff = delta - this.SAMPLING_INTERVAL_MS;
            if (diff >= -3) {
                this.data.delta = delta;
                this.data.lastTimeStamp = now;
                this.data.fps = 1000 / delta;

                this.data.samples.push(accelerometerData.x);
                // Don't let the list grow indefinitely
                if (this.data.samples.length > this.MAX_SAMPLES) {
                    this.data.samples.splice(0, this.data.samples.length - this.MAX_SAMPLES);
                }
                
                this.data.freq = this.computeSignalSpectrum(this.data.samples) * this.data.errorFactor;
                this.data.freqHistory.push(this.data.freq);
                if (this.data.freqHistory.length > this.MAX_SAMPLES) {
                    this.data.freqHistory.splice(0, this.data.freqHistory.length - this.MAX_SAMPLES);
                }
            }
        });

        this.data.accelerometer = sub;
        this.data.freq = 0;
        this.data.accu = 0;
        this.data.samples = [];
        this.data.freqHistory = [];
        for (let i = 0; i < this.MAX_SAMPLES; ++i) this.data.samples.push(0);
        for (let i = 0; i < this.MAX_SAMPLES; ++i) this.data.freqHistory.push(0);
    }

    _unsubscribe() {
        this.data.accelerometer && this.data.accelerometer.remove();
        this.data.accelerometer = null;
    }
}

export default Orientation;