import { Accelerometer } from "expo-sensors";
import { FFT } from './lib/dsp/dsp';

class Orientation {
    STABILIZATION_TIME_SEC = 4;
    UPDATE_INTERVAL_SEC = 0.016;
    MAX_SAMPLES = 128;
    MAX_BAND = 20;
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
        }

        Accelerometer.setUpdateInterval(this.UPDATE_INTERVAL_SEC * 1000);
    }

    computeSignalSpectrum(signal) {
        const spectrum = this.getSpectrum(signal);
        const frequency = this.dominantFrequency(spectrum);
        this.data.spectrum = spectrum;
        return frequency;
    }

    getSpectrum (points, samplingFreq=60) {
        let signal = []
        for (point of points)
            signal.push(point.y);

        let fft = new FFT(signal.length, samplingFreq);
        fft.forward(signal);

        let spectrum = [];
        for (let i = 0; i < fft.spectrum.length && i < this.MAX_BAND; ++i) {
            spectrum.push({x: i / (points[points.length - 1].x - points[0].x), y: fft.spectrum[i]});
        }
        return spectrum;
    }

    dominantFrequency(spectrum) {
        let biggest = 0;
        for (let i = 1; i < spectrum.length; ++i) {
            if (spectrum[i].y > spectrum[biggest].y)
                biggest = i;
        }
        return spectrum[biggest].x;
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
            this.data.samples.push({x: this.data.accu, y: this.data.x + this.data.y});
            // Don't let the list grow indefinitely
            if (this.data.samples.length > this.MAX_SAMPLES) {
                this.data.samples.splice(0, this.data.samples.length - this.MAX_SAMPLES);
            }

            // Waits for the samples buffer to fill in all zeros to prevent frequency spikes
            // during FFT computation
            if (this.data.accu < this.STABILIZATION_TIME_SEC) return;
            
            let freq = this.computeSignalSpectrum(this.data.samples);
            this.data.freq = freq;

            this.data.freqHistory.push({x: this.data.accu, y: this.data.freq / this.MAX_BAND * 2});
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
        for (let i = 0; i < this.MAX_BAND; ++i) this.data.spectrum.push({x: 0, y: 0});
        for (let i = 0; i < this.MAX_SAMPLES; ++i) this.data.freqHistory.push({x: 0, y: 0});
    }

    _unsubscribe() {
        this.data.accelerometer && this.data.accelerometer.remove();
        this.data.accelerometer = null;
    }
}

export default Orientation;