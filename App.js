import React from 'react';
import Config from './Config';
import Main from './Main';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Toast from 'react-native-toast-message';

const Stack = createStackNavigator();

function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Main">
                <Stack.Screen name="Main" component={Main} options={{ title: 'Amostragem'}} />
                <Stack.Screen name="Config" component={Config} options={{ title: 'Configuração' }} />
            </Stack.Navigator>
            <Toast ref={(ref) => Toast.setRef(ref)} />
        </NavigationContainer>
    );
}

export default App;

