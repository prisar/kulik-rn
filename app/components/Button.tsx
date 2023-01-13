import React from 'react';
import {Text, StyleSheet, Dimensions} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';
import PropTypes from 'prop-types';

import {greenColor} from '../GlobalStyles';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    borderRadius: 25,
    height: 50,
    width: 0.8 * width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Roboto',
    fontSize: 15,
    textAlign: 'center',
  },
});

interface IProps {
  variant: string;
  label: string;
  onPress: any;
}

const Button = ({variant, label, onPress}: IProps) => {
  const backgroundColor = variant === 'primary' ? greenColor : '#E0E7E2';
  const color = variant === 'primary' ? 'white' : '#FDFFFC';
  return (
    <RectButton style={[styles.container, {backgroundColor}]} {...{onPress}}>
      <Text style={[styles.label, {color}]}>{label}</Text>
    </RectButton>
  );
};

Button.propTypes = {
  variant: PropTypes.string.isRequired,
};

export default Button;
