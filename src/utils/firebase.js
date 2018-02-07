import RNFirebase from 'react-native-firebase';

const config = {
    apiKey: "AIzaSyCp4-D4OYrOo5jPH0GCzH-7BXzzUN6xjxw",
    authDomain: "drinkmonitor-3315f.firebaseapp.com",
    databaseURL: "https://drinkmonitor-3315f.firebaseio.com",
    projectId: "drinkmonitor-3315f",
    storageBucket: "drinkmonitor-3315f.appspot.com",
    messagingSenderId: "548442397675"
};

const firebase = RNFirebase.initializeApp(config);

export default firebase;