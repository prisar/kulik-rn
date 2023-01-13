import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  FlatList,
  Modal,
  TouchableHighlight,
} from 'react-native';
import {TextInput, TouchableNativeFeedback} from 'react-native-gesture-handler';
import {useFocusEffect} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import * as Sentry from '@sentry/react-native';
import remoteConfig from '@react-native-firebase/remote-config';
import {SafeAreaView} from 'react-native-safe-area-context';
import analytics from '@react-native-firebase/analytics';

import MightFollowUsers from '../../components/MightFollowUsers';
import VideoThumbnail from '../Video/VideoThumbnail';
import {LocalizationContext} from '../Translation/Translations';
import Search from '../Algolia/Search';

const {width} = Dimensions.get('window');

const SPACING = 10;

export default function DiscoverScreen({navigation}: any) {
  const [headerdata, setHeaderdata] = useState([]);
  const [users, setUsers] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const otaupdatescreen = remoteConfig().getValue('app_ota_update_screen');
  const showusers = remoteConfig().getValue('discover_show_users');
  const showrecentvideos = remoteConfig().getValue(
    'discover_show_recent_videos',
  );
  const showsearchbar = remoteConfig().getValue('discover_show_searchbar');
  const scrollView = React.useRef().current;
  const {translations} = React.useContext(LocalizationContext);

  const getHeaderData = async () => {
    try {
      const result = await firestore()
        .collection('screens')
        .doc('discover')
        .get();
      if (result.exists) {
        const data = result.data();
        const slides = JSON.parse(data?.mainheader)?.items || [];
        setHeaderdata(slides);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const getUsers = async () => {
    try {
      const result = await firestore()
        .collection('users')
        .orderBy('lastActivityAt', 'desc')
        .get();
      if (!result.empty) {
        const dbusers = result.docs
          .map((doc) => {
            return doc.data();
          })
          .filter((user) => {
            // if (user.userId && user.photoUrl && user.displayName) {
            //   return true;
            // }
            if (user.userId) {
              return true;
            }
            return false;
          });
        // console.log('dbusers', dbusers?.length);
        setUsers(dbusers as any);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const loadRecentVideos = async () => {
    try {
      const result = await firestore()
        .collection('posts')
        .where('type', '==', 'video')
        .orderBy('createdAt', 'desc')
        .limit(6)
        .get();

      const posts: any = [];
      result.forEach((doc) => {
        posts.push({docId: doc.id, ...doc.data()});
      });
      const thumbnails = posts?.filter((post: any) => post.videoId);
      setRecentVideos(thumbnails);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      const playbackInterval = setInterval(() => {
        (scrollView as any)?.scrollTo({x: -width, animated: true});
      }, 1000);

      if (otaupdatescreen.asBoolean()) {
        navigation.navigate('ManualUpdate');
      }

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
        clearInterval(playbackInterval);
      };

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation]),
  );

  React.useEffect(() => {
    if (!users?.length) {
      getUsers();
    }

    const unsubscribe = navigation.addListener('focus', () => {
      getHeaderData();
      loadRecentVideos();
      setModalVisible(false);
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
      {!showsearchbar.asBoolean() && (
        <>
          <View
            style={{
              width: 0.95 * width,
              height: 50,
              marginVertical: 10,
              marginHorizontal: 10,
              backgroundColor: '#F4F5F7',
              borderRadius: 30,
            }}>
            <TextInput
              onHandlerStateChange={() => {
                setModalVisible(true);
                analytics().logEvent('search_modal_open');
              }}
              style={{
                marginHorizontal: 10,
                height: 50,
                fontSize: 20,
              }}
              placeholder={'Search'}
            />
          </View>
          <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
            }}>
            <TouchableHighlight
              style={{
                backgroundColor: '#242822',
                borderRadius: 15,
                width: 30,
                height: 30,
                padding: 5,
                margin: 10,
                elevation: 2,
                alignSelf: 'flex-end',
              }}
              onPress={() => {
                setModalVisible(!modalVisible);
              }}>
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: 16,
                }}>
                X
              </Text>
            </TouchableHighlight>
            <Search />
          </Modal>
        </>
      )}
      <ScrollView
        ref={scrollView}
        onScroll={() => {
          analytics().logEvent('discover_header_carousel_scrolled');
        }}
        style={styles.headercontainer}
        pagingEnabled={true}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        decelerationRate={0}
        snapToInterval={width}
        snapToAlignment={'center'}
        contentInset={{
          top: 0,
          left: 30,
          bottom: 0,
          right: 30,
        }}>
        {headerdata?.length ? (
          headerdata?.map((item, index) => {
            const {tab, params, nav} = item;
            return (
              <View key={index} style={styles.view}>
                <TouchableNativeFeedback
                  onPress={() => {
                    if (nav && nav === 'disabled') {
                      return;
                    }
                    navigation.navigate(tab, params);
                  }}>
                  <Image
                    source={{uri: (item as any)?.imageUrl}}
                    style={{
                      width: width - 2 * SPACING,
                      height: 200,
                      borderRadius: 10,
                    }}
                  />
                </TouchableNativeFeedback>
              </View>
            );
          })
        ) : (
          <View style={styles.view}>
            <TouchableNativeFeedback
              onPress={() => navigation.navigate('Feed')}>
              <Image
                source={require('../../assets/images/apon_uttar_bangla.jpg')}
                style={{
                  width: width - 2 * SPACING,
                  height: 200,
                  borderRadius: 10,
                }}
              />
            </TouchableNativeFeedback>
          </View>
        )}
      </ScrollView>

      {showusers.asBoolean() && (
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            marginHorizontal: 10,
            width: width - 2 * SPACING,
          }}>
          <Text
            style={{
              color: '#000',
              fontSize: 14,
              fontWeight: 'bold',
              alignSelf: 'flex-start',
            }}>
            {translations['discover.list.recentusers']}
          </Text>
          <MightFollowUsers users={users} />
        </View>
      )}

      {showrecentvideos.asBoolean() && (
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            width: width - 2 * SPACING,
          }}>
          <Text
            style={{
              color: '#000',
              fontSize: 14,
              fontWeight: 'bold',
              alignSelf: 'flex-start',
            }}>
            {translations['discover.list.recentvideos']}
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={recentVideos}
            renderItem={({item}) => {
              return (
                <View style={styles.vidcontainer}>
                  <VideoThumbnail post={item} navigation={navigation} />
                </View>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
            style={{
              backgroundColor: '#fff',
            }}
            scrollEventThrottle={16}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headercontainer: {
    flex: 26,
  },
  view: {
    backgroundColor: '#a0a0a0',
    width: width - 2 * SPACING,
    margin: SPACING,
    height: 200,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vidcontainer: {
    width: width * 0.3,
    height: 180,
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#fbee4f',
  },
});
