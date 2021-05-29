import React from 'react';
import { Button, PixelRatio, StyleSheet, Text, View } from 'react-native';
import Orientation from './Orientation';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { GLView } from 'expo-gl';
import Expo2DContext from 'expo-2d-context';
import Curve from './Curve';

import AsyncStorage from '@react-native-async-storage/async-storage';

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
          x: 0,
          y: 0,
          freq: 0,
          interval: null,
          time: 0,
          canvasWidth: null,
          canvasHeight: null,
          canvasX: null,
          canvasY : null,
          config: {
              minuteCounter: 1,
              timerEnabled: false,
              showHz: false,
              errorFactor: 1,
              showSpectrum: false,
              errorFactor: 1,
              nonOrbital: false
            }
        };
        this.removeListener = null;
        // Used to normalize the plots
        this.frequencyFactor = 1 / orientation.SAMPLING_FREQ;
        this.frameID = null;
    }

    componentDidMount() {
        read = async () => {
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
        orientation.setNonOrbital(this.state.config.nonOrbital);
        orientation._subscribe();
        const timeLimit = this.state.config.minuteCounter * 60 + orientation.STABILIZATION_TIME_SEC;
        const interval = setInterval(() => {
            if (this.state.config.timerEnabled &&
                orientation.data.accu >= timeLimit) {
                this.stop();
            } else {
                this.setState({
                    x: orientation.data.x,
                    y: orientation.data.y,
                    freq: orientation.data.freq,
                    time: orientation.data.accu
                });
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
        const totalTime = Math.round((this.state.time - orientation.STABILIZATION_TIME_SEC) * 10) / 10;
        const maxRPM = Math.round(orientation.data.freqTop * 60);
        const meanRPM = (Math.round(orientation.data.freqSum * 60 / orientation.data.totalSamples * 10) / 10) || 0;

        return (
            <View style={styles.container}>
                <Text style={styles.text}>
                    {
                        this.state.config.showHz ? 
                            (Math.round(this.state.freq * 10) / 10) + 'Hz' :
                            '' + (Math.round(this.state.freq * 10 * 60) / 10) + 'RPM'
                    }
                </Text>
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
                <View style={styles.canvas} onLayout={(e) => {
                    let x = 100;

                    let pixelRatio = PixelRatio.get();
                    let screenWidth = e.nativeEvent.layout.width * pixelRatio;
                    let screenHeight = e.nativeEvent.layout.height * pixelRatio;
                    this.setState({ canvasWidth: screenWidth, canvasHeight: screenHeight, canvasX: x, canvasY: x });
                }}>
                    { (this.state.canvasHeight && this.state.canvasWidth) ? <GLView onContextCreate={this.onContextCreate} /> : null }
                </View>
                <Text style={styles.footer}>
                    {
                        (this.state.interval) ? 
                            ('Tempo: ' + ((totalTime > 0) ? (totalTime + 's\nRPM: ') : 'estabilizando...\nRPM: ') + Math.round(this.state.freq * 60 * 10) / 10 + '\n') :
                            ('Tempo total: ' + ((totalTime > 0) ? totalTime :  0) + 's\nRPM máximo: ' + maxRPM + '\nRPM médio: ' + meanRPM)
                    }
                </Text>
                <Text>{Math.round(1000 / orientation.data.delta)}</Text>
            </View>
        );
    }

    setSpectrumPlot(curve) {
        curve.setType(curve.TYPE_BAR);
        curve.showYMark(true);
        curve.setNumYMarks(8);
        curve.showYNumbers(true);
        curve.setYSpan(0.5);
        curve.showXMark(true);
        curve.setNumXMarks(8);
        curve.showXNumbers(true);
        curve.setXSpan(orientation.SAMPLING_FREQ / 2 * (orientation.SAMPLING_FREQ / orientation.MAX_SAMPLES) * this.state.config.errorFactor);
    }

    setRPMPlot(curve) {
        curve.setType(curve.TYPE_LINE);
        curve.showYMark(true);
        curve.setNumYMarks(8);
        curve.showYNumbers(true);
        curve.setYSpan(1440);
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
        let y = 100;
        let width = this.state.canvasWidth - 2 * x;
        let height = this.state.canvasHeight / 1.3;

        this.curve2 = new Curve(this.ctx, x, y, width, height);
        if (this.state.config.showSpectrum)
            this.setSpectrumPlot(this.curve2);
        else
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

    draw = () => {
        this.frameID = requestAnimationFrame(this.draw);

        this.ctx.clearRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);

        let data = [];
        if (this.state.config.showSpectrum) {
            for (let bin = 0; bin < orientation.data.spectrum.length / 2; ++bin) {
                let value = (orientation.data.spectrum[bin].x + orientation.data.spectrum[bin].y) / 2;
                data.push({x: bin * orientation.SAMPLING_FREQ / orientation.MAX_SAMPLES, y: value});
            }
        } else {
            for (let freq of orientation.data.freqHistory)
                data.push({x: freq.x, y: freq.y * 60});
        }

        this.curve2.draw(data);
        this.ctx.flush();
    };

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

