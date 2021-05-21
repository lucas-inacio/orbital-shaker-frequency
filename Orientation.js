import { Accelerometer } from "expo-sensors";
import { FFT } from './lib/dsp/dsp';

class Orientation {
    // UPDATE_INTERVAL_SEC = 0.0078125; // 1/128
    // UPDATE_INTERVAL_SEC = 0.015625; // 1/64
    MAX_SAMPLES = 256;
    SAMPLING_FREQ = 64;
    UPDATE_INTERVAL_SEC = 1 / this.SAMPLING_FREQ; // 1/64
    STABILIZATION_TIME_SEC = 4;
    constructor() {
        this.data = {
            accelerometer: null,
            x: 0,
            y: 0,
            freq: 0,
            accu: 0,
            samples: [],
            spectrum: [],
            freqHistory: [],
            // Report
            freqTop: 0,
            freqSum: 0,
            totalSamples: 0,
            errorFactor: 1,
            nonOrbital: false
        }

        Accelerometer.setUpdateInterval(this.UPDATE_INTERVAL_SEC * 1000);
    }

    setErrorFactor(errorFactor) {
        this.data.errorFactor = errorFactor;
    }

    setNonOrbital(value) {
        this.data.nonOrbital = value;
    }

    computeSignalSpectrum(signal) {
        this.getSpectrum(signal, this.SAMPLING_FREQ);
        const frequency = this.dominantFrequency();
        return frequency;
    }

    getSpectrum (points, samplingFreq) {
        let signalX = []
        for (let point of points)
            signalX.push(point.x);

        let fftX = new FFT(signalX.length, samplingFreq);
        fftX.forward(signalX);

        let signalY = []
        for (let point of points)
            signalY.push(point.y);

        let fftY = new FFT(signalY.length, samplingFreq);
        fftY.forward(signalY);

        // First 128 samples
        for (let i = 0; i < fftX.spectrum.length / 2; ++i) {
            // this.data.spectrum[i] = {x: i * this.SAMPLING_FREQ / this.MAX_SAMPLES, y: fft.spectrum[i]};
            this.data.spectrum[i] = {x: fftX.spectrum[i], y: fftY.spectrum[i]};
        }
    }

    dominantFrequency() {
        let biggestX = 0;
        let biggestY = 0;
        for (let i = 1; i < this.data.spectrum.length / 2; ++i) {
            if (this.data.spectrum[i].x > this.data.spectrum[biggestX].x)
                biggestX = i;

            if (this.data.spectrum[i].y > this.data.spectrum[biggestY].y)
                biggestY = i;
        }

        if (this.data.nonOrbital)
            return (biggestX * this.SAMPLING_FREQ / this.MAX_SAMPLES);
        else
            return ((biggestX + biggestY) * this.SAMPLING_FREQ / this.MAX_SAMPLES) / 2;
    }

    _subscribe() {
        const sub = Accelerometer.addListener(accelerometerData => {
            if (accelerometerData.x === NaN ||
                accelerometerData.y === NaN) {
            
                return;
            }
    
            this.data.x = accelerometerData.x;
            this.data.y = accelerometerData.y;
            
            this.data.accu += this.UPDATE_INTERVAL_SEC;
            // this.data.samples.push({x: this.data.accu, y: this.data.x + this.data.y});
            this.data.samples.push({x: this.data.x, y: this.data.y});
            // Don't let the list grow indefinitely
            if (this.data.samples.length > this.MAX_SAMPLES) {
                this.data.samples.splice(0, this.data.samples.length - this.MAX_SAMPLES);
            }

            // Waits for the samples buffer to fill in all zeros to prevent frequency spikes
            // during FFT computation
            if (this.data.accu < this.STABILIZATION_TIME_SEC) return;
            
            let freq = this.computeSignalSpectrum(this.data.samples) * this.data.errorFactor;
            this.data.freq = freq;

            this.data.freqHistory.push({x: this.data.accu, y: this.data.freq});
            if (this.data.freqHistory.length > this.MAX_SAMPLES) {
                this.data.freqHistory.splice(0, this.data.freqHistory.length - this.MAX_SAMPLES);
            }

            // Report
            if (freq > this.data.freqTop)
                this.data.freqTop = freq;
            this.data.freqSum += freq;
            this.data.totalSamples++;
        });

        this.data.accelerometer = sub;
        this.data.x = 0
        this.data.y = 0;
        this.data.freq = 0;
        this.data.accu = 0;
        this.data.samples = [];
        this.data.spectrum = [];
        this.data.freqHistory = [];
        this.data.freqSum = 0;
        this.data.freqTop = 0;
        this.data.totalSamples = 0;
        for (let i = 0; i < this.MAX_SAMPLES; ++i) this.data.samples.push({x: 0, y: 0});
        for (let i = 0; i < this.SAMPLING_FREQ; ++i) this.data.spectrum.push({x: 0, y: 0});
        for (let i = 0; i < this.MAX_SAMPLES; ++i) this.data.freqHistory.push({x: 0, y: 0});
    }

    _unsubscribe() {
        this.data.accelerometer && this.data.accelerometer.remove();
        this.data.accelerometer = null;
    }
}

export default Orientation;