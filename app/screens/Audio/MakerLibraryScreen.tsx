import React from 'react';
import {View, Text, Animated, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import * as Sentry from '@sentry/react-native';
import auth from '@react-native-firebase/auth';

import AudioItem from '../../components/AudioItem';

const SPACING = 20;
const AVATAR_SIZE = 50;
const ITEM_SIZE = AVATAR_SIZE + SPACING * 3;

export default function MakerLibraryScreen({navigation}: any) {
  const [audios, setAudios] = React.useState([]);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const getAudios = async () => {
    try {
      const result = await firestore()
        .collection('audios')
        .orderBy('createdAt', 'desc')
        .get();

      if (!result.empty) {
        const audioentries = result.docs.map((audio) => audio.data());
        setAudios(audioentries as any);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!auth().currentUser) {
        setAudios([]);
      } else {
        getAudios();
      }
    });

    return unsubscribe;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  return (
    <SafeAreaView>
      <Text>Audio Library</Text>
      <Animated.FlatList
        contentContainerStyle={{
          padding: 10,
          paddingTop: StatusBar.currentHeight || 42,
        }}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true},
        )}
        horizontal={false}
        data={audios}
        renderItem={({item, index}) => {
          const inputRange = [
            -1,
            0,
            ITEM_SIZE * index,
            ITEM_SIZE * (index + 2),
          ];
          const opacityInputRange = [
            -1,
            0,
            ITEM_SIZE * index,
            ITEM_SIZE * (index + 0.5),
          ];
          const scale = scrollY.interpolate({
            inputRange,
            outputRange: [1, 1, 1, 0],
          });
          const opacity = scrollY.interpolate({
            inputRange: opacityInputRange,
            outputRange: [1, 1, 1, 0],
          });
          return (
            <View style={{margin: 10}}>
              <AudioItem
                // navigation={navigation}
                audio={item}
                scale={scale}
                opacity={opacity}
              />
            </View>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
        style={{height: 700, margin: 5}}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
