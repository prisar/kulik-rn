import React, {useRef, useState} from 'react';
import Video from 'react-native-video';
import {Text, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import {lightDarkColor} from '../GlobalStyles';

const styles = StyleSheet.create({
  backgroundVideo: {
    // position: 'absolute',
    width: '100%',
    height: 300,
    flex: 1,
    zIndex: 100,
    backgroundColor: lightDarkColor,
  },
  title: {
    width: '100%',
    padding: 5,
    color: '#fff',
    backgroundColor: '#48a05e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    fontSize: 32,
  },
});

const THRESHOLD = 100;

export default function Vid({source, scrollOffset}) {
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  let player = useRef();

  const onBuffer = () => {
    // console.log('buffering');
  };

  const handleVideoLayout = (event) => {
    const {height} = Dimensions.get('window');
    const startPosition = event.nativeEvent.layout.y - height + THRESHOLD;
    const endPosition =
      event.nativeEvent.layout.y + event.nativeEvent.layout.height - THRESHOLD;
    setStart(startPosition);
    setEnd(endPosition);

    if (scrollOffset > start && scrollOffset < end && paused) {
      setPaused(false);
    } else if (scrollOffset > end && scrollOffset < start && !paused) {
      setPaused(true);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        setMuted(!muted);
      }}>
      <Video
        muted={muted}
        onLayout={handleVideoLayout}
        paused={paused}
        source={{
          uri: source,
        }} // Can be a URL or a local file.
        ref={(ref) => {
          player = ref;
        }} // Store reference
        onBuffer={onBuffer} // Callback when remote video is buffering
        // onError={this.videoError} // Callback when video cannot be loaded
        style={styles.backgroundVideo}
        repeat
        // controls
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}
