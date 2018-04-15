import React, {Component} from 'react'
import { TabNavigator } from 'react-navigation'
import { Icon } from 'react-native-elements';

import SecondTabScreen from '../../SecondTabScreen'
import LApp from '../../LApp'

export const Tabs = TabNavigator({
    Places: {
      screen: LApp,
    },
    Statistics: {
      screen: SecondTabScreen,
    },
});

class App extends Component {
    render() {
      return <Tabs />;
    }
  }
  
export default App;