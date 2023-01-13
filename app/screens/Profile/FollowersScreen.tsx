import React from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');

interface IProps {
  route: any;
}

export default function FollowersScreen({route}: IProps) {
  const [followers, setFollowers] = React.useState([]);
  const navigation = useNavigation();

  const getFollowers = async () => {
    try {
      const userId = route?.params?.userId;
      const result = await firestore()
        .collection('followers')
        .doc(userId)
        .collection('fans')
        .get();

      if (!result.empty) {
        const fans = [
          ...result.docs.map((doc) => {
            return {...doc.data()};
          }),
        ];
        setFollowers(fans as any);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getFollowers();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}>
      <View style={{margin: 20, position: 'absolute', top: 0, left: 0}}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            fontFamily: 'sans-serif-medium',
          }}>
          Followers
        </Text>
      </View>

      <FlatList
        contentContainerStyle={{
          paddingTop: 100,
        }}
        horizontal={false}
        data={followers}
        renderItem={({item}) => {
          return (
            <View
              style={{
                width: 0.9 * width,
                borderRadius: 5,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                shadowColor: '#000',
                shadowOffset: {
                  height: 10,
                  width: 0,
                },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                margin: 10,
                borderWidth: 1,
                borderColor: '#f9f9f9',
              }}>
              <View style={{}}>
                <View style={{flexDirection: 'row', margin: 5}}>
                  <TouchableOpacity
                    style={{width: 50}}
                    onPress={() => {}}
                    disabled={false}>
                    <Image
                      style={{
                        height: 50,
                        width: 50,
                        borderRadius: 25,
                        borderWidth: 1,
                        borderColor: 'green',
                      }}
                      source={{
                        uri:
                          item && (item as any).avatar
                            ? (item as any).avatar
                            : 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/indian_man_male_person-512.png',
                      }}
                    />
                  </TouchableOpacity>
                  <View style={{flexDirection: 'column', margin: 3}}>
                    <Text>{(item as any)?.displayName}</Text>
                  </View>
                </View>
              </View>
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
