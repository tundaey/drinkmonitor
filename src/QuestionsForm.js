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


class QuestionForm extends Component {

  closeDialog = (answer)=> {
    console.log('close dialog')
    this.props.saveAnswers(answer)

  }

  finish = (wizardState)=>{
    //code to be executed when wizard is finished
    console.log('wizard state', wizardState)
    this.props.saveAnswers(wizardState)
            
  }

  steps = [
    {name: 'StepOne', component: <StepOne closeDialog={this.closeDialog}/>},
    {name: 'StepTwo', component: <StepTwo closeDialog={this.closeDialog}/>},
    {name: 'StepThree', component: <StepThree/>},
  ];

  render(){
      return (
      <PopupDialog
          dialogTitle={<DialogTitle title="Drink Questionnaire" />}
          dialogAnimation={slideAnimation}
          
          width={0.9}
          show={this.props.displayQuestionForm}
          ref={(popupDialog) => { this.popupDialog = popupDialog; }}>
      <View style={{flex: 2}}>
        <MultiStep steps={this.steps} onFinish={this.finish}/>
      </View>
    </PopupDialog>
      )
  }
}

export default QuestionForm