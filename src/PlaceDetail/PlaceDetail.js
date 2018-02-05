import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {Overlay} from 'react-native-elements'

const PlaceDetail = (props)=> {
    return (
        <View>
            <Overlay isVisible={this.state.isVisible} width='auto' height='auto'>
                <Text>Hello from Overlay!</Text>
            </Overlay>
        </View>
    )
}

export default PlaceDetail