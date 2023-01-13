import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

const HEIGHT = 0.2 * height;
const SPACING = 10;

const styles = StyleSheet.create({
  card: {
    height: 150,
    width: 0.3 * width,
    // borderRadius: SPACING,
    // backgroundColor: '#f0f0f0',
    marginRight: SPACING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    height: HEIGHT / 2,
    width: HEIGHT / 2,
    borderRadius: HEIGHT / 2,
    borderWidth: 0.5,
    borderColor: 'blue',
  },
});

const MightFollowUsers = ({users}: any) => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 180,
      }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={users}
        // contentContainerStyle={{
        //   flex: 1,
        //   justifyContent: 'center',
        //   alignItems: 'center',
        //   padding: 10,
        // }}
        renderItem={({item}) => {
          return (
            <View style={styles.card}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Profile', {
                    currentProfile: false,
                    userId: item.userId,
                    avatar: item.avatar,
                    displayName: item.displayName,
                  });
                }}>
                <Image
                  source={{
                    uri: `${
                      !item?.avatar
                        ? item?.photoURL ||
                          'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/indian_man_male_person-512.png'
                        : item.avatar
                    }`,
                  }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <Text>{item.displayName}</Text>
            </View>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
        style={
          {
            // height: 150,
            //   backgroundColor: 'red',
          }
        }
        // onEndReachedThreshold={0.1}
        // onEndReached={loadMoreVideos}
        scrollEventThrottle={8}
        // onScroll={handleScroll}
      />
    </View>
  );
};

export default MightFollowUsers;
