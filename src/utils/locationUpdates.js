import {NativeModules} from 'react-native'

const Geolocation = NativeModules.GeoLocation


module.exports = async (taskData) => {
    // do stuff
    console.log('taskData', taskData)
    Geolocation.startBackgroundService()
        .then((data)=> console.log('location started', data))
        .catch((err)=> console.log('location starting error', err))
};