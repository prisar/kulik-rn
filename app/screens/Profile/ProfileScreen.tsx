import React, {useState, useContext} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {useDispatch} from 'react-redux';
import moment from 'moment';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-community/async-storage';

import {LocalizationContext} from '../Translation/Translations';
import PostsTab from './PostsTab';
import LikesTab from './LikesTab';
import {loadUserProfile} from '../../store/user/actions';

const Tab = createMaterialTopTabNavigator();

interface IProps {
  route: any;
  navigation: any;
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 0.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function ProfileScreen({route, navigation}: IProps) {
  const {translations} = useContext(LocalizationContext);

  const [currentUser, setCurrentUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [tabPointerOverlay, setTabPointerOverlay] = useState(true);
  const [profileDetails, setProfileDetails] = useState({});

  const dispatch = useDispatch();

  const currentUserProfile = route.params?.currentProfile;
  const userId = route.params?.userId;
  const recipientName = route.params?.displayName;
  const recipientAvatar = route.params?.avatar;
  const receiverId = userId;

  const setUserData = () => {
    const user = !currentUserProfile
      ? {
          avatar: route.params?.avatar,
          displayName: route.params?.displayName,
        }
      : auth().currentUser;
    setCurrentUser(user as any);
  };

  const showTabPointerOverlay = async () => {
    try {
      const show = await AsyncStorage.getItem('SHOW_TAB_POINTER_OVERLAY');
      if (show === 'DONE') {
        setTabPointerOverlay(false);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const tabPointerOverlayOnPress = async () => {
    try {
      setTabPointerOverlay(false);
      await AsyncStorage.setItem('SHOW_TAB_POINTER_OVERLAY', 'DONE');
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const getAvatar = () => {
    if (currentUserProfile) {
      return (currentUser as any)?.photoURL;
    } else if (currentUser) {
      return (currentUser as any)?.avatar;
    }
    return 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/indian_man_male_person-512.png';
  };

  const chatScreen = () => {
    if (!auth().currentUser) {
      navigation.navigate('Login');
      return;
    }

    if (!chatId) {
      return;
    }

    if (currentUserProfile) {
      navigation.navigate('ChatList', {
        currentProfile: true,
        senderId: userId,
      });
    } else if (userId !== undefined || userId !== null) {
      navigation.navigate('Chat', {
        currentProfile: false,
        chatId: chatId,
        senderId: auth().currentUser?.uid,
        senderName: auth().currentUser?.displayName,
        senderAvatar: (auth().currentUser as any)?.avatar,
        recipientId: userId,
        recipientName: recipientName,
        recipientAvatar: recipientAvatar,
      });
    }
  };

  const getChatId = async () => {
    try {
      if (!auth().currentUser) {
        return;
      }
      // same person chat
      if (auth().currentUser?.uid === receiverId) {
        return;
      }
      const chatOne = await firestore()
        .collection('chats')
        .where('nodeOne', '==', auth().currentUser?.uid)
        .where('nodeTwo', '==', receiverId)
        .orderBy('createdAt', 'desc')
        .get();
      const chatTwo = await firestore()
        .collection('chats')
        .where('nodeOne', '==', receiverId)
        .where('nodeTwo', '==', auth().currentUser?.uid)
        .orderBy('createdAt', 'desc')
        .get();

      chatOne.forEach((doc) => {
        setChatId((doc as any)?.id);
      });

      chatTwo.forEach((doc) => {
        setChatId((doc as any)?.id);
      });

      if (chatOne.empty && chatTwo.empty) {
        const result = await firestore().collection('chats').add({
          nodeOne: auth().currentUser?.uid,
          nodeOneDisplayName: auth().currentUser?.displayName,
          nodeOneAvatar: auth().currentUser?.photoURL,
          nodeTwo: receiverId,
          nodeTwoDisplayName: recipientName,
          nodeTwoAvatar: recipientAvatar,
          createdAt: moment().format(),
          updatedAt: moment().format(),
        });
        setChatId(
          result.path?.substring(result.path?.lastIndexOf('/') + 1) as any,
        );
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const followUser = async () => {
    try {
      const profileId = route.params?.userId;
      if (!profileId || !auth().currentUser?.uid) {
        return;
      }
      firestore()
        .collection('followers')
        .doc(profileId)
        .collection('fans')
        .doc(auth().currentUser?.uid) // userId
        .set(
          {
            displayName: auth().currentUser?.displayName,
            avatar: auth().currentUser?.photoURL,
            followedAt: moment().format(),
          },
          {merge: true},
        );
      firestore()
        .collection('following')
        .doc(auth().currentUser?.uid)
        .collection('influencers')
        .doc(profileId) // userId
        .set(
          {
            displayName: (profileDetails as any)?.displayName,
            avatar: (profileDetails as any)?.photoURL,
            followedAt: moment().format(),
          },
          {merge: true},
        );

      firestore()
        .collection('notifications')
        .add({
          fanId: auth().currentUser?.uid,
          fanDisplayName: auth().currentUser?.displayName,
          message: `${auth().currentUser?.displayName} ফলো করছে`,
          fanAvatar: auth().currentUser?.photoURL,
          type: 'FAN_FOLLOWED',
          createdAt: moment().format(),
        });

      firestore()
        .collection('users')
        .doc(profileId)
        .set(
          {
            followers: parseInt((profileDetails as any)?.followers || 0) + 1,
            updatedAt: moment().format(),
          },
          {merge: true},
        );
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const getProfileDetails = async (profileId: string) => {
    try {
      if (!profileId) {
        return;
      }
      const user = await firestore().collection('users').doc(profileId).get();
      if (!user.exists) {
        const userdata = {...user.data()};
        setProfileDetails(userdata);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      showTabPointerOverlay();
      setUserData();
      getChatId();
      dispatch(
        loadUserProfile({
          uid: route.params?.userId,
          displayName: route.params?.displayName,
          avatar: route.params?.avatar,
        }),
      );
      getProfileDetails(route.params?.userId);

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation, route?.params?.userId]),
  );

  return (
    <>
      <View style={styles.header}>
        <View
          style={{
            margin: 20,
            justifyContent: 'space-around',
            flexDirection: 'row',
          }}>
          <View style={{width: '40%'}}>
            <TouchableOpacity
              onPress={() => {
                if (currentUserProfile) {
                  navigation.navigate('AddImage', {
                    action: 'PROFILE_PHOTO',
                  });
                }
              }}>
              <Image
                style={{
                  margin: 10,
                  height: 100,
                  width: 100,
                  borderRadius: 150,
                }}
                source={{
                  uri: getAvatar(),
                }}
              />
            </TouchableOpacity>
          </View>
          <View style={{width: '60%', margin: 10}}>
            <View style={{flexDirection: 'column'}}>
              <Text style={{fontSize: 22, margin: 10, color: '#000'}}>
                {(currentUser as any)?.displayName}
              </Text>
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-start',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 3,
                    backgroundColor: '#1654f0',
                    width: 80,
                    height: 30,
                    margin: 10,
                  }}
                  onPress={chatScreen}>
                  <Text style={{color: '#fff'}}>
                    {currentUserProfile
                      ? translations['profile.messages']
                      : translations['profile.messages']}
                  </Text>
                </TouchableOpacity>
                {!currentUserProfile && (
                  <TouchableOpacity
                    style={{
                      alignSelf: 'flex-start',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 3,
                      backgroundColor: '#1654f0',
                      width: 80,
                      height: 30,
                      margin: 10,
                    }}
                    onPress={followUser}>
                    <Text style={{color: '#fff'}}>Follow</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={{margin: 10}}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('Followers', {
                        userId: (profileDetails as any)?.uid,
                      })
                    }>
                    <Text style={{color: '#000'}}>Followers</Text>
                    <Text style={{color: '#000'}}>
                      {(profileDetails as any)?.followers || 0}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{margin: 10, marginLeft: 30}}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('Following', {
                        userId: (profileDetails as any)?.uid,
                      })
                    }>
                    <Text style={{color: '#000'}}>Following</Text>
                    <Text style={{color: '#000'}}>
                      {(profileDetails as any)?.following || 0}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <Text style={{color: '#000', marginHorizontal: 10}}>Bio</Text>
                <Text style={{color: '#000', marginHorizontal: 10}}>
                  {(profileDetails as any)?.bio}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {tabPointerOverlay && (
        <View
          style={{
            flex: 0,
            position: 'absolute',
            top: 150,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 1000,
            height: 250,
            borderRadius: 20,
          }}>
          <TouchableOpacity onPress={tabPointerOverlayOnPress}>
            <LottieView
              source={require('../../assets/animations/click-here.json')}
              autoPlay
              loop
              style={{
                backgroundColor: '#000',
                opacity: 0.4,
                height: 250,
              }}
            />
          </TouchableOpacity>
        </View>
      )}

      <Tab.Navigator
        initialRouteName="Posts"
        tabBarOptions={{
          activeTintColor: 'green',
          labelStyle: {fontSize: 12},
          style: {backgroundColor: '#f0f0f0'},
        }}>
        <Tab.Screen
          name="Posts"
          component={PostsTab}
          options={{tabBarLabel: translations['profile.tab.posts']}}
        />
        <Tab.Screen
          name="Likes"
          component={LikesTab}
          options={{tabBarLabel: translations['profile.tab.likes']}}
        />
      </Tab.Navigator>
    </>
  );
}
