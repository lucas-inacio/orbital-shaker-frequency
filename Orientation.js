import { Accelerometer } from "expo-sensors";
import { FFT } from './lib/dsp/dsp';

const UPDATE_INTERVAL_SEC = 0.016;
const MAX_SAMPLES = 128;
const MAX_BAND = 20;

class Orientation {
    constructor() {
        this.data = {
            accelerometer: null,
            x: 0,
            y: 0,
            freq: 0,
            accu: 0,
            samples: [],
            spectrum: [],
            freqHistory: []
        }

        Accelerometer.setUpdateInterval(UPDATE_INTERVAL_SEC * 1000);
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
        for (let i = 0; i < fft.spectrum.length && i < MAX_BAND; ++i) {
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
            
            this.data.accu += UPDATE_INTERVAL_SEC;
            this.data.samples.push({x: this.data.accu, y: this.data.x + this.data.y});
            
            if (this.data.samples.length > MAX_SAMPLES) {
                this.data.samples.splice(0, this.data.samples.length - MAX_SAMPLES);
            }
            
            let freq = this.computeSignalSpectrum(this.data.samples);
            this.data.freq = freq;

            this.data.freqHistory.push({x: this.data.accu, y: this.data.freq / MAX_BAND * 2});
            if (this.data.freqHistory.length > MAX_SAMPLES) {
                this.data.freqHistory.splice(0, this.data.freqHistory.length - MAX_SAMPLES);
            }
        });

        this.data.accelerometer = sub;
        this.data.x = 0
        this.data.y = 0;
        this.data.freq = 0;
        this.data.accu = 0;
        this.data.samples = [];
        this.data.spectrum = [];
        this.data.freqHistory = [];
        for (let i = 0; i < MAX_SAMPLES; ++i) this.data.samples.push({x: 0, y: 0});
        for (let i = 0; i < MAX_BAND; ++i) this.data.spectrum.push({x: 0, y: 0});
        for (let i = 0; i < MAX_SAMPLES; ++i) this.data.freqHistory.push({x: 0, y: 0});
    }

    _unsubscribe() {
        this.data.accelerometer && this.data.accelerometer.remove();
        this.data.accelerometer = null;
    };
}

export default Orientation;