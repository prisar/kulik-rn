import React from 'react';
import {Text, StyleSheet, View, Image, Animated} from 'react-native';
import moment from 'moment';

import {TouchableOpacity} from 'react-native-gesture-handler';

const styles = StyleSheet.create({
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'green',
  },
});

interface IProps {
  navigation: any;
  notification: any;
  scale: any;
  opacity: any;
}

const NotificationItem = ({
  navigation,
  notification,
  scale,
  opacity,
}: IProps) => {
  const viewFanProfile = () => {
    if (!notification?.fanId) {
      return;
    }

    navigation.navigate('Profile', {
      currentProfile: false,
      userId: notification.fanId,
      avatar: notification.fanAvatar,
      displayName: notification.fanDisplayName,
    });
  };

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
        transform: [{scale}],
        opacity: opacity,
      }}>
      <View style={{}}>
        <View style={{flexDirection: 'row', margin: 5}}>
          <TouchableOpacity
            style={{width: 50}}
            onPress={viewFanProfile}
            disabled={!notification.fanId}>
            <Image
              style={styles.avatar}
              source={{
                uri:
                  notification && notification.fanAvatar
                    ? notification.fanAvatar
                    : 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/indian_man_male_person-512.png',
              }}
            />
          </TouchableOpacity>
          <View style={{flexDirection: 'column', margin: 3}}>
            <Text>{notification?.message}</Text>
            <Text>{moment(notification?.createdAt).fromNow()}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default NotificationItem;
