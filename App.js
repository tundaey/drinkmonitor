import React, { Component } from 'react';
import {
  Platform,
  AppState,
  StyleSheet,
  Text,
  View,
  Alert,
  DeviceEventEmitter,
  NativeModules,
  PermissionsAndroid
} from 'react-native';

const axios = require('axios');
const moment = require('moment');

import firebase from 'react-native-firebase';
import ReactTimeout from 'react-timeout'
import BackgroundTimer from 'react-native-background-timer';
import * as Notification from 'react-native-notifications'

import {Overlay, Button} from 'react-native-elements'
import { NativeRouter, Route} from 'react-router-native'

import Home from './src/Home/Home'
import QuestionForm from './src/QuestionsForm'
import PlaceDetail from './src/PlaceDetail/PlaceDetail'
import {getPlace} from './src/utils/api'

const ref = firebase.database().ref('');

const LocationAndSensorModule = NativeModules.LocationAndSensorModule
const Geolocation = NativeModules.GeoLocation

 class App extends Component<{}> {
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
      },
      appState: AppState.currentState,
      displayQuestionForm: false
    }
  }



  _handleAppStateChange = (nextAppState) => {
    this.setState({appState: nextAppState});
    console.log('app state', this.state.appState)
  }

  componentDidMount(){
    this.getLocations()
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillMount(){
    this.requestLocationPermission()
    LocationAndSensorModule.startReceiver()
    

    DeviceEventEmitter.addListener('timer', (event)=> { this.displayNotification()})
    AppState.addEventListener('change', this._handleAppStateChange);
   
    Notification.NotificationsAndroid.setNotificationOpenedListener(this.onNotificationOpened);
    
    //LocationAndSensorModule.getPermission()
    //set moving state to either Static
    DeviceEventEmitter.addListener('onTrigger', (event)=> {
        console.log('event', event)
        //LocationAndSensorModule.getLocation()
        Geolocation.startService()
        .then((data)=> console.log('location started', data))
        .catch((err)=> console.log('location starting error', err))
        
    })

    DeviceEventEmitter.addListener('updateLocation', (data)=> {
      //on receive location
      //search places 500m close to the location
      getPlace(data.coords)
      .then((data)=> {
        console.log('get location place', data.data.results)
        const results = data.data.results
        if(results.length > 0){
          this.displayNotification()
        }
      
      })
      .catch((err)=> console.log('err', err))

  
      this.state.location1 === null
      ?this.setState({location1: data.coords})
      : this.setState({location2: data.coords})

      if((this.state.location1 !== null) && (this.state.location2 !== null) ){

        LocationAndSensorModule.getDistanceBetweenLocations(
          this.state.location1.longitude, this.state.location1.latitude, 
          this.state.location2.longitude, this.state.location2.latitude,
          (distance)=> {
            console.log('distance', distance)

            if(distance < 200) {

              if(this.state.state === "Still" || this.state.state === "Unknown"){

                LocationAndSensorModule.stopSamplingLocation();
                Geolocation.stopService().then((data)=> console.log('Stop sampling location'))
                this.updateCurrentLocation(this.state.location2)
                console.log('iscurrentlocation', this.state.isCurrentLocation)
                this.displayAndSaveLocation()
                this.setState({location1: null});
                this.setState({location2: null});
                
              }else{
                LocationAndSensorModule.show('User Moving Short Distance', LocationAndSensorModule.SHORT)
              }
              
            }else{

            }
            //save the locations
           
            
          }
        )
      }

      if( (this.state.location1 !== null) && (this.state.location2 === null)){
        //check the last saved distance in the db
        //get the distance between them
        //if it is over 200m: update the timespent of this location 
        console.log('process time sent')
        const locationPromise  = this.getLastLocation()
        locationPromise.then((data)=> {
          const l = data.val()
          const key = Object.keys(location.val())
          const location = l[key[0]]
          console.log('last location', location)
           return LocationAndSensorModule.getDistance(
            this.state.location1.longitude, this.state.location1.latitude, location.longitude, location.latitude)
        }).then((distance)=> {
          console.log('my distance', distance)
          console.log('created at', location.created)
          console.log('timespent', new Date() - location.created)
        })
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
          <QuestionForm displayQuestionForm={this.state.displayQuestionForm}/>
          {/* <QuestionForm displayQuestionForm={true}/> */}
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
          'message': 'Cool Photo App needs access to your camera so you can take awesome pictures.'
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

  displayNotification = ()=>{
    console.log('display alert')
    console.log('app state',this.state.appState)
    if(this.state.appState === 'active'){
      //this.showQuestionForm()
      this.displayForm()
    }else{
      this.sendNotification()
    }
  }

  sendNotification = () => {
    Notification.NotificationsAndroid.localNotification({
      title: "Local notification",
      body: "This notification was generated by the app!",
      extra: "data"
    });
  }

  displayForm = () => {
    this.setState({displayQuestionForm: true})
  }

  onNotificationReceivedBackground = (notification) => {
    console.log("Notification Received - Background", notification);
  }
  
  onNotificationOpened = (notification) => {
    this.setState({displayQuestionForm: true})
  }

  displayAndSaveLocation = ()=> {
    console.log('display and save location')
    BackgroundTimer.start()
    LocationAndSensorModule.setTimeout()
    this.getPlaceAndSaveLocation(this.state.currentLocation)
  }

  getPlaceAndSaveLocation = (location)=> {
    // get the name and the type of the place
    getPlace(location)
    .then((data)=> {
      console.log('get place data', data)
      const dataTobeSaved = {
        //duration: timespent,
        latitude: location.latitude,
        longitude: location.longitude,
        place: data.data.results[0].formatted_address,
        type: data.data.results[0].types,
        created: new Date()
      }
      console.log('data to be saved', dataTobeSaved)

      
      const locationId = ref.child('locations').push().key
      console.log('locationId', locationId)
      const locationPromise = ref.child(`locations/${locationId}`).set(dataTobeSaved)
      locationPromise.then((data)=> {
        const locations = this.state.locations
      })
      
    })
    .catch((err)=> console.log('error', err))
    //save that location
  }

  getLastLocation = ()=> {
    const lastLocationRef = ref.child(`locations`).orderByKey().limitToLast(1)
    const lastLocation = lastLocationRef.once("value", (data)=>  data.val())
    return lastLocation
  }

  updateCurrentLocation = (currentLocation) => {
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

  getLocations =() =>{
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

  saveLocation = (location)=> {
    axios.post('http://165.227.103.10:3000/api/v1/locations', location).then(()=> {
      this.setState({location1: null});
      this.setState({location2: null});
      this.getLocations()
    }).catch(()=> LocationAndSensorModule.show('Error: Same Location', LocationAndSensorModule.SHORT))
  }

  

  displayMarkerInfo =(e) => {
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

export default App


