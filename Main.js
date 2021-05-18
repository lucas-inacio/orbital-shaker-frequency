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
          config: null
        };
        this.removeListener = null;
        // Used to normalize the plots
        this.frequencyFactor = 1 / orientation.SAMPLING_FREQ;
    }

    componentDidMount() {
        read = async () => {
            try {
                const value = await AsyncStorage.getItem('@config');
                this.setState({ config: JSON.parse(value) });
            } catch (e) {
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
    }

    start() {
        activateKeepAwake();
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
                    {'' + (Math.round(this.state.freq * 10 * 60) / 10) + 'RPM'}
                </Text>
                <View>
                    <Button
                        title={this.state.interval ? 'Parar' : 'Iniciar'}
                        onPress={this.state.interval ? () => this.stop() : () => this.start()}
                        style={styles.button} />
                    <Separator />
                    <Button 
                        title="Configurar" disabled={this.state.interval ? true : false}
                        onPress={() => this.navigation.navigate('Config')}
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
            </View>
        );
    }

    onContextCreate = async (gl) => {
        this.ctx = new Expo2DContext(gl, { renderWithOffscreenBuffer: true });

        let x = 100;
        let y = 100;
        let width = this.state.canvasWidth - 2 * x;
        let height = this.state.canvasHeight / 1.3;

        this.curve2 = new Curve(this.ctx, x, y, width, height);
        this.curve2.setType(this.curve2.TYPE_LINE);
        this.curve2.showYMark(true);
        this.curve2.setNumYMarks(8);
        this.curve2.showYNumbers(true);
        this.curve2.setYSpan(1440);

        try {
            await this.ctx.initializeText();
            this.ctx.font = '75pt sans-serif';
            this.frameID = requestAnimationFrame(this.draw);
        } catch (e) {
            console.log(e);
        }
    }

    draw = () => {
        this.ctx.clearRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);

        let rpm = [];
        for (let freq of orientation.data.freqHistory)
            rpm.push({x: freq.x, y: freq.y * 60});
        this.curve2.draw(rpm);
        
        this.ctx.flush();
        this.frameID = requestAnimationFrame(this.draw);
    }
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

