import React, { useState, useEffect } from 'react';
import { Button, Switch, Text, View } from 'react-native';
import InputSpinner from 'react-native-input-spinner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

function Config() {
    const [ config, setConfig ] = useState({ minuteCounter: 1, timerEnabled: false });

    useEffect(() => {
        async function read() {
            try {
                const value = await AsyncStorage.getItem('@config');
                if (value !== null) {
                    setConfig(JSON.parse(value));
                }
            } catch (e) {
            }
        }

        read();
    }, []);

    const saveConfig = async () => {
        try {
            const jsonValue = JSON.stringify(config);
            await AsyncStorage.setItem('@config', jsonValue);
            Toast.show({
                text1: 'Sucesso',
                text2: 'Configurações salvas'
            });
        } catch (e) {
        }
    };

    return (
        <View style={Styles.container}>
            <View style={Styles.row}>
                <Text style={Styles.text}>Habilitar contador?</Text>
                <Switch 
                    title="Definir tempo?"
                    onValueChange={(value) => {
                        setConfig({ minuteCounter: config.minuteCounter, timerEnabled: value });
                    }} 
                    value={config.timerEnabled} />
            </View>
            <View style={config.timerEnabled ? Styles.row : Styles.rowDisabled}>
                <InputSpinner 
                    max={240} min={1} step={1} longStep={5} 
                    onChange={(value) => setConfig({ minuteCounter: value, timerEnabled: config.timerEnabled })}
                    disabled={!config.timerEnabled}
                    append={<Text style={Styles.textAppended}>minutos</Text>}
                    value={config.minuteCounter || 1} />
            </View>
            <Button title="Salvar" onPress={() => saveConfig()} />                
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