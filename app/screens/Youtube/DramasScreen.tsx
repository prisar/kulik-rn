import React from 'react';
import {View, Dimensions, StyleSheet, Platform} from 'react-native';
import Carousel, {ParallaxImage} from 'react-native-snap-carousel';
import firestore from '@react-native-firebase/firestore';
import {TouchableNativeFeedback} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';

const {width: screenWidth} = Dimensions.get('window');

class DramasScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      entries: [],
    };
  }

  _renderItem = ({item, index}, parallaxProps) => {
    return (
      <TouchableNativeFeedback
        onPress={() => {
          this.props.navigation?.navigate('Channel', {
            channelId: item.id,
          });
        }}>
        <View style={styles.item}>
          <ParallaxImage
            source={{uri: item.poster}}
            containerStyle={styles.imageContainer}
            style={styles.image}
            parallaxFactor={0.4}
            {...parallaxProps}
          />
          {/* <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text> */}
        </View>
      </TouchableNativeFeedback>
    );
  };

  _getChannels = async () => {
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
      this.setState({entries: channelList});
      return channelList;
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  componentDidMount() {
    this._getChannels();
  }

  render() {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          paddingVertical: 10,
        }}>
        <Carousel
          ref={(c) => {
            this._carousel = c;
          }}
          sliderWidth={screenWidth}
          sliderHeight={screenWidth}
          itemWidth={screenWidth - 60}
          data={this.state.entries}
          renderItem={this._renderItem}
          hasParallaxImages={true}
          autoplay
          loop
          autoplayDelay={1000}
          autoplayInterval={3000}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    width: screenWidth - 60,
    height: screenWidth + 60,
  },
  imageContainer: {
    flex: 1,
    marginBottom: Platform.select({ios: 0, android: 1}), // Prevent a random Android rendering issue
    backgroundColor: 'white',
    borderRadius: 20,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  title: {
    alignSelf: 'center',
  },
});

export default DramasScreen;
