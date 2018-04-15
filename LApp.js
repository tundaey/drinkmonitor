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

import {Overlay, Button, Icon} from 'react-native-elements'
import { NativeRouter, Route} from 'react-router-native'

import Home from './src/Home/Home'
import QuestionForm from './src/QuestionsForm'
import PlaceDetail from './src/PlaceDetail/PlaceDetail'
import {getPlace} from './src/utils/api'

const ref = firebase.database().ref('');

const LocationAndSensorModule = NativeModules.LocationAndSensorModule
const Geolocation = NativeModules.GeoLocation
const DISTANCE_THRESHOLD = 250

 class App extends Component<{}> {
  constructor(){
    super()
    this.state = {
      location1: null,
      location2: null,
      sampleLocations: [],
      sampleActivities: [],
      state: 'U',
      locations: [],
      locationsLoaded: false,
      changeState: false,
      isVisible: false,
      isCurrentLocation: false,
      currentLocation: {
        longitude: '',
        latitude: '',
        timestamp: ''
      },
      appState: AppState.currentState,
      updated: 0,
      displayQuestionForm: false,
      placeName: 'Are you at a bar?'
    }
  }



  _handleAppStateChange = (nextAppState) => {
    this.setState({appState: nextAppState, changeState: false});
    console.log('app state', this.state.appState)
  }

  componentDidMount(){
    this.getLocations()
    AppState.addEventListener('change', this._handleAppStateChange);
    //this.setState({state: 'U'})
  }

  componentDidUpdate(){
      //this.setState({updated: 1})
      console.log('locations loaded', this.state.locationsLoaded)
      if(this.state.changeState) this.handleUserState(this.state.state)
  }

  componentWillMount(){
    this.requestLocationPermission()
    //LocationAndSensorModule.startReceiver()
    DeviceEventEmitter.addListener('timer', (event)=> { 
        this.displayNotification()
    })

    DeviceEventEmitter.addListener('timer_for_state', (event)=> { 
        console.log('timer for state', event)
        this.handleUnknownState()
    })
    //AppState.addEventListener('change', this._handleAppStateChange);
    Notification.NotificationsAndroid.setNotificationOpenedListener(this.onNotificationOpened);
    this.handleTriggerListener()
    
    this.handleUpdateLocationListener()
    this.handleUserActivityUpdates()
  }

  handleUserState = (userState)=> {
    if(userState === "U"){
        LocationAndSensorModule.show('Unknown State', LocationAndSensorModule.SHORT)
        this.handleUnknownState()
    }
    if(userState === "M"){
        LocationAndSensorModule.show('Moving State', LocationAndSensorModule.SHORT)
        this.handleMovingState()
    }
    if(userState === "S"){
        LocationAndSensorModule.show('Still State', LocationAndSensorModule.SHORT)
        this.handleStillState()
    }
  }

  handleStillState = () => {
      console.log('Still State', this.state.state)
      //stop collecting
      Geolocation.stopService().then((data)=> {
        console.log('Stop sampling location')
        LocationAndSensorModule.show('`Stop Sampling Location', LocationAndSensorModule.SHORT)
     })
     LocationAndSensorModule.stopActivityUpdates()
  }

  handleMovingState = () => {
    console.log('Moving State', this.state.state)
    Geolocation.startService()
        .then((data)=> console.log('location started', data))
        .catch((err)=> console.log('location starting error', err))
    this.setState({sampleLocations: []})
  }

  handleUnknownState = ()=> {
    navigator.geolocation.getCurrentPosition(
        (data)=> {
            console.log('location', data.coords)

            //store the location if only the array is empty or has a length of 1
            if(this.state.sampleLocations.length === 0 || this.state.sampleLocations.length === 1){
                console.log('sample locations is 0 or 1')
                const {latitude, longitude} = data.coords
                this.state.sampleLocations.push({longitude, latitude})
                this.sampleAnotherLocation()
                console.log('push locations', this.state.sampleLocations)
            }
            if(this.state.sampleLocations.length === 2){
                 //if the distance is greater than 250 setstate to M
                //else set state to S 
                this.searchCloseBars(data)
                this.handleLocationDistance(this.state.sampleLocations)
            }
        }
    )
  }

  sampleAnotherLocation =()=> {
    console.log('sample another location called')
    LocationAndSensorModule.setTimeoutForState()
  }

  handleUserActivityUpdates = () => {
    DeviceEventEmitter.addListener('JS-Event', (data)=> {
        let activity = JSON.parse(data) 
        console.log('activity', activity.type)
        if(activity.confidence > 50){
            this.state.sampleActivities.push(activity.type)
        }
        
        this.processActivityUpdates()
    
      })
  }

  processActivityUpdates(){
    const {state} = this.state
    //check the state, if it S
    if(state === "S"){
        //check the last two entries of sampleActivities
        const entries = this.state.sampleActivities.slice(Math.max(this.state.sampleActivities.length - 2, 1))
        if(entries.length > 1){
            // if they indicate user is in vehicle, bicycle, on foot, running or walking with confidence > 50
            const firstState = (entries[0] === "In Vehicle" || entries[0] === "On Bicycle" || 
                entries[0] === "On Foot" || entries[0] === "Running" || entries[0] === "Walking")
            
            const secondState = (entries[1] === "In Vehicle" || entries[1] === "On Bicycle" || 
                entries[1] === "On Foot" || entries[1] === "Running" || entries[1] === "Walking")

                console.log('check entries', firstState, secondState)
            //change to U
            if(firstState === true && secondState === true) this.setState({state: "U", changeState: true})
        }
        

    } 

    //check the state if it is M
    if(state === "M"){
        // check the last two entries of sampleActivities
        
        const entries = this.state.sampleActivities.slice(Math.max(this.state.sampleActivities.length - 2, 1))
        if(entries.length > 1){
           //if they indicate user is still with confidence > 50
            
            //change to U
            //and save the location and the question
            if(entries[0] === "Still" && entries[1] === "Still") this.setState({state: "U", changeState: true})
        }

    } 
  }


  handleUpdateLocationListener = ()=> {
    DeviceEventEmitter.addListener('updateLocation', (data)=> {
        console.log('update location', data.coords)
        this.searchCloseBars(data)
        LocationAndSensorModule.show('Location Received', LocationAndSensorModule.SHORT)
        //store the location if only the array is empty or has a length of 1
        if(this.state.sampleLocations.length === 0 || this.state.sampleLocations.length === 1){
            console.log('sample locations is 0 or 1')
            const {latitude, longitude} = data.coords
            this.state.sampleLocations.push({longitude, latitude})
            console.log('moving push locations', this.state.sampleLocations)
        }
        //if there are two elements in the array, get the distance between the two states
       
        if(this.state.sampleLocations.length === 2){
             //if the distance is greater than 250 setstate to M
            //else set state to S 
            this.handleLocationDistance(this.state.sampleLocations)
        }
  
      })  
  }

  handleTriggerListener = ()=> {
    DeviceEventEmitter.addListener('onTrigger', (event)=> {
        console.log('event', event)
        LocationAndSensorModule.requestActivityUpdates()
        
    })
  }

  searchCloseBars = (location)=> {
    getPlace(location.coords)
    .then((data)=> {
      console.log('get location place', data.data.results)
      const results = data.data.results
      if(results.length > 0){
          const place = results[0].name
          //this.setState({currentLocation: location.coords, changeState: false})
        this.displayNotification(place)
      }
    })
    .catch((err)=> console.log('err', err))
  }

  handleLocationDistance = (locations)=> {
    LocationAndSensorModule.getDistanceBetweenLocations(
        locations[0].longitude, locations[0].latitude, 
        locations[1].longitude, locations[1].latitude,
        (distance)=> {

          if(distance < DISTANCE_THRESHOLD) {
              this.setState({state: 'S',changeState: true})
          }else{
            this.setState({state: 'M', changeState: true})
          }
          //this.setState({sampleLocations: []})
        }
      )
  }


  cancelLocationSampling = ()=> {
    //LocationAndSensorModule.stopSamplingLocation();
    Geolocation.stopService().then((data)=> {
        console.log('Stop sampling location')
        LocationAndSensorModule.show('`Stop Sampling Location', LocationAndSensorModule.SHORT)
     })
  }

  processTimeSpent = ()=> {
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

  saveAnswers = (data) => {
    console.log('save answers', data)
    this.setState({displayQuestionForm: false, changeState: false})
  }
  
  render() {
    return (
        <View style={styles.container}>
          <Home locations={this.state.locations} displayMarkerInfo={this.displayMarkerInfo}/>
          <QuestionForm 
            placeName={this.state.placeName} 
            saveAnswers={this.saveAnswers}
            displayQuestionForm={this.state.displayQuestionForm}/>
          <Overlay 
            containerStyle={styles.overlay} 
            isVisible={this.state.isVisible}
            overlayStyle={{flex: 1, marginTop: 350}}
            borderRadius={0} 
            width='auto' 
            height={250}>
                <View style={{flex: 1,flexDirection: 'column', justifyContent: 'space-between'}}>
                    <View style={{flexDirection: 'column'}}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <View style={{flex: 1, alignItems: 'flex-start'}}>
                                <Icon
                                    onPress={()=> this.setState({isVisible: false, changeState: false})}
                                    onLongPress={()=> this.setState({isVisible: false,changeState: false})}
                                    name='cancel'
                                    size={20}
                                    color='#517fa4'
                                />
                            </View>
                            <View style={{flex: 1, marginTop: -50, zIndex: 1}}>
                                <Icon
                                    
                                    reverse
                                    size={40}
                                    name='place'
                                    color='#517fa4'
                                />
                            </View>
                            <Text style={{ flex: 1}}>{'20 September, 2017'}</Text>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                            <View style={{flexDirection: 'column'}}>
                                <Text style={{textAlign: 'center'}}>Pub/Bar</Text>
                                <Text style={{textAlign: 'center'}}>The Albion</Text>
                                <Text style={{textAlign: 'center'}}>1157, Albion Street, Albion</Text>
                            </View>
                        </View>
                    </View>
                    
                    

                    <View>
                        <View style={{flexDirection: 'row',justifyContent: 'center'}}><Text>x4</Text></View>
                        <View style={{flexDirection: 'row',justifyContent: 'center'}}><Text>3 hours, 40 minutes</Text></View>
                    </View>
                    
                </View>  
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
        //console.log("You can sample location")
      } else {
        console.log("Location permission denied")
      }

    }catch(err){
      console.log('Location permission denied error', err)
    }
  }

  displayNotification = (place)=>{
    if(this.state.appState === 'active'){
      this.displayForm(place)
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

  displayForm = (place) => {
    this.setState({displayQuestionForm: true, changeState: false, placeName: `Are you at ${place}`})
  }

  onNotificationReceivedBackground = (notification) => {
    console.log("Notification Received - Background", notification);
  }
  
  onNotificationOpened = (notification) => {
    this.setState({displayQuestionForm: true})
  }

  displayAndSaveLocation = ()=> {
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
      const data = snapshot.val()
      const keys = Object.keys(data)
      const returnedData = keys.map((key)=> data[key])
      this.setState({locations: returnedData, changeState: true})
    })
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
    this.setState({isVisible: true, changeState: false})
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


