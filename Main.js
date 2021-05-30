import React from 'react';
import { Button, PixelRatio, StyleSheet, Text, View } from 'react-native';
import Orientation from './Orientation';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { GLView } from 'expo-gl';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Curve from './Curve';

const POLL_INTERVAL_MS = 200;
const orientation = new Orientation();

const Separator = () => (
    <View style={styles.separator} />
);

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.navigation = props.navigation;
        this.state = {
            freq: 0,
            interval: null,
            canvasWidth: null,
            canvasHeight: null,
            canvasX: null,
            canvasY : null,
            config: {
                minuteCounter: 1,
                timerEnabled: false,
                errorFactor: 1
            }
        };
        this.removeListener = null;
        this.frameID = null;
        this.lastTimeStamp = Date.now();
    }

    componentDidMount() {
        const read = async () => {
            try {
                const value = await AsyncStorage.getItem('@config');
                if (value !== null)
                    this.setState({ config: JSON.parse(value) });
            } catch (e) {
                console.log(e);
            }
        }

        if (!this.removeListener) {
            this.removeListener = this.navigation.addListener('focus', () => {
                read();
            });
        }
    }

    componentWillUnmount() {
        if (this.removeListener) {
            this.removeListener();
            this.removeListener = null;
        }

        if (this.frameID) {
            cancelAnimationFrame(this.frameID);
            this.frameID = null;
        }
    }

    start() {
        activateKeepAwake();
        orientation.setErrorFactor(this.state.config.errorFactor);
        orientation._subscribe();
        const timeLimit = this.state.config.minuteCounter * 60 + orientation.STABILIZATION_TIME_MS / 1000;
        const interval = setInterval(() => {
            if (this.state.config.timerEnabled &&
                orientation.data.accu >= timeLimit) {
                this.stop();
            } else {
                this.setState({freq: orientation.data.fps});
            }
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
                    {
                        // '' + (Math.round(this.state.freq * 10 * 60) / 10) + 'RPM'
                        'FPS: ' + Math.round(this.state.freq)
                    }
                </Text>
                <View style={styles.canvas} onLayout={(e) => {
                    let x = 100;

                    let pixelRatio = PixelRatio.get();
                    let screenWidth = e.nativeEvent.layout.width * pixelRatio;
                    let screenHeight = e.nativeEvent.layout.height * pixelRatio;
                    this.setState({ canvasWidth: screenWidth, canvasHeight: screenHeight, canvasX: x, canvasY: x });
                }}>
                    { (this.state.canvasHeight && this.state.canvasWidth) ? <GLView onContextCreate={this.onContextCreate} /> : null }
                </View>
                <View>
                    <Button
                        title={this.state.interval ? 'Parar' : 'Iniciar'}
                        onPress={this.state.interval ? () => this.stop() : () => this.start()}
                        style={styles.button} />
                    <Separator />
                    <Button 
                        title="Configurar" disabled={this.state.interval ? true : false}
                        onPress={this.onConfig}
                        style={styles.button} />
                </View>
            </View>
        );
    }

    setRPMPlot(curve) {
        curve.showYMark(true);
        curve.setNumYMarks(8);
        curve.setYSpan(280);
    }

    onConfig = () => { 
        if (this.frameID) {
            cancelAnimationFrame(this.frameID);
            this.frameID = null;
        }
        this.navigation.navigate('Config');
    }

    onContextCreate = async (gl) => {
        const x = 0;
        const y = 0;
        const width = this.state.canvasWidth;
        const height = this.state.canvasHeight;
        this.gl = gl;
        this.gl.viewport(0, 0, this.state.canvasWidth, this.state.canvasHeight);
        this.gl.clearColor(1, 1, 1, 1);

        this.curve = new Curve(this.gl, x, y, width, height, this.state.canvasWidth, this.state.canvasHeight);
        this.setRPMPlot(this.curve);

        requestAnimationFrame(this.draw);
    };

    draw = () => {
        this.frameID = requestAnimationFrame(this.draw);      
        // Clear the canvas before we start drawing on it.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        const data = [];
        const start = orientation.data.freqHistory.length - orientation.data.freqHistory.length / 4;
        for (let i = start; i < orientation.data.freqHistory.length; ++i)
            data.push(orientation.data.freqHistory[i] * 60);
        this.curve.draw(data);

        this.gl.flush();
        this.gl.endFrameEXP();
    };
}


const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        paddingBottom: 20
    },
    buttonContainer: {
        flex: 1,
        margin: 5,
        padding: 5,
        color: 'white',
        backgroundColor: '#0497c4'
    },
    separator: {
        marginVertical: 8
    },
    text: {
        flex: 1,
        fontSize: 70
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

export default Main;

