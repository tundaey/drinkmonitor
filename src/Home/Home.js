import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';

const axios = require('axios')

const Home = (props)=> {
    return (
        <MapView
        style={ styles.map }
        initialRegion={{
            latitude: 52.5116003,
            longitude: -1.8458068,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        }}>

          {props.locations.length === 0 
            ? console.log('no locations') 
            :  props.locations.map((location)=> {
                const latitude = parseFloat(location.latitude)
                const longitude = parseFloat(location.longitude)
                return (
                    <MapView.Marker
                        title="Greenwich"
                        onPress={e => props.displayMarkerInfo(e)}
                        coordinate={{
                            latitude: latitude,
                            longitude: longitude,
                        }}
                        calloutOffset={{
                            x: -50,
                            y: -50
                        }}
                    />
                )
            })
            }
          
        </MapView>
    )
}



const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    map: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
});

export default Home;