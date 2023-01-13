import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';

export default function Loading({loading}: any) {
  return <View>{loading ? <ActivityIndicator /> : <Text>{''}</Text>}</View>;
}
