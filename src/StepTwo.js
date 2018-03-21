import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, Icon,Input, CheckBox } from 'react-native-elements';


export default class StepTwo extends Component{
    state = {
        checked: false,
        answer: 'No'
    }

    selectAnswer = (answer)=> {
        this.setState({checked: !this.state.checked, answer: answer})
    }

    nextPreprocess = ()=>{
      
        console.log('StepTwo answer', this.state.answer)
        // Save step state for use in other steps of the wizard
        this.props.saveState(0,{key:'value'})
       
        // Go to next step
        this.props.nextFn()
            
           
      }

      previousPreprocess = ()=>{
      
        console.log('previous')
        // Go to previous step
        this.props.prevFn()
            
           
      }

      render(){
          return (
              <View style={{flexDirection: 'column', justifyContent: 'space-around'}}>
                <View style={{flex: 2, marginBottom: 10, padding: 10}}>
                    <Text h4>Did you have any drinks?</Text>
                    <CheckBox
                        title='Yes'
                        onPress={() => this.selectAnswer('Yes')}
                        onLongPress={() => this.selectAnswer('Yes')}
                        iconType='material'
                        checkedIcon='radio-button-checked'
                        uncheckedIcon='radio-button-unchecked'
                        checked={this.state.checked}
                    />
                    <CheckBox
                        title='No'
                        onPress={() => this.selectAnswer('Yes')}
                        onLongPress={() => this.selectAnswer('Yes')}
                        iconType='material'
                        checkedIcon='radio-button-checked'
                        uncheckedIcon='radio-button-unchecked'
                        checked={!this.state.checked}
                    />
                    
                </View>
                  <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Button
                        title={''}
                        buttonStyle={{
                            backgroundColor: "rgb(152,251,152)",
                            width: 50,
                            height: 25,
                            borderColor: "transparent",
                            borderWidth: 0,
                            borderRadius: 5
                          }}
                        icon={
                            <Icon
                            name='arrow-back'
                            size={15}
                            color='white'
                            />
                        }
                        containerStyle={{marginLeft: 10}} onPress={this.previousPreprocess}/>
                        <Button
                        title={''}
                        iconRight
                        buttonStyle={{
                            backgroundColor: "rgb(152,251,152)",
                            width: 50,
                            height: 25,
                            borderColor: "transparent",
                            borderWidth: 0,
                            borderRadius: 5
                          }}
                        icon={
                            <Icon
                            name='arrow-forward'
                            size={15}
                            color='white'
                            />
                        }
                        containerStyle={{marginRight: 10}} onPress={this.nextPreprocess}/>
                    
                  </View>
              </View>
          )
      }  
 
}
 

 
