import { AppRegistry } from 'react-native';
import App from './App';


AppRegistry.registerHeadlessTask('locationUpdates', () => require('./src/utils/locationUpdates'));

AppRegistry.registerComponent('drinkmonitor', () => App);
