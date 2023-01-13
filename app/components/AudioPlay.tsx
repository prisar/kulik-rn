import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {Audio} from 'expo-av';
import LottieView from 'lottie-react-native';
import {TouchableNativeFeedback} from 'react-native-gesture-handler';

const audios = require('../assets/animations/play-music.json');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

interface IProps {
  uri: any;
  loop: any;
}

export default function AudioPlay({uri, loop}: IProps) {
  const [sound, setSound] = React.useState();

  async function playSound() {
    // console.log('Loading Sound');
    const {sound} = await Audio.Sound.createAsync(
      {uri: uri}, // require('./assets/Hello.mp3'),
    );
    setSound(sound as any);

    // console.log('Playing Sound');
    await sound.playAsync();
    await sound.setIsLoopingAsync(loop);
  }

  React.useEffect(() => {
    return sound
      ? () => {
          // console.log('Unloading Sound');
          (sound as any).unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <View style={styles.container}>
      <TouchableNativeFeedback onPress={playSound}>
        <LottieView
          source={audios}
          autoPlay
          loop
          style={{width: 50, height: 50}}
        />
      </TouchableNativeFeedback>
    </View>
  );
}
