import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, Image, Dimensions} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import database from '@react-native-firebase/database';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    margin: 20,
  },
});

interface IProps {
  route: any;
}

export default function ChatScreen({route}: IProps) {
  const [messages, setMessages] = useState([]);
  const [userState, setUserState] = useState(null);
  const [lastChanged, setLastChanged] = useState('');
  const navigation = useNavigation();

  const parseMessage = (message: any) => {
    const usr = {
      _id: route.params?.senderId === message.senderId ? 1 : 2,
      name:
        route.params?.senderId === message.senderId
          ? message.senderName
          : route.params?.recipientName,
      avatar:
        route.params?.senderId === message.senderId
          ? message.senderAvatar
          : route.params?.recipientAvatar,
    };
    const msg = {
      _id: message.docId,
      text: message.text,
      createdAt: message.createdAt,
      user: usr,
    };
    return msg;
  };

  const loadMessages = async () => {
    try {
      await firestore()
        .collection('messages')
        .where('chatId', '==', route.params?.chatId)
        .orderBy('createdAt', 'desc') // TODO limit
        .onSnapshot((querySnapshot) => {
          const chatMessages: any = [];
          querySnapshot?.forEach((doc) => {
            chatMessages.push({docId: doc.id, ...doc.data()});
          });
          const msgs = [...chatMessages.map((m: any) => parseMessage(m))];
          setMessages(msgs as any);
        });
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused

      const onValueChange =
        route.params?.recipientId &&
        database()
          .ref(`/status/${route?.params?.recipientId}`)
          .on('value', (snapshot: any) => {
            setUserState(snapshot?.val()?.state);

            if (snapshot?.val()?.state === 'offline') {
              setLastChanged(
                moment(snapshot?.val()?.last_changed).fromNow().toString(),
              );
            }
          });

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
        setMessages([]);
        route.params?.recipientId &&
          database()
            .ref(`/status/${route?.params?.recipientId}`)
            .off('value', onValueChange);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation, route]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadMessages();
    });
    return unsubscribe;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, route]);

  const onSend = useCallback(
    async (messages = []) => {
      try {
        if (!messages?.length) {
          return;
        }

        const lastMsg = messages[0].text;
        const msg = {
          chatId: route.params?.chatId,
          text: lastMsg,
          createdAt: moment().format(),
          senderId: auth().currentUser?.uid,
          senderName: auth().currentUser?.displayName,
          senderAvatar: auth().currentUser?.photoURL,
          receiverId: route.params?.recipientId,
          receiverName: route.params?.recipientName,
          receiverAvatar: route.params?.recipientAvatar,
        };
        await firestore().collection('messages').add(msg);
        if (route.params?.chatId) {
          await firestore().collection('chats').doc(route.params?.chatId).set(
            {
              lastMessage: lastMsg,
              lastMesssageAt: moment().format(),
              updatedAt: moment().format(),
            },
            {merge: true},
          );
        }
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, messages),
        );
      } catch (err) {
        Sentry.captureException(err);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [route, userState],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#fafafa',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image
          source={{uri: route.params?.recipientAvatar}}
          style={styles.image}
        />
        <View style={{flexDirection: 'column'}}>
          <Text
            style={{
              margin: 1,
              fontSize: 23,
              width: 0.7 * width,
              color: '#000',
            }}>
            {route.params?.recipientName}{' '}
          </Text>
          <Text
            style={{
              fontSize: 16,
              margin: 1,
              color: userState === 'online' ? 'green' : 'blue',
            }}>
            {userState === 'online' ? userState : `offline ${lastChanged}`}
          </Text>
        </View>
      </View>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: 1,
          name: auth().currentUser?.displayName || '',
          avatar: auth().currentUser?.photoURL || '',
        }}
        showUserAvatar
        renderAvatarOnTop
        // renderUsernameOnMessage
        scrollToBottom
        alwaysShowSend
      />
    </SafeAreaView>
  );
}
