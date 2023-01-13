import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, StatusBar, Animated} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import LottieView from 'lottie-react-native';
import * as Sentry from '@sentry/react-native';
import {useNavigation} from '@react-navigation/native';

import NotificationItem from '../../components/NotificationItem';
import {LocalizationContext} from '../Translation/Translations';
import {SafeAreaView} from 'react-native-safe-area-context';

const SPACING = 20;
const AVATAR_SIZE = 50;
const ITEM_SIZE = AVATAR_SIZE + SPACING * 3;

const styles = StyleSheet.create({
  emptyAnimation: {
    alignSelf: 'center',
    width: 250,
  },
});

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const {translations} = React.useContext(LocalizationContext);
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const getNotifications = async () => {
    try {
      if (!auth().currentUser) {
        return;
      }
      const notifRef = firestore().collection('notifications');
      notifRef
        .where('recipientId', '==', auth().currentUser?.uid)
        .limit(10)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
          const notifs: any = [];
          querySnapshot.forEach((doc) => {
            notifs.push(doc.data());
          });
          setNotifications(notifs as any);
        })
        .then()
        .catch((err) => {
          Sentry.captureException(err);
        });
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!auth().currentUser) {
        setNotifications([]);
      } else {
        getNotifications();
      }
    });

    return unsubscribe;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  return (
    <SafeAreaView style={{backgroundColor: '#fff', flex: 1}}>
      <View style={{margin: 20}}>
        <Text
          style={{
            color: '#000',
            fontSize: 32,
            fontWeight: 'bold',
            fontFamily: 'sans-serif-medium',
          }}>
          {translations['notification.title']}
        </Text>
      </View>
      {!auth().currentUser ? (
        <>
          <Text style={{fontSize: 22, margin: 20, alignSelf: 'center'}}>
            {translations['notification.message.login']}
          </Text>
          <LottieView
            source={require('../../assets/animations/empty-state.json')}
            autoPlay
            loop={true}
            style={styles.emptyAnimation}
          />
        </>
      ) : (
        <></>
      )}
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
        data={notifications}
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
              <NotificationItem
                navigation={navigation}
                notification={item}
                scale={scale}
                opacity={opacity}
              />
            </View>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
        style={{height: 700, margin: 5}}
        onEndReachedThreshold={0.5}
        onEndReached={getNotifications}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
