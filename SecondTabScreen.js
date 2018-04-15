import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
  } from 'react-native';

import { BarChart, Grid, YAxis, XAxis } from 'react-native-svg-charts'
import Swiper from 'react-native-swiper';
import * as scale from 'd3-scale'

export default class SecondTabScreen extends Component {
    render() {
        const fill = 'rgb(134, 65, 244)'

        const drinks = [ {label: 'Mon', value: 0}, 
            {label: 'Tues', value: 3},
            {label: 'Wed', value: 5},
            {label: 'Thurs', value: 1},
            {label: 'Fri', value: 5},
            {label: 'Sat', value: 2},
            {label: 'Sun', value: 0},
        ]

        const timeSpent = [ {label: 'Mon', value: 20}, 
            {label: 'Tues', value: 0},
            {label: 'Wed', value: 0},
            {label: 'Thurs', value: 50},
            {label: 'Fri', value: 120},
            {label: 'Sat', value: 20},
            {label: 'Sun', value: 63},
        ]
        

        const piedata = [
            {
                key: 1,
                amount: 50,
                svg: { fill: '#600080' },
            },
            {
                key: 2,
                amount: 50,
                svg: { fill: '#9900cc' }
            },
            {
                key: 3,
                amount: 40,
                svg: { fill: '#c61aff' }
            },
            {
                key: 4,
                amount: 95,
                svg: { fill: '#d966ff' }
            },
            {
                key: 5,
                amount: 35,
                svg: { fill: '#ecb3ff' }
            }
        ]

        return (

            <Swiper style={styles.wrapper} showsButtons={true}>
                <View style={styles.slide1}>
                    <Text h4>Average Drinks per day</Text>
                    <BarChart
                        style={{ flex: 1 }}
                        data={drinks}
                        yAccessor={({ item }) => item.value}
                        gridMin={0}
                        svg={{ fill: 'rgb(134, 65, 244)' }}
                    />
                    <XAxis
                        style={{ marginTop: 10 }}
                        data={ drinks }
                        scale={scale.scaleBand}
                        formatLabel={(_, index) => drinks[ index ].label}
                        labelStyle={ { color: 'black' } }
                    />
                </View>
                {/* <View style={styles.slide1}>
                    <Text h4>Daily drink times</Text>
                    <BarChart
                        style={{ flex: 1 }}
                        data={xdata}
                        yAccessor={({ item }) => item.value}
                        gridMin={0}
                        svg={{ fill: 'rgb(134, 65, 244)' }}
                    />
                    <XAxis
                        style={{ marginTop: 10 }}
                        data={ xdata }
                        scale={scale.scaleBand}
                        formatLabel={(_, index) => xdata[ index ].label}
                        labelStyle={ { color: 'black' } }
                    />
                </View> */}
                <View style={styles.slide1}>
                    <Text h4>Average time spent at the bar</Text>
                    <BarChart
                        style={{ flex: 1 }}
                        data={timeSpent}
                        yAccessor={({ item }) => item.value}
                        gridMin={0}
                        svg={{ fill: 'rgb(134, 65, 244)' }}
                    />
                    <XAxis
                        style={{ marginTop: 10 }}
                        data={ timeSpent }
                        scale={scale.scaleBand}
                        formatLabel={(_, index) => timeSpent[ index ].label}
                        labelStyle={ { color: 'black' } }
                    />
                </View>
                
                
            </Swiper>
        )
    }
}

const styles = StyleSheet.create({
    wrapper: {
    },
    slide1: {
      flex: 1,
      height: 50,
      padding: 20
    },
    slide2: {
      flex: 1,
    //   justifyContent: 'center',
    //   alignItems: 'center',
    //   backgroundColor: '#97CAE5',
      flexDirection: 'row', height: 200, paddingVertical: 16 
    },
    slide3: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#92BBD9',
    },
    text: {
      color: '#fff',
      fontSize: 30,
      fontWeight: 'bold',
    }
  })