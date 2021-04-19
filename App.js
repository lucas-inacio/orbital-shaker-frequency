import React from 'react';
import { Button, Dimensions, StyleSheet, Text, View } from 'react-native';
import Orientation from './Orientation';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { ProcessingView } from 'expo-processing';
import Curve from './Curve';

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

    _sketch = p => {

        let curve1;
        p.setup = () => {
            curve1 = new Curve(p, 50, 50, Dimensions.get('window').width, Dimensions.get('window').width);
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
            curve1.draw(orientation.data.samplesx);
        }
    };
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

