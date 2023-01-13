/**
 * @format
 */

import 'react-native';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {act} from 'react-test-renderer';
import {render, fireEvent} from 'react-native-testing-library';

import App from '../app/App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

jest.mock('react-native-gesture-handler', () => {
  // eslint-disable-next-line global-require
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    /* Buttons */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    /* Other */
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

// handle native driver warning
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');
jest.useFakeTimers();

it('renders correctly', () => {
  renderer.create(<App />);
});

describe('<NavigationContainer />', () => {
  it('should match snapshot', async () => {
    const result = render(<NavigationContainer></NavigationContainer>);
    await act(async () => {
      expect(result).toMatchSnapshot();
    });
  });
});
