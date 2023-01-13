import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import * as Sentry from '@sentry/react-native';

import {Row, Separator} from '../../components/Row';
import {LocalizationContext} from '../Translation/Translations';
import {SafeAreaView} from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    backgroundColor: '#fff',
  },
  chats: {
    // height: '100%',
    marginTop: 20,
  },
});

export default function ChatListScreen() {
  const [userchats, setUserChats] = useState([]);
  const {translations} = React.useContext(LocalizationContext);
  const navigation = useNavigation();

  const loadChats = async () => {
    try {
      const nodeOneChats: any[] = [];
      const queryOne = await firestore()
        .collection('chats')
        .where('nodeOne', '==', auth().currentUser?.uid)
        .orderBy('updatedAt', 'desc') //?
        .get();

      queryOne.forEach((doc) => {
        nodeOneChats.push({docId: doc.id, ...doc.data()});
      });

      const nodeTwoChats: any[] = [];
      const queryTwo = await firestore()
        .collection('chats')
        .where('nodeTwo', '==', auth().currentUser?.uid)
        .orderBy('updatedAt', 'desc') //?
        .get();
      queryTwo.forEach((doc) => {
        nodeTwoChats.push({docId: doc.id, ...doc.data()});
      });
      setUserChats(
        (nodeOneChats as any)
          .concat(nodeTwoChats)
          .sort(
            (a: any, b: any) =>
              moment(a.lastMesssageAt).unix() > moment(b.lastMesssageAt).unix(),
          ),
      );
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const showChat = ({userId, name, avatar, chatId}: any) => {
    navigation.navigate('Chat', {
      currentProfile: false,
      chatId: chatId,
      senderId: auth().currentUser?.uid,
      senderName: auth().currentUser?.displayName,
      senderAvatar: auth().currentUser?.photoURL,
      recipientId: userId,
      recipientName: name,
      recipientAvatar: avatar,
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadChats();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{margin: 10, alignSelf: 'flex-start'}}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            fontFamily: 'sans-serif-medium',
            color: '#000',
          }}>
          {translations['chats.title']}
        </Text>
      </View>
      {!userchats?.length && (
        <Text style={{alignSelf: 'center', fontSize: 32}}>
          {translations['chats.message.nochats']}
        </Text>
      )}
      <FlatList
        data={userchats}
        keyExtractor={(item, index) => {
          return `${(item as any).docId}${index}`;
        }}
        renderItem={({item}) => {
          const name = `${
            auth().currentUser?.uid === (item as any).nodeOne
              ? (item as any).nodeTwoDisplayName
              : (item as any).nodeOneDisplayName
          }`;

          return (
            <Row
              image={{
                uri:
                  auth().currentUser?.uid === (item as any).nodeOne
                    ? (item as any).nodeTwoAvatar
                    : (item as any).nodeOneAvatar,
              }}
              title={name}
              subtitle={(item as any).lastMessage}
              lastMesssageAt={moment((item as any).lastMesssageAt).fromNow()}
              onPress={() => {
                showChat({
                  userId:
                    auth().currentUser?.uid === (item as any).nodeOne
                      ? (item as any).nodeTwo
                      : (item as any).nodeOne,
                  name:
                    auth().currentUser?.uid === (item as any).nodeOne
                      ? (item as any).nodeTwoDisplayName
                      : (item as any).nodeOneDisplayName,
                  avatar:
                    auth().currentUser?.uid === (item as any).nodeOne
                      ? (item as any).nodeTwoAvatar
                      : (item as any).nodeOneAvatar,
                  chatId: (item as any).docId,
                });
              }}
            />
          );
        }}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={() => <Separator />}
        ListFooterComponent={() => <Separator />}
        style={styles.chats}
      />
    </SafeAreaView>
  );
}
