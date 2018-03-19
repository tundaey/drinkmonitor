import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MultiStep from 'react-native-multistep-wizard'
import StepOne from './StepOne'
import StepTwo from './StepTwo'
import StepThree from './StepThree'

import Modal from "react-native-modal";
import PopupDialog, {
    DialogTitle,
    DialogButton,
    SlideAnimation,
    ScaleAnimation,
    FadeAnimation,
  } from 'react-native-popup-dialog';

const slideAnimation = new SlideAnimation({ slideFrom: 'bottom' });
const steps = [
  {name: 'StepOne', component: <StepOne/>},
  {name: 'StepTwo', component: <StepTwo/>},
  {name: 'StepThree', component: <StepThree/>},
];

class QuestionForm extends Component {
  finish = (wizardState)=>{
    //code to be executed when wizard is finished
    console.log('wizard state', wizardState)
            
  }
    render(){
        return (
        <PopupDialog
            dialogTitle={<DialogTitle title="Drink Questionnaire" />}
            dialogAnimation={slideAnimation}
            
            width={0.9}
            show={this.props.displayQuestionForm}
            ref={(popupDialog) => { this.popupDialog = popupDialog; }}>
        <View>
          <MultiStep steps={steps} onFinish={this.finish}/>
        </View>
      </PopupDialog>
        )
    }
}

export default QuestionForm