import React from 'react';
import {Easing} from 'react-native';
import {createSharedElementStackNavigator} from 'react-navigation-shared-element';

import ShortVideoScreen from '../screens/Video/ShortVideoScreen';
import ShortVideoPost from '../screens/Video/ShortVideoPost';

const Stack = createSharedElementStackNavigator();

const SnapNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Snap"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Snap" component={ShortVideoScreen} />
      <Stack.Screen
        name="SnapVideo"
        component={ShortVideoPost}
        options={(navigation) => ({
          headerBackTitleVisible: true, // false
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {duration: 500, easing: Easing.inOut(Easing.ease)},
            },
            close: {
              animation: 'timing',
              config: {duration: 500, easing: Easing.inOut(Easing.ease)},
            },
          },
          cardStyleInterpolator: ({current: {progress}}) => {
            return {
              cardStyle: {
                opacity: progress,
              },
            };
          },
        })}
        sharedElementsConfig={(route) => {
          //   const {data} = route.params;
          const {postId} = route.params;
          return [
            {
              //   id: `item.${data.id}.photo`,
              id: `item.${postId}.photo`,
              animation: 'move',
              resize: 'clip',
              align: 'center-top',
            },
            // {
            //   id: `item.${data.id}.text`,
            //   animation: 'fade',
            //   resize: 'clip',
            //   align: 'left-center',
            // },

            // {
            //   id: `item.${data.id}.profilePic`,
            //   animation: 'move',
            //   resize: 'clip',
            //   align: 'left-center',
            // },
            // {
            //   id: `item.${data.id}.username`,
            //   animation: 'fade',
            //   resize: 'clip',
            //   align: 'left-center',
            // },
            // {
            //   id: `item.${data.id}.readtime`,
            //   animation: 'fade',
            //   resize: 'clip',
            //   align: 'left-center',
            // },
          ];
        }}
      />
    </Stack.Navigator>
  );
};

export default SnapNavigator;
