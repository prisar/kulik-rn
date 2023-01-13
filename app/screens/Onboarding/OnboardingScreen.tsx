import React from 'react';
import {Image, Dimensions} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

const {width, height} = Dimensions.get('window');

interface IProps {
  navigation: any;
}

export default function OnboardingScreen({navigation}: IProps) {
  return (
    <Onboarding
      onDone={() => navigation.navigate('HomeTabs')}
      pages={[
        {
          backgroundColor: '#002852',
          image: (
            <Image
              source={require('../../assets/onboarding_a.png')}
              style={{height: 0.35 * height, width: 0.9 * width}}
            />
          ),
          title: 'Watch',
          subtitle: 'Popular videos',
        },
        {
          backgroundColor: '#002852',
          image: (
            <Image
              source={require('../../assets/onboarding_b.png')}
              style={{height: 0.35 * height, width: 0.9 * width}}
            />
          ),
          title: '❤️ Made in India',
          subtitle: '📍 Bangalore',
        },
        {
          backgroundColor: '#002852',
          image: (
            <Image
              source={require('../../assets/onboarding_c.png')}
              style={{height: 0.35 * height, width: 0.9 * width}}
            />
          ),
          title: 'Listen',
          subtitle: 'Share with friends',
        },
      ]}
    />
  );
}
