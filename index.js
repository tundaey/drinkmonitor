import { AppRegistry } from 'react-native';
import App from './src/config/router'
import LApp from './LApp';



//AppRegistry.registerHeadlessTask('locationUpdates', () => require('./src/utils/locationUpdates'));

console.ignoredYellowBox = [
    'Setting a timer'
  ];

AppRegistry.registerComponent('drinkmonitor', () => App);
