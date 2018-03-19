import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Button } from 'react-native-elements';


export default class StepThree extends Component{
    nextPreprocess= ()=>{
      
        // Save step state for use in other steps of the wizard
        this.props.saveState(0,{key:'value'})
       
        // Go to next step
        this.props.nextFn()
            
           
      }

      previousPreprocess= ()=>{
      
 
        // Go to previous step
        this.props.prevFn()
            
           
      }

      render(){
          return (
              <View>
                  <Text>Step Three</Text>
                  <Button title='Previous' onPress={this.previousPreprocess}/>
                  <Button title='Next' onPress={this.nextPreprocess}/>
              </View>
          )
      }  
 
}
 

 
