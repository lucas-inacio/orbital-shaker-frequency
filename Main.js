import React from 'react';
import { Button, PixelRatio, StyleSheet, Text, View } from 'react-native';
import Orientation from './Orientation';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { GLView } from 'expo-gl';
import Expo2DContext from 'expo-2d-context';
import Curve from './Curve';

import AsyncStorage from '@react-native-async-storage/async-storage';

const FPS_INTERVAL = 50;
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
                this.setState({freq: orientation.data.freq});
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
        curve.setType(curve.TYPE_LINE);
        curve.showYMark(true);
        curve.setNumYMarks(8);
        curve.showYNumbers(true);
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
        this.ctx = new Expo2DContext(gl, { renderWithOffscreenBuffer: true });
        let x = 100;
        let y = 200;
        let width = this.state.canvasWidth - 2 * x;
        let height = this.state.canvasHeight / 1.5;

        this.curve2 = new Curve(this.ctx, x, y, width, height);
        this.setRPMPlot(this.curve2);

        try {
            this.resetFonts();
            await this.ctx.initializeText();
            this.ctx.font = '75pt sans-serif';
            this.frameID = requestAnimationFrame(this.draw);
        } catch (e) {
            console.log(e);
        }
    };

    lastTimeStamp = Date.now()
    draw = () => {
        this.frameID = requestAnimationFrame(this.draw);

        // Limit FPS
        const now = Date.now();
        if (now - this.lastTimeStamp >= FPS_INTERVAL) {
            this.lastTimeStamp = now;

            this.ctx.clearRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);

            const data = [];
            for (let i = orientation.data.freqHistory.length / 2; i < orientation.data.freqHistory.length; ++i)
                data.push(orientation.data.freqHistory[i] * 60);

            this.curve2.draw(data);
            this.ctx.fillStyle = 'black';
            this.ctx.font = 'bold 125pt sans-serif';
            this.ctx.fillText(Math.round(orientation.data.freq * 60) + 'RPM', 200, 100);
            this.ctx.font = 'bold 30pt sans-serif';
            this.ctx.fillText('Tempo total: ' + Math.round(orientation.data.accu / 1000) + 's', 300, this.curve2.height * 0.95);
            this.ctx.fillText('FPS: ' + Math.round(orientation.data.fps), 300, this.curve2.height * 1.02);
            this.ctx.flush();
        }
    };
    // Had to do this hack or fonts won't work properly when switching back
    // to this view
    resetFonts = () => {
        for (let key of Object.keys(this.ctx.builtinFonts)) {
            if (this.ctx.builtinFonts[key] !== null) {
                this.ctx.builtinFonts[key].assets_loaded = false;
                this.ctx.builtinFonts[key].gl_resources = null;
            }
        }
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

