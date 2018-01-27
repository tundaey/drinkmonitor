import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  DeviceEventEmitter,
  NativeModules
} from 'react-native';

const axios = require('axios');
const moment = require('moment')
import Home from './src/Home/Home'

const LocationAndSensorModule = NativeModules.LocationAndSensorModule
console.log('Location module ->>> import', LocationAndSensorModule )

export default class App extends Component<{}> {
  constructor(){
    super()
    this.state = {
      location1: null,
      location2: null,
      state: 'Unknown',
      locations: []
    }

    this.displayMarkerInfo = this.displayMarkerInfo.bind(this)
    this.getLocations = this.getLocations.bind(this)
  }

  componentDidMount(){
    
  }

  componentWillMount(){
    console.log('Location module ->>> will mount', LocationAndSensorModule )
    LocationAndSensorModule.getPermission()
    //set moving state to either Static
    DeviceEventEmitter.addListener('onTrigger', (event)=> {
        console.log('event', event)
        //set moving state to moving
        //collect user location data every 5 minutes
        LocationAndSensorModule.getLocation()
    })

    DeviceEventEmitter.addListener('pushLocation', (data)=> {
      console.log('location', data)
  
      this.state.location1 === null
      ?this.setState({location1: data})
      : this.setState({location2: data})

      if((this.state.location1 !== null) && (this.state.location2 !== null) ){
        LocationAndSensorModule.getDistanceBetweenLocations(
          this.state.location1.longitude, this.state.location1.latitude, this.state.location2.longitude, this.state.location2.latitude,
          (distance)=> {
            console.log('distance', distance)
            if(distance < 200) {
              if(this.state.state === "Still" || this.state.state === "Unknown"){
                LocationAndSensorModule.stopSamplingLocation();
                console.log('sampling stopped');
                LocationAndSensorModule.show('Not Moving Short Distance', LocationAndSensorModule.SHORT)
                axios.post('http://165.227.103.10:3000/api/v1/locations', this.state.location1).then(()=> {
                  this.setState({location1: null});
                  this.setState({location2: null});
                  this.getLocations()
                }).catch(()=> LocationAndSensorModule.show('Error: Same Location', LocationAndSensorModule.SHORT))
              }else{
                LocationAndSensorModule.show('User Moving Short Distance', LocationAndSensorModule.SHORT)
                axios.post('http://165.227.103.10:3000/api/v1/locations', data).then(()=> {
                LocationAndSensorModule.show('Different Location', LocationAndSensorModule.SHORT);
                this.setState({location1: null});
                this.setState({location2: null});
                this.getLocations()
              }).catch(()=> LocationAndSensorModule.show('Error: Different Location', LocationAndSensorModule.SHORT)) 
              }
              
            }else{
              axios.post('http://165.227.103.10:3000/api/v1/locations', data).then(()=> {
                console.log('saved different location');
                LocationAndSensorModule.show('Different Location', LocationAndSensorModule.SHORT);
                this.setState({location1: null});
                this.setState({location2: null});
                this.getLocations()
              }).catch(()=> LocationAndSensorModule.show('Error: Different Location', LocationAndSensorModule.SHORT))
            }
            //save the locations
           
            
          }
        )
      }

    })

    DeviceEventEmitter.addListener('JS-Event', (data)=> {
      let activity = JSON.parse(data) 
      console.log('activity', activity, moment().format('YYYY-MM-DD h:mm'))
      console.log('state', this.state.state)
      if(activity.confidence > 75){
        this.setState({state: activity.type})
      }
    })
  }

  
  render() {
    return (
      <Home locations={this.state.locations} displayMarkerInfo={this.displayMarkerInfo}/>
    );
  }

  getLocations(){
    axios.get('http://165.227.103.10:3000/api/v1/locations')
    .then(({data})=> this.setState({locations: data.data}))
  }

  displayMarkerInfo(e){
    console.log('location', e.nativeEvent)
    const client_id = 'ZZB3HQDSMD21RWQGOI4HADQHWXDJB0XUCWVPXLE5GF4UV1WP'
    const client_secret='ITXZFPWTRVMOICPDY1OFML005SNX5BLWLYUDKPCIXQEX4RRZ'
    const v=20170801
    const location = e.nativeEvent.coordinate;
    const url = 'https://api.foursquare.com/v2'
    // axios.get(`https://api.foursquare.com/v2/venues/search?intent = match&ll=52.5118158,-1.8458374&client_id=ZZB3HQDSMD21RWQGOI4HADQHWXDJB0XUCWVPXLE5GF4UV1WP&client_secret=ITXZFPWTRVMOICPDY1OFML005SNX5BLWLYUDKPCIXQEX4RRZ&v=20170801`)
    // .then((data)=> console.log('details', data))
    // .catch((err)=> console.log('error', err))
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}
    &key=AIzaSyBNoHvrWXWbpWVDHUZaK_lSYz8eHmT059A`)
    .then((data)=> console.log('details', data))
    .catch((err)=> console.log('error', err))
  }
}


