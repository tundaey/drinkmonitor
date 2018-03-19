import { AppRegistry } from 'react-native';
import App from './App';
import LApp from './LApp';


//AppRegistry.registerHeadlessTask('locationUpdates', () => require('./src/utils/locationUpdates'));

console.ignoredYellowBox = [
    'Setting a timer'
  ];

AppRegistry.registerComponent('drinkmonitor', () => LApp);
