import React from 'react';
import {StyleSheet, View, Dimensions, Animated, Easing} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const {width} = Dimensions.get('window');

export function SkeletonComponent() {
  const animatedValue = new Animated.Value(0);
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: (Easing.linear as any).inOut,
        useNativeDriver: true,
      }),
    ).start();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      style={{
        backgroundColor: '#a0a0a0',
        borderColor: '#b0b0b0',
        height: 150,
        width,
        margin: 10,
      }}>
      <AnimatedLinearGradient
        colors={['#a0a0a0', '#b0b0b0', '#b0b0b0', '#a0a0a0']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={{
          ...(StyleSheet.absoluteFill as any),
          transform: [{translateX: translateX}],
        }}
      />
    </View>
  );
}

export default SkeletonComponent;
