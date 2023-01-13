import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  TextInput,
  Modal,
  FlatList,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import * as Sentry from '@sentry/react-native';
import analytics from '@react-native-firebase/analytics';

import {LocalizationContext} from '../screens/Translation/Translations';

const pageSize = 10;

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: '#9ea8dc',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    // padding: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: '#1654f0',
    borderRadius: 30,
    height: 40,
    width: 150,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 0.9 * width,
    height: 40,
    backgroundColor: '#fac030',
    borderRadius: 30,
    padding: 10,
    marginBottom: 100,
    elevation: 5,
  },
  closeButton: {
    backgroundColor: '#242822',
    borderRadius: 15,
    width: 30,
    height: 30,
    padding: 5,
    margin: 10,
    elevation: 2,
    alignSelf: 'flex-end',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  textAddBtn: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    // textAlign: 'center',
  },
  avatar: {
    height: 30,
    width: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'green',
    margin: 3,
  },
  centeredView: {
    top: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9ea8dc',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    // padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

const wait = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

interface IProps {
  navigation: any;
  post: any;
}

const PostComments = ({navigation, post}: IProps) => {
  const [comments, setComments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [commentText, setCommentText] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isReply, setIsReply] = useState(false);
  const [replyComment, setReplyComment] = useState(null);
  const {translations} = React.useContext(LocalizationContext);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    loadComments();

    wait(2000).then(() => setRefreshing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addComment = async () => {
    try {
      setError(null);
      if (!auth().currentUser?.uid) {
        navigation.navigate('Login');
      }

      if (!commentText) {
        setError('Empty comment' as any);
        return;
      }

      if (isReply && (replyComment as any)?.id) {
        // save reply
        await firestore()
          .collection('comments')
          .doc((replyComment as any)?.id)
          .collection('replies')
          .add({
            userId: auth().currentUser?.uid,
            userDisplayName: auth().currentUser?.displayName,
            userAvatar: auth().currentUser?.photoURL,
            message: commentText,
            createdAt: moment().format(),
          });
      }

      const comment = {
        postId: post.docId,
        userId: auth().currentUser?.uid || '',
        userDisplayName: auth().currentUser?.displayName || '',
        userAvatar: auth().currentUser?.photoURL || '',
        createdAt: moment().format(),
        type: 'POST_COMMENTED',
        message: commentText,
        read: false,
        likes: 0,
      };
      setCommentText(null);
      const result = await firestore().collection('comments').add(comment);
      const commentId = result.path.substring(result.path.lastIndexOf('/') + 1);
      await firestore()
        .collection('posts')
        .doc(post.docId)
        .set(
          {
            comments: (!post.comments ? 0 : post.comments) + 1,
          },
          {merge: true},
        );
      const newcomments = [...comments];
      (newcomments as any).unshift(comment);
      setComments(newcomments);
      // notification
      const notif = {
        recipientId: post.userId,
        fanId: auth().currentUser?.uid || '',
        fanDisplayName: auth().currentUser?.displayName || '',
        fanAvatar: auth().currentUser?.photoURL || '',
        createdAt: moment().format(),
        type: 'COMMENT_ADDED',
        message: `${
          auth().currentUser ? auth().currentUser?.displayName : 'Someone'
        } wrote a comment your post`,
        read: false,
      };
      await firestore().collection('notifications').add(notif);
      // add activity
      await firestore()
        .collection('activities')
        .add({
          userId: auth().currentUser?.uid || '',
          type: 'POST_COMMENTED',
          commentId: commentId,
          createdAt: moment().format(),
        });

      analytics().logEvent('post_comment');
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const likeComment = async (comment: any) => {
    try {
      if (!auth().currentUser?.uid) {
        navigation.navigate('Login');
      }

      if (auth().currentUser?.uid === comment.userId) {
        return;
      }

      await firestore()
        .collection('comments')
        .doc(comment.docId)
        .set(
          {
            likes: comment.likes + 1,
          },
          {merge: true},
        );

      const notif = {
        recipientId: post.userId,
        fanId: auth().currentUser?.uid || '',
        fanDisplayName: auth().currentUser?.displayName || '',
        fanAvatar: auth().currentUser?.photoURL || '',
        createdAt: moment().format(),
        type: 'COMMENT_LIKED',
        message: `${
          auth().currentUser ? auth().currentUser?.displayName : 'Someone'
        } liked your comment: ${comment?.message}`,
        read: false,
      };
      await firestore().collection('notifications').add(notif);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const loadComments = async () => {
    try {
      const result = await firestore()
        .collection('comments')
        .where('postId', '==', post.docId)
        .orderBy('createdAt', 'desc')
        .limit(pageSize)
        .get();

      // Get the last document
      const last = result.docs[result.docs.length - 1];
      setLastDoc(last as any);

      const postComments: any = [];
      result.forEach((doc) => {
        postComments.push({docId: doc.id, ...doc.data()});
      });
      setComments(postComments);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const loadMoreComments = async () => {
    try {
      const result = await firestore()
        .collection('comments')
        .where('postId', '==', post.docId)
        .orderBy('createdAt', 'desc')
        .startAfter((lastDoc as any).data().createdAt)
        .limit(pageSize)
        .get();

      const last = result.docs[result.docs.length - 1];
      setLastDoc(last as any);

      const newcomments: any = [];
      result.forEach((doc) => {
        newcomments.push({docId: doc.id, ...doc.data()});
      });

      const postComments = [...comments];
      setComments(postComments.concat(newcomments));
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useEffect(() => {
    loadComments();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalVisible]);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={styles.centeredView}>
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <TouchableHighlight
              style={{...styles.closeButton, backgroundColor: '#2196F3'}}
              onPress={() => {
                setModalVisible(!modalVisible);
              }}>
              <Text style={styles.textStyle}>X</Text>
            </TouchableHighlight>
            <Text
              style={{
                marginBottom: 15,
                fontSize: 24,
                fontWeight: '600',
              }}>
              {translations['postcomments.title']}
            </Text>
            <Text style={{alignSelf: 'center'}}>
              {comments.length === 0
                ? `${translations['postcomments.message.firstcomment']}`
                : ''}
            </Text>
            <FlatList
              horizontal={false}
              data={comments}
              renderItem={({item}) => (
                <View
                  style={{
                    borderRadius: 10,
                    width: width * 0.9,
                    flexDirection: 'row',
                    marginBottom: 5,
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('Profile', {
                        currentProfile:
                          post?.userId === auth().currentUser?.uid,
                        userId: (item as any).userId,
                        avatar: (item as any).userAvatar,
                        displayName: (item as any).userDisplayName,
                      });
                    }}>
                    <Image
                      style={styles.avatar}
                      source={{
                        uri:
                          item && (item as any).userAvatar
                            ? (item as any).userAvatar
                            : 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/indian_man_male_person-512.png',
                      }}
                    />
                  </TouchableOpacity>
                  <TouchableHighlight
                    onPress={() => {
                      setIsReply(true);
                      setCommentText(
                        `@${(item as any).userDisplayName} ` as any,
                      );
                    }}>
                    <Text style={{margin: 5, flex: 1, flexWrap: 'wrap'}}>
                      {(item as any).message}
                    </Text>
                  </TouchableHighlight>
                  <Text style={{margin: 5}}>
                    {moment((item as any)?.createdAt).fromNow()}
                  </Text>
                  <TouchableHighlight
                    style={{width: 50}}
                    onPress={() => {
                      likeComment(item);
                    }}>
                    <Text style={{marginTop: 5, marginLeft: 10}}>
                      {'❤️ '}
                      {(item as any).likes}
                    </Text>
                  </TouchableHighlight>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              style={{flex: 8, height: height * 0.3}}
              onEndReachedThreshold={0.5}
              onEndReached={loadMoreComments}
            />
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <TextInput
                value={commentText as any}
                onChangeText={(text) => setCommentText(text as any)}
                style={{
                  width: 0.9 * width,
                  height: 50,
                  borderWidth: 0.5,
                  borderRadius: 10,
                }}
                placeholder={
                  translations['postcomments.placeholder.addcomment']
                }
              />
              <Text style={{color: 'red'}}>{error}</Text>
              <TouchableOpacity style={styles.addButton} onPress={addComment}>
                <Text style={styles.textAddBtn}>
                  {translations['postcomments.action.addcomment']}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={{flex: 1}}>
        {post?.type === 'photo' ? (
          <TouchableOpacity
            style={{flexDirection: 'row'}}
            onPress={() => {
              setModalVisible(true);
            }}>
            <Image
              source={require('../assets/images/comments.png')}
              style={{height: 42, width: 42, tintColor: '#000'}}
            />
            <Text style={{fontSize: 18, color: '#000', margin: 5}}>
              {!post.comments ? 0 : post.comments}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableHighlight
            style={{}}
            onPress={() => {
              setModalVisible(true);
            }}>
            <Image
              source={require('../assets/comments.webp')}
              style={{
                height: 40,
                width: 40,
                borderRadius: 25,
                margin: 10,
                tintColor: '#fff',
              }}
            />
          </TouchableHighlight>
        )}
      </View>
    </View>
  );
};

export default PostComments;
