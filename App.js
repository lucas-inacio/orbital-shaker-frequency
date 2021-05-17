import React from 'react';
import { Button, PixelRatio, StyleSheet, Text, View } from 'react-native';
import Config from './Config';
import Main from './Main';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Main" component={Main} options={{ title: 'Amostragem'}} />
                <Stack.Screen name="Config" component={Config} options={{ title: 'Configuração' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;

