import React, { useState, useEffect } from 'react';
import { Button, Switch, Text, View } from 'react-native';
import InputSpinner from 'react-native-input-spinner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

function Config() {
    const [ config, setConfig ] = useState({
        minuteCounter: 1,
        timerEnabled: false,
        showHz: false,
        errorFactor: 1,
        showSpectrum: false,
        errorFactor: 1,
        nonOrbital: false
    });

    useEffect(() => {
        async function read() {
            try {
                const value = await AsyncStorage.getItem('@config');
                if (value !== null) {
                    setConfig(JSON.parse(value));
                }
            } catch (e) {
                console.log(e);
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
            console.log(e);
        }
    };

    return (
        <View style={Styles.container}>
            <View style={Styles.row}>
                <Text style={Styles.text}>Mostrar valor em Hz?</Text>
                <Switch 
                    title="Mostrar valor em Hz?"
                    onValueChange={(value) => {
                        setConfig({
                            minuteCounter: config.minuteCounter,
                            timerEnabled: config.timerEnabled,
                            showHz: value,
                            showSpectrum: config.showSpectrum,
                            errorFactor: config.errorFactor,
                            nonOrbital: config.nonOrbital
                        });
                    }} 
                    value={config.showHz} />
            </View>
            <View style={Styles.row}>
                <Text style={Styles.text}>Exibir espectro?</Text>
                <Switch 
                    title="Exibir espectro?"
                    onValueChange={(value) => {
                        setConfig({
                            minuteCounter: config.minuteCounter,
                            timerEnabled: config.timerEnabled,
                            showHz: config.showHz,
                            showSpectrum: value,
                            errorFactor: config.errorFactor,
                            nonOrbital: config.nonOrbital
                        });
                    }} 
                    value={config.showSpectrum} />
            </View>
            <View style={Styles.row}>
                <Text style={Styles.text}>Amostrar apenas eixo x?</Text>
                <Switch 
                    title="Apenas eixo x?"
                    onValueChange={(value) => {
                        setConfig({
                            minuteCounter: config.minuteCounter,
                            timerEnabled: config.timerEnabled,
                            showHz: config.showHz,
                            showSpectrum: config.showSpectrum,
                            errorFactor: config.errorFactor,
                            nonOrbital: value
                        });
                    }} 
                    value={config.nonOrbital} />
            </View>
            <View style={Styles.row}>
                <Text style={Styles.text}>Habilitar contador?</Text>
                <Switch 
                    title="Definir tempo?"
                    onValueChange={(value) => {
                        setConfig({ 
                            minuteCounter: config.minuteCounter,
                            timerEnabled: value,
                            showHz: config.showHz,
                            showSpectrum: config.showSpectrum,
                            errorFactor: config.errorFactor,
                            nonOrbital: config.nonOrbital
                        });
                    }} 
                    value={config.timerEnabled} />
            </View>
            <View style={config.timerEnabled ? Styles.row : Styles.rowDisabled}>
                <InputSpinner 
                    max={240} min={1} step={1} longStep={5} 
                    onChange={(value) => setConfig({
                        minuteCounter: value,
                        timerEnabled: config.timerEnabled,
                        showHz: config.showHz,
                        showSpectrum: config.showSpectrum,
                        errorFactor: config.errorFactor,
                        nonOrbital: config.nonOrbital
                    })}
                    disabled={!config.timerEnabled}
                    prepend={<Text style={Styles.textAppended}> </Text>}
                    append={<Text style={Styles.textAppended}>minutos </Text>}
                    value={config.minuteCounter || 1} />
            </View>
            <View style={Styles.row}>
                <Text style={Styles.text}>Definir fator de correção</Text>
            </View>
            <View style={Styles.row}>
                <InputSpinner 
                    max={5} min={0.1} step={0.01} longStep={0.1} 
                    onChange={(value) => setConfig({
                        minuteCounter: config.minuteCounter,
                        timerEnabled: config.timerEnabled,
                        showHz: config.showHz,
                        showSpectrum: config.showSpectrum,
                        errorFactor: value,
                        nonOrbital: config.nonOrbital
                     })}
                    type="real"
                    prepend={<Text style={Styles.textAppended}> </Text>}
                    append={<Text style={Styles.textAppended}> </Text>}
                    value={config.errorFactor} />
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
        marginVertical: 15,
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