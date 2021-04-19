import { Accelerometer } from "expo-sensors";
import { FFT } from './lib/dsp/dsp';

const G = 9.81;
const UPDATE_INTERVAL_SEC = 0.016;
const MAX_SAMPLES = 128;

class Orientation {
    constructor() {
        this.data = {
            accelerometer: null,
            x: 0,
            y: 0,
            freq: 0,
            accu: 0,
            samplesx: [],
            samplesy: []
        }

        Accelerometer.setUpdateInterval(UPDATE_INTERVAL_SEC * 1000);
    }

    computeSignalSpectrum(signal) {
        const spectrum = this.getSpectrum(signal);
        const frequency = this.dominantFrequency(spectrum);
        return frequency;
    }

    getSpectrum (points, samplingFreq=60) {
        let signal = []
        for (point of points)
            signal.push(point.y);

        let fft = new FFT(signal.length, samplingFreq);
        fft.forward(signal);

        let spectrum = [];
        for (let i = 0; i < fft.spectrum.length; ++i) {
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
            this.data.samplesx.push({x: this.data.accu, y: this.data.x});
            this.data.samplesy.push({x: this.data.accu, y: this.data.y});
            
            if (this.data.samplesx.length > MAX_SAMPLES) {
                this.data.samplesx.splice(0, 1);
            }

            if (this.data.samplesy.length > MAX_SAMPLES) {
                this.data.samplesy.splice(0, 1);
            }

            let freq1 = this.computeSignalSpectrum(this.data.samplesx);
            let freq2 = this.computeSignalSpectrum(this.data.samplesy);
            this.data.freq = Math.max(freq1, freq2);
        });

        this.data.accelerometer = sub;
        this.data.x = 0
        this.data.y = 0;
        this.data.freq = 0;
        this.data.accu = 0;
        this.data.samplesx = [];
        this.data.samplesy = [];
        for (let i = 0; i < MAX_SAMPLES; ++i) this.data.samplesx.push({x: 0, y: 0});
        for (let i = 0; i < MAX_SAMPLES; ++i) this.data.samplesy.push({x: 0, y: 0});
    }

    _unsubscribe() {
        this.data.accelerometer && this.data.accelerometer.remove();
        this.data.accelerometer = null;
    };
}

export default Orientation;