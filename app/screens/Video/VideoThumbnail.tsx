import React from 'react';
import {Image, View, Dimensions} from 'react-native';
import storage from '@react-native-firebase/storage';
import {TouchableOpacity} from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import moment from 'moment';

const {width} = Dimensions.get('window');

interface IProps {
  navigation: any;
  post: any;
}

export default function VideoThumbnail({navigation, post}: IProps) {
  const [thumbUrl, setThumburl] = React.useState();
  const getImageUrl = async () => {
    try {
      let path;
      if (moment(post.createdAt).isBefore('2021-03-11T06:10:41+05:30')) {
        path = `/videos/thumbnails/${post?.videoId}.png`;
      } else {
        path = `/videos/${post?.userId}/thumbnails/${post?.videoId}.png`;
      }
      const ref = storage().ref(path);
      const url = await ref.getDownloadURL();
      setThumburl(url as any);
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  React.useEffect(() => {
    getImageUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thumbUrl]);

  return (
    <>
      <View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Snaps', {
              screen: 'SnapVideo',
              params: {
                postId: post.docId,
              },
            })
          }>
          <Image
            source={{uri: thumbUrl}}
            style={{
              width: width * 0.3,
              height: 180,
              borderRadius: 10,
              resizeMode: 'cover',
            }}
          />
        </TouchableOpacity>
      </View>
    </>
  );
}
