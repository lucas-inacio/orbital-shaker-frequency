import React, { useState } from 'react';
import { Button, Switch, Text, View } from 'react-native';
import InputSpinner from 'react-native-input-spinner';

function Config() {
    const [ isTimerEnabled, setTimerEnabled ] = useState(false);
    const [time, setTime] = useState(1);
    return (
        <View style={Styles.container}>
            <View style={Styles.row}>
                <Text style={Styles.text}>Habilitar contador?</Text>
                <Switch title="Definir tempo?" onValueChange={() => setTimerEnabled(!isTimerEnabled)} value={isTimerEnabled} />
            </View>
            <View style={isTimerEnabled ? Styles.row : Styles.rowDisabled}>
                {/* <Text>Tempo do ensaio</Text> */}
                <InputSpinner 
                    max={240} min={1} step={1} longStep={5} 
                    onChange={(value) => setTime(value)}
                    disabled={!isTimerEnabled}
                    append={<Text style={Styles.textAppended}>minutos</Text>}
                    value={1} />
            </View>
            {/* <View>
                <Button title="Teste" />
            </View> */}
                
        </View>
    );
}

const Styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: '100%'
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginVertical: 30,
        opacity: 1
    },
    rowDisabled: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginVertical: 30,
        opacity: 0.3
    },
    text: {
        fontSize: 20,
        marginHorizontal: 20
    },
    textAppended: {
        marginHorizontal: 5
    }
}

export default Config;