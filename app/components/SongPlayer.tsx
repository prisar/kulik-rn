import React, {useState} from 'react';
import PropTypes from 'prop-types';
import TrackPlayer, {
  useTrackPlayerProgress,
  usePlaybackState,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewPropTypes,
} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

function ProgressBar() {
  const progress = useTrackPlayerProgress();

  return (
    <View style={styles.progress}>
      <View style={{flex: progress.position, backgroundColor: 'red'}} />
      <View
        style={{
          flex: progress.duration - progress.position,
          backgroundColor: 'grey',
        }}
      />
    </View>
  );
}

function ControlButton({title, onPress}) {
  return (
    <TouchableOpacity style={styles.controlButtonContainer} onPress={onPress}>
      <Text style={styles.controlButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

ControlButton.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
};

export default function SongPlayer(props) {
  const playbackState = usePlaybackState();
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtwork, setTrackArtwork] = useState();
  const [trackArtist, setTrackArtist] = useState('');
  useTrackPlayerEvents(['playback-track-changed'], async (event) => {
    if (event.type === TrackPlayer.TrackPlayerEvents.PLAYBACK_TRACK_CHANGED) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      const {title, artist, artwork} = track || {};
      setTrackTitle(title);
      setTrackArtist(artist === 'unknown' ? '' : artist);
      setTrackArtwork(artwork);
    }
  });

  const {style, onNext, onPrevious, onTogglePlayback} = props;

  let middleButton = 'play';

  if (
    playbackState === TrackPlayer.STATE_PLAYING ||
    playbackState === TrackPlayer.STATE_BUFFERING
  ) {
    middleButton = 'pause';
  }

  return (
    <View style={[styles.card, style]}>
      <Image style={styles.cover} source={{uri: trackArtwork}} />
      <ProgressBar />
      <Text style={styles.title}>{trackTitle}</Text>
      <Text style={styles.artist}>{trackArtist}</Text>
      <View style={styles.controls}>
        {/* <ControlButton title={'<'} onPress={onPrevious} /> */}
        <Image
          source={require('../assets/step-backward.png')}
          style={{height: 42, width: 42}}
          onPress={onPrevious}
        />
        {/* <ControlButton title={middleButtonText} onPress={onTogglePlayback} /> */}
        {middleButton === 'pause' ? (
          <TouchableWithoutFeedback
            style={{
              borderWidth: 1,
              borderRadius: 72,
              justifyContent: 'center',
              alignItems: 'center',
              color: '#000',
            }}
            onPress={onTogglePlayback}>
            <Image
              source={require('../assets/pause.png')}
              style={{height: 72, width: 72, margin: 5}}
            />
          </TouchableWithoutFeedback>
        ) : (
          <TouchableWithoutFeedback
            style={{
              borderWidth: 1,
              borderRadius: 72,
              justifyContent: 'center',
              alignItems: 'center',
              color: '#000',
            }}
            onPress={onTogglePlayback}>
            <Image
              source={require('../assets/play.png')}
              style={{height: 72, width: 72, margin: 5}}
            />
          </TouchableWithoutFeedback>
        )}
        {/* <ControlButton title={'>'} onPress={onNext} /> */}
        <TouchableWithoutFeedback onPress={onNext}>
          <Image
            source={require('../assets/step-forward.png')}
            style={{height: 42, width: 42}}
          />
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

SongPlayer.propTypes = {
  style: ViewPropTypes.style,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onTogglePlayback: PropTypes.func.isRequired,
};

SongPlayer.defaultProps = {
  style: {},
};

const styles = StyleSheet.create({
  card: {
    width: '75%',
    elevation: 1,
    borderRadius: 20,
    shadowRadius: 2,
    shadowOpacity: 0.1,
    alignItems: 'center',
    shadowColor: 'black',
    backgroundColor: '#f9f9fa',
    shadowOffset: {width: 0, height: 1},
  },
  cover: {
    width: '95%',
    height: 150,
    marginTop: 10,
    backgroundColor: 'grey',
    borderRadius: 20,
  },
  progress: {
    height: 3,
    width: '90%',
    marginTop: 10,
    flexDirection: 'row',
  },
  title: {
    marginTop: 10,
  },
  artist: {
    fontWeight: 'bold',
  },
  controls: {
    marginVertical: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonContainer: {
    flex: 1,
  },
  controlButtonText: {
    fontSize: 72,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
