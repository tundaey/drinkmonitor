import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  DeviceEventEmitter,
  NativeModules,
  PermissionsAndroid
} from 'react-native';

const axios = require('axios');
const moment = require('moment')
import Home from './src/Home/Home'
import PlaceDetail from './src/PlaceDetail/PlaceDetail'
import {getPlace} from './src/utils/api'

import {Overlay, Button} from 'react-native-elements'
import { NativeRouter, Route} from 'react-router-native'
//import firebase from './src/utils/firebase'
import firebase from 'react-native-firebase';

console.log('native modules', NativeModules)
const LocationAndSensorModule = NativeModules.LocationAndSensorModule
const Geolocation = NativeModules.GeoLocation

export default class App extends Component<{}> {
  constructor(){
    super()
    this.state = {
      location1: null,
      location2: null,
      state: 'Unknown',
      locations: [],
      isVisible: false,
      isCurrentLocation: false,
      currentLocation: {
        longitude: '',
        latitude: '',
        timestamp: ''
      }
    }

    this.displayMarkerInfo = this.displayMarkerInfo.bind(this)
    this.getLocations = this.getLocations.bind(this)
    this.saveLocation = this.saveLocation.bind(this)
    this.updateCurrentLocation = this.updateCurrentLocation.bind(this)
    this.getPlaceAndSaveLocation = this.getPlaceAndSaveLocation.bind(this)
  }

  componentDidMount(){
    this.getLocations()
  }

  componentWillMount(){
    this.requestLocationPermission()
    LocationAndSensorModule.startReceiver()
    
    //LocationAndSensorModule.getPermission()
    //set moving state to either Static
    DeviceEventEmitter.addListener('onTrigger', (event)=> {
        console.log('event', event)
        //LocationAndSensorModule.getLocation()
        Geolocation.startService()
        .then((data)=> console.log('location started', data))
        .catch((err)=> console.log('location starting error', err))
        
        console.log('iscurrentlocation', this.state.isCurrentLocation)
        if(this.state.isCurrentLocation){
          const userState = this.state.state
          const endTime = new Date()
          const startTime = this.state.currentLocation.timestamp
          console.log('start', startTime)
          console.log('end', endTime)
          const timespent =  (endTime - startTime)/1000
          
          console.log('timespent', timespent)
          this.getPlaceAndSaveLocation(timespent, this.state.currentLocation)
          LocationAndSensorModule.show('Location Saved', LocationAndSensorModule.SHORT)
          //if(userState === 'Still' && timespent > 500) this.getPlaceAndSaveLocation(timespent, this.state.currentLocation)
          
        }
        
    })

    DeviceEventEmitter.addListener('updateLocation', (data)=> {
      console.log('location', data)

  
      this.state.location1 === null
      ?this.setState({location1: data.coords})
      : this.setState({location2: data.coords})

      if((this.state.location1 !== null) && (this.state.location2 !== null) ){

        LocationAndSensorModule.getDistanceBetweenLocations(
          this.state.location1.longitude, this.state.location1.latitude, this.state.location2.longitude, this.state.location2.latitude,
          (distance)=> {
            console.log('distance', distance)

            if(distance < 200) {

              if(this.state.state === "Still" || this.state.state === "Unknown"){

                LocationAndSensorModule.stopSamplingLocation();
                Geolocation.stopService().then((data)=> console.log('Stop sampling location'))
                this.updateCurrentLocation(this.state.location2)
                this.setState({location1: null});
                this.setState({location2: null});
                LocationAndSensorModule.show('Stop sampling location', LocationAndSensorModule.SHORT)
                
              }else{
                LocationAndSensorModule.show('User Moving Short Distance', LocationAndSensorModule.SHORT)
              }
              
            }else{

              // axios.post('http://165.227.103.10:3000/api/v1/locations', data).then(()=> {
              //   console.log('saved different location');
              //   LocationAndSensorModule.show('Different Location', LocationAndSensorModule.SHORT);
              //   this.setState({location1: null});
              //   this.setState({location2: null});
              //   this.getLocations()
              // }).catch(()=> LocationAndSensorModule.show('Error: Different Location', LocationAndSensorModule.SHORT))
            }
            //save the locations
           
            
          }
        )
      }

    })

    DeviceEventEmitter.addListener('JS-Event', (data)=> {
      let activity = JSON.parse(data) 
      if(activity.confidence > 75){
        this.setState({state: activity.type})
      }
      console.log('activity', activity, moment().format('YYYY-MM-DD h:mm'))
      console.log('state', this.state.state)
    })
  }

  
  render() {
    //const HomeComponent = <Home locations={this.state.locations} displayMarkerInfo={this.displayMarkerInfo} {...defaultProps} />
    return (
        // <NativeRouter>
        //   <View style={styles.container}>
        //     {/* <Route exact path="/" component={Home}/> */}
        //     <Route path="/" component={PlaceDetail}/>
        //   </View>
        // </NativeRouter>
        <View style={styles.container}>
          <Home locations={this.state.locations} displayMarkerInfo={this.displayMarkerInfo}/>
          <Overlay 
            containerStyle={styles.overlay} 
            isVisible={this.state.isVisible}
            overlayStyle={{flex: 1, marginTop: 300}}
            borderRadius={0} 
            width='auto' 
            height={300}>
                <Text >Hello from Overlay!</Text>
                <Button onPress={()=> this.setState({isVisible: false})} title='BUTTON' />
          </Overlay>
        </View>
        
    );
  }

  async requestLocationPermission(){
    try{
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'Drinkmonitor Location Permission',
          'message': 'Cool Photo App needs access to your camera ' +
                     'so you can take awesome pictures.'
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can sample location")
      } else {
        console.log("Location permission denied")
      }

    }catch(err){
      console.log('err', err)
    }
  }

  getLocations(){
    const ref = firebase.database().ref('locations')
    ref.once('value', (snapshot)=> {
      console.log('snapshot', snapshot.val())
      const data = snapshot.val()
      const keys = Object.keys(data)
      const returnedData = keys.map((key)=> data[key])
      console.log('returned data', returnedData)
      this.setState({locations: returnedData})
    })
    // axios.get('http://165.227.103.10:3000/api/v1/locations')
    // .then(({data})=> this.setState({locations: data.data}))
  }

  saveLocation(location){
    axios.post('http://165.227.103.10:3000/api/v1/locations', location).then(()=> {
      this.setState({location1: null});
      this.setState({location2: null});
      this.getLocations()
    }).catch(()=> LocationAndSensorModule.show('Error: Same Location', LocationAndSensorModule.SHORT))
  }

  getPlaceAndSaveLocation(timespent, location){
    // get the name and the type of the place
    console.log('timespent', timespent)
    getPlace(location)
    .then((data)=> {
      console.log('get place data', data)
      const dataTobeSaved = {
        duration: timespent,
        latitude: location.latitude,
        longitude: location.longitude,
        place: data.data.results[0].formatted_address,
        type: data.data.results[0].types
      }
      console.log('data to be saved', dataTobeSaved)

      const ref = firebase.database().ref('');
      const locationId = ref.child('locations').push().key
      console.log('locationId', locationId)
      const locationPromise = ref.child(`locations/${locationId}`).set(dataTobeSaved)
      
    })
    .catch((err)=> console.log('error', err))
    //save that location
  }

  updateCurrentLocation(currentLocation){
    this.setState({
      currentLocation: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        timestamp: new Date()
      },
      isCurrentLocation: true
    })
    LocationAndSensorModule.show('Current location updated', LocationAndSensorModule.SHORT)
  }

  displayMarkerInfo(e){
    console.log('location', e.nativeEvent)
    this.setState({isVisible: true})
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    //justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    flexDirection: 'row',
    alignSelf: 'flex-end',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})


