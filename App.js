import React from 'react';
import { Button, Dimensions, PixelRatio, StyleSheet, Text, View } from 'react-native';
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
          interval: null,
          time: 0,
          canvasWidth: null,
          canvasHeight: null,
          canvasX: null,
          canvasY : null
        };
    }

    start() {
        activateKeepAwake();
        orientation._subscribe();
        const interval = setInterval(() => {
            this.setState({
                x: orientation.data.x,
                y: orientation.data.y,
                freq: orientation.data.freq,
                time: orientation.data.accu
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
                    {'' + (Math.round(this.state.freq * 10) / 10) + 'Hz'}
                </Text>
                <Button title={this.state.interval ? 'Parar' : 'Iniciar'} onPress={this.state.interval ? () => this.stop() : () => this.start()} style={styles.button} />
                <View style={styles.canvas} onLayout={(e) => {
                    x = 100;

                    pixelRatio = PixelRatio.get();
                    screenWidth = e.nativeEvent.layout.width * pixelRatio;
                    screenHeight = e.nativeEvent.layout.height * pixelRatio;
                    width = screenWidth - 2 * x;
                    height = screenHeight / 3;
                    this.setState({ canvasWidth: width, canvasHeight: height, canvasX: x, canvasY: x });
                }}>
                    { (this.state.canvasHeight && this.state.canvasWidth) ? <ProcessingView sketch={this._sketch} /> : null }
                </View>
                <Text style={styles.footer}>
                    {'Tempo: ' + Math.round(this.state.time * 10) / 10 + 's\n'}
                    {'RPM: ' + Math.round(this.state.freq * 60 * 10) / 10 + '\n'}
                </Text>
            </View>
        );
    }

    _sketch = p => {

        let curve1;
        let curve2;
        p.setup = () => {
            p.frameRate(30);

            curve1 = new Curve(
                p, this.state.canvasX, this.state.canvasY,
                this.state.canvasWidth, this.state.canvasHeight
            );
            curve1.setType(curve1.TYPE_BAR);
            curve1.setLineColor(252, 3, 61);
            curve1.setLineWeight(6);
            curve1.showXMark(true);
            curve1.setNumXMarks(3);
            
            curve2 = new Curve(
                p, this.state.canvasX, this.state.canvasY + this.state.canvasHeight + 50,
                this.state.canvasWidth, this.state.canvasHeight
            );
            curve2.setType(curve2.TYPE_LINE);
            curve2.setLineColor(252, 3, 61);
            curve2.setLineWeight(6);
            curve2.showYMark(true);
            curve2.setNumYMarks(4);
        }
        
        p.draw = () => {
            p.background(255);
            curve1.draw(orientation.data.spectrum);
            curve2.draw(orientation.data.freqHistory);
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
    footer: {
        flex: 1,
        fontSize: 20
    },
    canvas: {
        flex: 3,
        minWidth: '100%'
    }
});

export default App;

