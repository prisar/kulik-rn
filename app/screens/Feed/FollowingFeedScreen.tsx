import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  TouchableHighlight,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Carousel from 'react-native-snap-carousel';
import moment from 'moment';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import Animation from 'lottie-react-native';
import * as Sentry from '@sentry/react-native';

import PostComments from '../../components/PostComments';
import heartanim from '../../assets/animations/like-animation.json';
import whatsappanim from '../../assets/animations/whatsapp-social-media-icon.json';

const fs = RNFetchBlob.fs;

const pageSize = 30;
const {width, height} = Dimensions.get('window');

interface State {
  paused: boolean;
  index: number;
  loading: boolean;
  videoPosts: any[];
  likes: number;
  heartAnimation: boolean;
  comments: number;
  shares: number;
  whatsappAnimation: boolean;
}

class FollowingFeedScreen extends Component<{}, State, any> {
  constructor(props: {}) {
    super(props);
    this.state = {
      paused: true,
      index: 0,
      loading: true,
      videoPosts: [],
      likes: 0,
      heartAnimation: false,
      comments: 0,
      shares: 0,
      whatsappAnimation: false,
    };
  }

  loadVideos = async () => {
    try {
      const result = await firestore()
        .collection('posts')
        .where('type', '==', 'video')
        .orderBy('createdAt', 'desc')
        .limit(pageSize)
        .get();

      const posts: any = [];
      result.forEach((doc) => {
        posts.push({docId: doc.id, ...doc.data()});
      });
      this.setState({videoPosts: posts, paused: false});
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  componentDidMount() {
    this.loadVideos();
  }

  componentWillUnmount() {
    this.setState({
      videoPosts: [],
      paused: true,
    });
  }

  _renderItem = ({item, index}: any) => {
    const onLiked = async () => {
      try {
        if (!auth().currentUser) {
          return;
        }

        this.setState({heartAnimation: true});
        const notif = {
          recipientId: item.userId,
          fanId: auth().currentUser?.uid || '',
          fanDisplayName: auth().currentUser?.displayName || '',
          fanAvatar: auth().currentUser?.photoURL || '',
          createdAt: moment().format(),
          type: 'POST_LIKED',
          message: `${
            auth().currentUser ? auth().currentUser?.displayName : 'Someone'
          } liked your post`,
          read: false,
          postId: item.docId,
        };
        await firestore().collection('notifications').add(notif);

        let postLikes = this.state.likes + 1;
        if (this.state.likes - postLikes > 2) {
          postLikes = this.state.likes + 1;
        }
        setTimeout(async () => {
          await firestore().collection('posts').doc(item.docId).set(
            {
              likes: postLikes,
            },
            {merge: true},
          );

          this.setState({likes: postLikes});
          this.setState({heartAnimation: false});
        }, 500);
        await firestore()
          .collection('postlikes')
          .doc(item.docId)
          .set(
            {
              postId: item.docId,
              userId: auth().currentUser?.uid,
              userName: auth().currentUser?.displayName || 'Agrohi user',
              userPhotoUrl: auth().currentUser?.photoURL,
              likedAt: moment().format(),
              postType: item.type,
              photoId: item.photoId,
              videoId: item.videoId, // for thumbnail
            },
            {merge: true},
          );
      } catch (err) {
        Sentry.captureException(err);
      }
    };

    const addVideoView = async (post: any) => {
      try {
        await firestore()
          .collection('posts')
          .doc(post?.docId)
          .set(
            {
              views: (post.views ? post.views : 0) + 1,
            },
            {merge: true},
          );
      } catch (err) {
        Sentry.captureException(err);
      }
    };

    const onShare = async () => {
      try {
        this.setState({whatsappAnimation: true});
        const link = item.type === 'photo' ? item.photoUrl : item.video;
        let imagePath: any = null;
        RNFetchBlob.config({
          fileCache: true,
        })
          .fetch('GET', link)
          // the image is now dowloaded to device's storage
          .then((resp) => {
            // the image path you can use it directly with Image component
            imagePath = resp.path();
            return resp.readFile('base64');
          })
          .then((base64Data) => {
            // here's base64 encoded image
            Share.open({
              title: 'Agrohi App',
              message: `${item.message} \n\n রাজবংশী এপখান ইনস্টল করি হামাক সমর্থন করো, AppLink: https://bit.ly/3gbjrBJ`,
              subject: 'Share with friends',
              url: `data:video/mp4;base64,${base64Data}`,
            })
              .then(async (data: any) => {
                const {app} = data;
                if (!app) {
                  return;
                }
                const postShares = this.state.shares + 1;
                await firestore().collection('posts').doc(item.docId).set(
                  {
                    shares: postShares,
                  },
                  {merge: true},
                );

                this.setState({shares: postShares});
                const notif = {
                  recipientId: item.userId,
                  fanId: auth().currentUser?.uid || '',
                  fanDisplayName: auth().currentUser?.displayName || '',
                  fanAvatar: auth().currentUser?.photoURL || '',
                  createdAt: moment().format(),
                  type: 'POST_SHARED',
                  message: `${
                    auth().currentUser
                      ? auth().currentUser?.displayName
                      : 'Someone'
                  } shared your post`,
                  read: false,
                };
                await firestore().collection('notifications').add(notif);
              })
              .catch((err: any) => {
                Sentry.captureException(err);
              });
            // remove the file from storage
            return fs.unlink(imagePath);
          });
      } catch (err) {
        Sentry.captureException(err);
      }
    };

    let url = item.video;
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'black',
        }}>
        {this.state.index == index ? (
          <>
            <Video
              source={{uri: url, cache: true}}
              repeat={true}
              paused={
                (this as any).paused ||
                (this.state.index === index ? false : true)
              }
              resizeMode="cover"
              onReadyForDisplay={() => {
                // console.log('onReadyForDisplay');
                this.setState({
                  loading: false,
                });
                addVideoView(item);
              }}
              onBuffer={() => {
                // console.log('onBuffer');
                this.setState({
                  loading: true,
                });
              }}
              onLoad={() => {
                this.setState({
                  paused: false,
                });
                this.setState({likes: item.likes ? item.likes : 0});
                this.setState({comments: item.comments ? item.comments : 0});
                this.setState({shares: item.shares ? item.shares : 0});
                this.setState({heartAnimation: false});
              }}
              onProgress={() => {
                // console.log('onProgress ==' + index);
              }}
              onError={(err: any) => {
                Sentry.captureException(err);
              }}
              style={[styles.backgroundVideo, StyleSheet.absoluteFill]}
            />
          </>
        ) : null}

        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View style={{width: width}}>
            <View
              style={{
                height: 0.8 * height,
                alignSelf: 'flex-end',
                // position: 'absolute',
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                // borderWidth: 1,
                // borderColor: '#fff',
              }}>
              <TouchableHighlight
                style={styles.captureBtns}
                onPress={() => {
                  (this.props as any).navigation?.navigate('Profile', {
                    currentProfile:
                      auth().currentUser?.uid === item.userId ? true : false,
                    userId: item.userId,
                    avatar: item.avatar,
                    displayName: item.displayName,
                  });
                }}>
                <Image
                  source={{
                    uri:
                      item?.avatar !== null
                        ? item.avatar
                        : 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/indian_man_male_person-512.png',
                  }}
                  style={{height: 50, width: 50, borderRadius: 25, margin: 10}}
                />
              </TouchableHighlight>
              <View style={{flexDirection: 'row'}}>
                {this.state.heartAnimation && (
                  <Animation
                    // ref={(anim) => {
                    //   this.heartAnimationRef = anim;
                    // }}
                    style={{
                      width: 150,
                      height: 150,
                      bottom: -10,
                      right: -20,
                      position: 'absolute',
                      zIndex: 1,
                    }}
                    loop={true}
                    autoPlay={true}
                    source={heartanim}
                  />
                )}
                <View style={{flexDirection: 'column'}}>
                  <TouchableHighlight
                    style={styles.captureBtns}
                    onPress={onLiked}>
                    <Image
                      source={require('../../assets/heart.webp')}
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 25,
                        margin: 10,
                        tintColor: '#fff',
                      }}
                    />
                  </TouchableHighlight>
                  <Text style={styles.actionBtnText}>
                    {this.state.likes || '0'}
                  </Text>
                </View>
              </View>
              <View style={styles.captureBtns}>
                <PostComments
                  navigation={(this.props as any).navigation}
                  post={item}
                />
              </View>
              <Text style={styles.actionBtnText}>
                {this.state.comments || '0'}
              </Text>
              <View style={{flexDirection: 'row'}}>
                {this.state.whatsappAnimation && (
                  <Animation
                    // ref={(anim) => {
                    //   this.whatsappAnimationRef = anim;
                    // }}
                    style={{
                      width: 150,
                      height: 150,
                      bottom: -10,
                      right: -20,
                      position: 'absolute',
                      zIndex: 1,
                    }}
                    loop={true}
                    autoPlay={true}
                    source={whatsappanim}
                  />
                )}
                <View style={{flexDirection: 'column'}}>
                  <TouchableHighlight
                    style={styles.captureBtns}
                    onPress={onShare}>
                    <Image
                      source={require('../../assets/share.png')}
                      style={{
                        height: 40,
                        width: 40,
                        margin: 10,
                        tintColor: '#fff',
                      }}
                    />
                  </TouchableHighlight>
                  <Text style={styles.actionBtnText}>
                    {this.state.shares || '0'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              width: width,
              // position: 'absolute',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            }}>
            <Text style={{color: 'white', fontSize: 23, margin: 5}}>
              {item?.message}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  render() {
    let sliderWidth = Dimensions.get('window').width;
    let itemWidth = Dimensions.get('window').width;
    let sliderHeight = Dimensions.get('window').height;

    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Carousel
          onSnapToItem={(index: number) => {
            this.setState({
              paused: false,
            });
            // console.log('onSnapToItem:: ==' + index);
            this.setState({
              loading: true,
              index: index,
            });
          }}
          style={{
            backgroundColor: 'black',
          }}
          inactiveSlideOpacity={1}
          inactiveSlideScale={1}
          vertical={true}
          ref={(c: any) => {
            (this as any)._carousel = c;
          }}
          data={this.state.videoPosts}
          renderItem={this._renderItem}
          sliderWidth={sliderWidth}
          sliderHeight={0.99 * sliderHeight}
          itemHeight={0.99 * sliderHeight}
          itemWidth={itemWidth}
          loopClonesPerSide={0}
          loop={false}
        />

        {this.state.loading && (
          <View
            style={{
              marginTop: 16,
              height: height,
              alignSelf: 'center',
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator size="large" color="#00ff00" />
          </View>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  backgroundVideo: {
    backgroundColor: 'black',
    position: 'absolute',
    top: 8,
    left: 8,
    bottom: 8,
    right: 8,
  },
  captureBtns: {
    height: 50,
    width: 50,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: 'white',
    alignSelf: 'center',
  },
});

export default FollowingFeedScreen;
