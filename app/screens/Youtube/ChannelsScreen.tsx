import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
const {width, height} = Dimensions.get('window');
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';

const SPACING = 10;
const ITEM_SIZE = Platform.OS === 'ios' ? width * 0.72 : width * 0.74;
const EMPTY_ITEM_SIZE = (width - ITEM_SIZE) / 2;
const BACKDROP_HEIGHT = height * 0.65;

const Loading = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.paragraph}>Loading...</Text>
  </View>
);

interface BackdropProps {
  channels: any[];
  scrollX: any;
}

const Backdrop = ({channels, scrollX}: BackdropProps) => {
  return (
    <View style={{height: BACKDROP_HEIGHT, width, position: 'absolute'}}>
      <FlatList
        data={channels.reverse()}
        keyExtractor={(item) => item.key + '-backdrop'}
        removeClippedSubviews={false}
        contentContainerStyle={{width, height: BACKDROP_HEIGHT}}
        renderItem={({item, index}) => {
          if (!item.backdrop) {
            return null;
          }
          const translateX = scrollX.interpolate({
            inputRange: [(index - 2) * ITEM_SIZE, (index - 1) * ITEM_SIZE],
            outputRange: [0, width],
            // extrapolate:'clamp'
          });
          return (
            <Animated.View
              removeClippedSubviews={false}
              style={{
                position: 'absolute',
                width: translateX,
                height,
                overflow: 'hidden',
              }}>
              <Image
                source={{uri: item.backdrop}}
                style={{
                  width,
                  height: BACKDROP_HEIGHT,
                  position: 'absolute',
                }}
              />
            </Animated.View>
          );
        }}
      />
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', 'white']}
        style={{
          height: BACKDROP_HEIGHT,
          width,
          position: 'absolute',
          bottom: 0,
        }}
      />
    </View>
  );
};

const getChannels = async () => {
  try {
    const result = await firestore().collection('channels').get();
    const channelList = result.docs
      .map((doc) => doc.data())
      .map(({channelId, channelName, description, thumbnail_high}) => ({
        key: channelId,
        id: channelId,
        title: channelName,
        poster: thumbnail_high,
        backdrop: thumbnail_high,
        rating: 5,
        description: description,
        // TODO
      }));
    return channelList;
  } catch (err) {
    Sentry.captureException(err);
  }
};

interface IProps {
  navigation: any;
}

export default function ChannelsScreen({navigation}: IProps) {
  const [channels, setChannels] = React.useState<any[]>([]);
  const scrollX = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const fetchData = async () => {
      const channelsData = await getChannels();
      // Add empty items to create fake space
      // [empty_item, ...movies, empty_item]
      setChannels([
        {key: 'empty-left'},
        ...(channelsData as any[]),
        {key: 'empty-right'},
      ]);
    };

    if (channels.length === 0) {
      fetchData();
    }
  }, [channels]);

  if (channels.length === 0) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Backdrop channels={channels} scrollX={scrollX} />
      {/* <StatusBar hidden /> */}
      <Animated.FlatList
        showsHorizontalScrollIndicator={false}
        data={channels}
        keyExtractor={(item) => (item as any).key}
        horizontal
        bounces={false}
        decelerationRate={Platform.OS === 'ios' ? 0 : 0.8}
        renderToHardwareTextureAndroid
        contentContainerStyle={{alignItems: 'center'}}
        snapToInterval={ITEM_SIZE}
        snapToAlignment="start"
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}
        renderItem={({item, index}) => {
          if (!(item as any).poster) {
            return <View style={{width: EMPTY_ITEM_SIZE}} />;
          }

          const inputRange = [
            (index - 2) * ITEM_SIZE,
            (index - 1) * ITEM_SIZE,
            index * ITEM_SIZE,
          ];

          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [100, 50, 100],
            extrapolate: 'clamp',
          });

          return (
            <View style={{width: ITEM_SIZE}}>
              <Animated.View
                style={{
                  marginHorizontal: SPACING,
                  padding: SPACING * 2,
                  alignItems: 'center',
                  transform: [{translateY}],
                  backgroundColor: 'white',
                  borderRadius: 34,
                }}>
                <Image
                  source={{uri: (item as any).poster}}
                  style={styles.posterImage}
                />
                <Text style={{fontSize: 24}} numberOfLines={1}>
                  {(item as any).title}
                </Text>
                {/* <Rating rating={item.rating} /> */}
                {/* <Genres genres={item.genres} /> */}
                <Text style={{fontSize: 12}} numberOfLines={3}>
                  {(item as any).description}
                </Text>
                <TouchableHighlight
                  style={{
                    backgroundColor: 'blue',
                    margin: 5,
                    height: 30,
                    width: ITEM_SIZE / 4,
                    borderRadius: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    navigation.navigate('Channel', {
                      channelId: (item as any)?.id,
                    });
                  }}>
                  <Text style={{color: '#fff'}}>View</Text>
                </TouchableHighlight>
              </Animated.View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  posterImage: {
    width: '100%',
    height: ITEM_SIZE * 1.2,
    resizeMode: 'cover',
    borderRadius: 24,
    margin: 0,
    marginBottom: 10,
  },
});
