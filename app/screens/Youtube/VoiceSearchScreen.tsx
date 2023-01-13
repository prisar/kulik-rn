import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Voice, {
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';
import LottieView from 'lottie-react-native';
import {TouchableNativeFeedback} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';

import {LocalizationContext} from '../Translation/Translations';
import constants from '../../config/constants';

const {width} = Dimensions.get('window');

type Props = {};
type State = {
  recognized: string;
  pitch: string;
  error: string;
  end: string;
  started: string;
  results: string[];
  partialResults: string[];
  searchTerm: string;
  videos: any[];
  loading: boolean;
};

const LANGUAGE_STANDARD = {
  en: 'en-US',
  bn: 'bn-BD',
  rbn: 'bn-BD',
  // hi: 'hi-IN',
};

class VoiceSearchScreen extends Component<Props, State> {
  state = {
    recognized: '',
    pitch: '',
    error: '',
    end: '',
    started: '',
    results: [],
    partialResults: [],
    searchTerm: '',
    videos: [],
    loading: false,
  };

  constructor(props: Props) {
    super(props);
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechRecognized = this.onSpeechRecognized;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
  }

  componentWillUnmount() {
    Voice.destroy().then(Voice.removeAllListeners);
  }

  onSpeechStart = (e: any) => {
    // console.log('onSpeechStart: ', e);
    this.setState({
      started: '√',
    });
  };

  onSpeechRecognized = (e: SpeechRecognizedEvent) => {
    // console.log('onSpeechRecognized: ', e);
    this.setState({
      recognized: '√',
    });
  };

  onSpeechEnd = (e: any) => {
    // console.log('onSpeechEnd: ', e);
    this.setState({
      end: '√',
    });
  };

  onSpeechError = (e: SpeechErrorEvent) => {
    // console.log('onSpeechError: ', e);
    this.setState({
      error: JSON.stringify(e.error),
    });
  };

  onSpeechResults = (e: SpeechResultsEvent) => {
    // console.log('onSpeechResults: ', e);
    this.setState({
      results: e.value as any[],
    });
    this._fetchYoutubeData(e.value?.length ? e.value[0] : 'Rajbanshi');
    this.setState({searchTerm: e.value?.length ? e.value[0] : ''});
  };

  onSpeechPartialResults = (e: SpeechResultsEvent) => {
    // console.log('onSpeechPartialResults: ', e);
    this.setState({
      partialResults: e.value as any[],
    });
  };

  onSpeechVolumeChanged = (e: any) => {
    // console.log('onSpeechVolumeChanged: ', e);
    this.setState({
      pitch: e.value,
    });
  };

  _startRecognizing = async () => {
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      partialResults: [],
      end: '',
    });

    let {appLanguage} = this.context;
    try {
      await Voice.start(LANGUAGE_STANDARD[appLanguage] || 'en-US');
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  _stopRecognizing = async () => {
    try {
      await Voice.stop();
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  _cancelRecognizing = async () => {
    try {
      await Voice.cancel();
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  _destroyRecognizer = async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error(e);
    }
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      partialResults: [],
      end: '',
    });
  };

  _fetchYoutubeData = async (searchTerm: string) => {
    try {
      this.setState({loading: true});
      const response = await fetch(
        `${constants.config.cloudfunctions.endpoint}/searchYoutubeVideos?searchTerm=${searchTerm}`,
      );
      if (response.status !== 200) {
        // setVideoPosts(items);
        return;
      }
      const json = await response.json();
      if (!json.items) {
        return;
      }
      this.setState({videos: json.items});
      this.setState({loading: false});
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{flexDirection: 'column'}}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              // width: 0.9 * width,
              margin: 10,
            }}>
            <TouchableNativeFeedback onPress={this._startRecognizing}>
              <Image style={styles.button} source={require('./button.png')} />
            </TouchableNativeFeedback>
            {/* <TouchableNativeFeedback onPress={this._stopRecognizing}>
              <Text style={styles.action}>Stop Recognizing</Text>
            </TouchableNativeFeedback> */}
          </View>

          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 18, zIndex: 99}}>
              {this.state.searchTerm}
            </Text>
          </View>

          {/* {!this.state.videos?.length && !this.state.loading && (
            <View style={{flex: 6}}>
              <LottieView
                source={require('../../assets/animations/voice-search.json')}
                autoPlay
                loop={true}
                style={styles.emptyAnimation}
              />
            </View>
          )} */}

          {this.state.loading && (
            <View
              style={{
                flex: 1,
                // marginTop: 16,
                height: 30,
                alignSelf: 'center',
                // position: 'absolute',
              }}>
              <ActivityIndicator size="large" color="red" />
            </View>
          )}

          {!this.state.loading && this.state.videos?.length ? (
            <View style={{flex: 6}}>
              <FlatList
                data={this.state.videos}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() =>
                      (this.props as any).navigation.navigate('YoutubeVideo', {
                        videoId: (item as any).id?.videoId,
                        title: (item as any).snippet?.title,
                      })
                    }>
                    <Image
                      source={{uri: (item as any).snippet.thumbnails.high.url}}
                      style={styles.image}
                    />
                    <View style={{flexDirection: 'column'}}>
                      <Text style={styles.videoTitle}>
                        {(item as any).snippet.title}
                      </Text>
                      <Text style={styles.channelTitle}>
                        {(item as any).snippet.channelTitle}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                // style={{height: height, width: width, margin: 0.5}}
                onEndReachedThreshold={1}
                scrollEventThrottle={16}
              />
            </View>
          ) : (
            <View
              style={{flex: 6, justifyContent: 'center', alignItems: 'center'}}>
              <LottieView
                source={require('../../assets/animations/voice-search.json')}
                autoPlay
                loop={true}
                style={styles.emptyAnimation}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }
}

VoiceSearchScreen.contextType = LocalizationContext;

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  action: {
    textAlign: 'center',
    color: '#0000FF',
    marginVertical: 5,
    fontWeight: 'bold',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  stat: {
    textAlign: 'center',
    color: '#B0171F',
    marginBottom: 1,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#002852',
    margin: 5,
    borderRadius: 5,
    elevation: 10,
  },
  image: {
    width: 220,
    height: 120,
    borderWidth: 1,
    margin: 5,
  },
  videoTitle: {
    width: width - 230,
    fontSize: 16,
    color: '#fff',
  },
  channelTitle: {
    width: width - 150,
    fontSize: 16,
    fontStyle: 'italic',
    color: 'yellow',
  },
  emptyAnimation: {
    // alignSelf: 'center',
    width: '90%',
    zIndex: -1,
  },
});

export default VoiceSearchScreen;
