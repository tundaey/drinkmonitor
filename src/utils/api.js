import firebase from 'react-native-firebase';
const axios = require('axios');
const key = "AIzaSyBNoHvrWXWbpWVDHUZaK_lSYz8eHmT059A"

const ref = firebase.database().ref('');

const client_id = 'ZZB3HQDSMD21RWQGOI4HADQHWXDJB0XUCWVPXLE5GF4UV1WP'
const client_secret='ITXZFPWTRVMOICPDY1OFML005SNX5BLWLYUDKPCIXQEX4RRZ'
const v=20170801
//const location = e.nativeEvent.coordinate;
const url = 'https://api.foursquare.com/v2'
// axios.get(`https://api.foursquare.com/v2/venues/search?intent = match&ll=52.5118158,-1.8458374&client_id=ZZB3HQDSMD21RWQGOI4HADQHWXDJB0XUCWVPXLE5GF4UV1WP&client_secret=ITXZFPWTRVMOICPDY1OFML005SNX5BLWLYUDKPCIXQEX4RRZ&v=20170801`)
// .then((data)=> console.log('details', data))
// .catch((err)=> console.log('error', err))

export function getPlace(location){
    console.log('location', typeof location.latitude)
    const RADIUS = 30
    const newPlaceURI = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=
    ${location.latitude},${location.longitude}&radius=${RADIUS}&type=Bars+and+pubs&keyword=Bars+and+pubs&key=${key}`

    const oldPlaceURI = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}
    &key=AIzaSyBNoHvrWXWbpWVDHUZaK_lSYz8eHmT059A`
    return axios.get(newPlaceURI)
    .then((data)=> data )
    .catch((err)=> err)
}