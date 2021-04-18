import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Orientation from './Orientation';

const POLL_INTERVAL_MS = 200;
const orientation = new Orientation();

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          x: 0,
          y: 0,
          freq: 0,
          interval: null
        };
    }

    start() {
        orientation._subscribe();
        const interval = setInterval(() => {
            this.setState({
                x: orientation.data.x,
                y: orientation.data.y,
                freq: orientation.data.freq
            });
        }, POLL_INTERVAL_MS);

        this.setState({interval});
    }

    stop() {
        orientation._unsubscribe();
        this.state.interval && clearInterval(this.state.interval);
        this.setState({interval: null});
    }

    render() {

        return (
        <View style={styles.container}>
            <Text style={styles.text}>
            {'' + (Math.round(this.state.freq * 100) / 100)}
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={this.state.interval ? () => this.stop() : () => this.start()} style={styles.button}>
                  <Text>{this.state.interval ? 'Parar' : 'Iniciar'}</Text>
              </TouchableOpacity>
            </View>
        </View>
        );
    }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    margin: 5,
    padding: 5,
    color: 'white',
    backgroundColor: '#0497c4'
  },
  button: {
    minWidth: 120,
    alignItems: 'center'
  },
  text: {
    fontSize: 100
  }
});

export default App;

