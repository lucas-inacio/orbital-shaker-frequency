import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Orientation from './Orientation';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { ProcessingView } from 'expo-processing';

const POLL_INTERVAL_MS = 200;
const orientation = new Orientation();

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          x: 0,
          y: 0,
          freq: 0,
          interval: null
        };
    }

    start() {
        activateKeepAwake();
        orientation._subscribe();
        const interval = setInterval(() => {
            this.setState({
                x: orientation.data.x,
                y: orientation.data.y,
                freq: orientation.data.freq
            });
        }, POLL_INTERVAL_MS);

        this.setState({interval});
    }

    stop() {
        deactivateKeepAwake();
        orientation._unsubscribe();
        this.state.interval && clearInterval(this.state.interval);
        this.setState({interval: null});
    }

    render() {

        return (
            <View style={styles.container}>
                <Text style={styles.text}>
                {'' + (Math.round(this.state.freq * 100) / 100)}
                </Text>
                <Button title={this.state.interval ? 'Parar' : 'Iniciar'} onPress={this.state.interval ? () => this.stop() : () => this.start()} style={styles.button} />
                <ProcessingView style={styles.canvas} sketch={this._sketch} />
            </View>
        );
    }

    _sketch = (p) => {
        // const samples = [];
        // let accu = 0;
        // let width = p.windowWidth;
        // let height = 720;
        // let params = {
        //     a : 0.5,
        //     aMin: 0.0,
        //     aMax: 1,
        //     aStep: 0.1,
        //     b: 0.3,
        //     bMin: 0.0,
        //     bMax: 6,
        //     bStep: 0.1
        // };
        // let lastTimestamp = 0;
        // let curve, curve2;
        // const yMax = 7;
        // let gui;

        p.setup = () => {
            p.frameRate(24);
        }

        // p.dominantFrequency = (spectrum) => {
        //     let biggest = 0;
        //     for (let i = 1; i < spectrum.length; ++i) {
        //         if (spectrum[i].y > spectrum[biggest].y)
        //             biggest = i;
        //     }
        //     return spectrum[biggest].x;
        // }

        // p.getSpectrum = (points, samplingFreq=60) => {
        //     let signal = []
        //     for (point of points)
        //         signal.push(point.y);

        //     let fft = new FFT(signal.length, samplingFreq);
        //     fft.forward(signal);

        //     let spectrum = [];
        //     for (let i = 0; i < fft.spectrum.length; ++i) {
        //         spectrum.push({x: i / (points[points.length - 1].x - points[0].x), y: fft.spectrum[i]});
        //     }
        //     return spectrum;
        // }
        
        p.draw = () => {
            p.background(255);
        }
    }
}


const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: '100%'
    },
    buttonContainer: {
        flex: 1,
        margin: 5,
        padding: 5,
        color: 'white',
        backgroundColor: '#0497c4'
    },
    button: {
        flex: 1,
        minWidth: 120,
        alignItems: 'center',
        backgroundColor: '#0497c4'
    },
    text: {
        flex: 1,
        fontSize: 100
    },
    canvas: {
        flex: 3,
        minWidth: '100%'
    }
});

export default App;

