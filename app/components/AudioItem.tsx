import React from 'react';
import { Text, View, Animated, TouchableOpacity, Image, StyleSheet } from 'react-native';
import moment from 'moment';

import AudioPlay from './AudioPlay';

interface IProps {
  audio: any;
  scale: any;
  opacity: any;
}

const styles = StyleSheet.create({
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'green',
  },
});

const AudioItem = ({ audio, scale, opacity }: IProps) => {
  const viewFanProfile = () => {
    if (!audio?.createdBy) {
      return;
    }

    // navigation.navigate('Profile', {
    //   currentProfile: false,
    //   userId: audio?.createdBy,
    //   avatar: audio?.creatorPhoto,
    //   displayName: audio?.creatorName,
    // });
  };



console.log(audio)

  return (
    <Animated.View
      style={{
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        shadowColor: '#000',
        shadowOffset: {
          height: 10,
          width: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        transform: [{ scale }],
        opacity: opacity,
      }}>
      <View style={{}}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', margin: 5 }}>
          <View>
            <AudioPlay
              uri={`https://firebasestorage.googleapis.com/v0/b/agro-fadf4.appspot.com/o/videos%2Faudios%2F08de3291-9765-4e8c-8e74-8bf81a428ee7.mp3?alt=media`}
              loop={true}
            />
          </View>
          <TouchableOpacity style={{width: 50}} onPress={viewFanProfile}>
            <Image
              style={styles.avatar}
              source={{
                uri:
                  audio && audio.creatorPhoto
                    ? audio.creatorPhoto
                    : 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/indian_man_male_person-512.png',
              }}
            />
          </TouchableOpacity>
          <View style={{ margin: 2 }}>
            <View style={{ flexDirection: 'column', margin: 3 }}>
              <Text>{audio?.title}</Text>
              <Text>{moment(audio?.createdAt).fromNow()}</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default AudioItem;
