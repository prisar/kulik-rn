import React from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  webview: {
    width: width,
  },
  title: {
    width: '100%',
    padding: 5,
    color: '#fff',
    backgroundColor: '#48a05e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    fontSize: 32,
  },
});

interface IProps {
  route: any;
}

export default function PrivacyScreen({route}: IProps) {
  const {source} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        style={styles.webview}
        source={{uri: source}}
        scalesPageToFit={true}
      />
    </SafeAreaView>
  );
}
