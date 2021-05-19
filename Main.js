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
          config: { minuteCounter: 1, timerEnabled: false }
        };
        this.removeListener = null;
        // Used to normalize the plots
        this.frequencyFactor = 1 / orientation.SAMPLING_FREQ;
    }

    componentDidMount() {
        read = async () => {
            try {
                const value = await AsyncStorage.getItem('@config');
                if (value !== null)
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
                    { (this.state.canvasHeight && this.state.canvasWidth) ? <GLView onContextCreate={gl => onContextCreate(gl, this)} /> : null }
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

var ctx = null;
var onContextCreate = async (gl, main) => {
    ctx = new Expo2DContext(gl, { renderWithOffscreenBuffer: true });
    let x = 100;
    let y = 100;
    let width = main.state.canvasWidth - 2 * x;
    let height = main.state.canvasHeight / 1.3;

    main.curve2 = new Curve(ctx, x, y, width, height);
    main.curve2.setType(main.curve2.TYPE_LINE);
    main.curve2.showYMark(true);
    main.curve2.setNumYMarks(8);
    main.curve2.showYNumbers(true);
    main.curve2.setYSpan(1440);

    try {
        resetFonts();
        await ctx.initializeText();
        ctx.font = '75pt sans-serif';
        main.frameID = requestAnimationFrame(() => draw(main));
    } catch (e) {
        console.log(e);
    }
};

var draw = (main) => {
    ctx.clearRect(0, 0, main.state.canvasWidth, main.state.canvasHeight);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, main.state.canvasWidth, main.state.canvasHeight);

    let rpm = [];
    for (let freq of orientation.data.freqHistory)
        rpm.push({x: freq.x, y: freq.y * 60});
    main.curve2.draw(rpm);
    
    ctx.flush();
    main.frameID = requestAnimationFrame(() => draw(main));
};

// A little hack to make the font work with react-navigation transitions.
// The context is recreated every transition.
var resetFonts = () => {
    for (let key of Object.keys(ctx.builtinFonts)) {
        if (ctx.builtinFonts[key] !== null) {
            ctx.builtinFonts[key].assets_loaded = false;
            ctx.builtinFonts[key].gl_resources = null;
        }
    }
};

export default Main;

