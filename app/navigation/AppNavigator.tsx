// In App.js in a new project

import * as React from 'react';
import {View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {enableScreens} from 'react-native-screens';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-community/async-storage';
import analytics from '@react-native-firebase/analytics';
import * as Sentry from '@sentry/react-native';

import HomeScreen from '../screens/Home/HomeScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import SplashScreen from '../screens/Splash/SplashScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import LogoutScreen from '../screens/Logout/LogoutScreen';
import SignupScreen from '../screens/Signup/SignupScreen';
import AddImageScreen from '../screens/Upload/AddImageScreen';
import LanguageScreen from '../screens/Settings/LanguageScreen';
import AccountScreen from '../screens/Account/AccountScreen';
import PasswordChangeScreen from '../screens/Password/PasswordChangeScreen';
import FeedScreen from '../screens/Feed/FeedScreen';
import VideoPost from '../screens/Post/VideoPost';
import AddPostScreen from '../screens/Post/AddPostScreen';
import PrivacyScreen from '../screens/Privacy/PrivacyScreen';
import TermsScreen from '../screens/Terms/TermsScreen';
import NotificationScreen from '../screens/Notification/NotificationScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import ChatListScreen from '../screens/Chat/ChatListScreen';
import SongScreen from '../screens/Song/SongScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import FollowingFeedScreen from '../screens/Feed/FollowingFeedScreen';
import YoutubeVideoScreen from '../screens/Youtube/YoutubeVideoScreen';
import YoutubeVideosScreen from '../screens/Youtube/YoutubeVideosScreen';
import FacebookVideosScreen from '../screens/Facebook/FacebookVideosScreen';
import PhoneVerificationScreen from '../screens/Account/PhoneVerificationScreen';
import FeedbackScreen from '../screens/Nps/FeedbackScreen';
import ChannelsScreen from '../screens/Youtube/ChannelsScreen';
import ChannelScreen from '../screens/Youtube/ChannelScreen';
import DramasScreen from '../screens/Youtube/DramasScreen';
import VoiceSearchScreen from '../screens/Youtube/VoiceSearchScreen';
import ShowListScreen from '../screens/Youtube/ShowListScreen';
import SerialListScreen from '../screens/Youtube/SerialListScreen';
import AudioUseScreen from '../screens/Post/AudioUseScreen';
import DiscoverScreen from '../screens/Discover/DiscoverScreen';
import MakerLibraryScreen from '../screens/Audio/MakerLibraryScreen';
import CoinsScreen from '../screens/Ledger/CoinsScreen';
import FollowersScreen from '../screens/Profile/FollowersScreen';
import FollowingScreen from '../screens/Profile/FollowingScreen';
import ManualUpdateScreen from '../screens/Update/ManualUpdateScreen';
import FypScreen from '../screens/Feed/FypScreen';
import {LocalizationProvider} from '../screens/Translation/Translations';
import {LocalizationContext} from '../screens/Translation/Translations';
import AuthContext from './AuthContext';
import {greenColor} from '../GlobalStyles';
import SnapNavigator from './SnapNavigator';
import getTheme from '../theme';

// probably causing error while creating screen in native activity
// enableScreens();

const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const reactNavigationV5Instrumentation = new Sentry.ReactNavigationV5Instrumentation(
  {
    routeChangeTimeoutMs: 500, // How long it will wait for the route change to complete. Default is 1000ms
  },
);

function HomeTabs() {
  const {translations, language} = React.useContext(LocalizationContext);

  return (
    <Tab.Navigator
      lazy={true}
      screenOptions={({route}) => ({
        tabBarLabel: ({focused}) => {
          const routeName = route.name;
          return null; // remove tab names, translaton not working
        },
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          let iconSize;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'user' : 'user';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'user' : 'user';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'search' : 'search';
          } else if (route.name === 'AddPost') {
            iconName = focused ? 'plus-circle' : 'plus-circle';
          } else if (route.name === 'Notification') {
            iconName = focused ? 'bell' : 'bell';
          }

          if (route.name === 'AddPost') {
            iconSize = 52;
          } else {
            iconSize = size;
          }

          return (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Icon name={iconName} size={iconSize} color={color} />
              {route.name === 'AddPost' ? (
                <></>
              ) : (
                <Text style={{fontSize: 10, color: 'black'}}>
                  {translations[`navigation.tab.${route.name.toLowerCase()}`]}
                </Text>
              )}
            </View>
          );
        },
        tabBarButton: [
          'Login',
          'Logout',
          'Signup',
          'AddImage',
          'Language',
          'Account',
          'PasswordChange',
          'Profile',
          'VideoPost',
          'Privacy',
          'Terms',
          'Chat',
          'ChatList',
          'Song',
          'FollowingFeed',
          'YoutubeVideo',
          'YoutubeVideos',
          'FacebookVideos',
          'PhoneVerification',
          'Feedback',
          'Channels',
          'Channel',
          'Dramas',
          'VoiceSearch',
          'AudioUseage',
          'Feed',
          'AudioLibrary',
          'Coins',
          'Followers',
          'Following',
          'ForYouPage',
          'ManualUpdate',
        ].includes(route.name)
          ? () => {
              return null;
            }
          : undefined,
      })}
      tabBarOptions={{
        activeTintColor: '#1654f0',
        inactiveTintColor: 'black',
      }}
      initialRouteName="Home">
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="AddPost" component={AddPostScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
      />
      <Tab.Screen name="Login" component={LoginScreen} />
      <Tab.Screen name="Logout" component={LogoutScreen} />
      <Tab.Screen name="Signup" component={SignupScreen} />
      <Tab.Screen name="AddImage" component={AddImageScreen} />
      <Tab.Screen
        name="Language"
        component={LanguageScreen}
        options={{tabBarVisible: false}}
      />
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="PasswordChange" component={PasswordChangeScreen} />
      <Tab.Screen name="VideoPost" component={VideoPost} />
      <Tab.Screen name="Privacy" component={PrivacyScreen} />
      <Tab.Screen name="Terms" component={TermsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="ChatList" component={ChatListScreen} />
      <Tab.Screen name="Song" component={SongScreen} />
      <Tab.Screen name="FollowingFeed" component={FollowingFeedScreen} />
      <Tab.Screen name="YoutubeVideo" component={YoutubeVideoScreen} />
      <Tab.Screen name="YoutubeVideos" component={YoutubeVideosScreen} />
      <Tab.Screen name="FacebookVideos" component={FacebookVideosScreen} />
      <Tab.Screen name="Feedback" component={FeedbackScreen} />
      <Tab.Screen name="Channels" component={ChannelsScreen} />
      <Tab.Screen name="Channel" component={ChannelScreen} />
      <Tab.Screen name="Dramas" component={DramasScreen} />
      <Tab.Screen name="VoiceSearch" component={VoiceSearchScreen} />
      <Tab.Screen name="AudioUseage" component={AudioUseScreen} />
      <Tab.Screen name="AudioLibrary" component={MakerLibraryScreen} />
      <Tab.Screen name="Coins" component={CoinsScreen} />
      <Tab.Screen name="Followers" component={FollowersScreen} />
      <Tab.Screen name="Following" component={FollowingScreen} />
      <Tab.Screen name="ForYouPage" component={FypScreen} />
      <Tab.Screen name="ManualUpdate" component={ManualUpdateScreen} />
      <Tab.Screen
        name="PhoneVerification"
        component={PhoneVerificationScreen}
      />
    </Tab.Navigator>
  );
}

export const isReadyRef = React.createRef();
export const navigationRef = React.createRef();

export function navigate(name, params) {
  if (isReadyRef.current && navigationRef.current) {
    // Perform navigation if the app has mounted
    navigationRef.current.navigate(name, params);
  } else {
    // You can decide what to do if the app hasn't mounted
    // You can ignore this, or add these actions to a queue you can call later
  }
}

const AppNavigator = React.forwardRef(() => {
  const routeNameRef = React.useRef();
  // const navigationRef = React.useRef();

  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    },
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch (e) {
        // Restoring token failed
      }

      // After restoring token, we may need to validate it in production apps

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({type: 'RESTORE_TOKEN', token: userToken});
    };

    bootstrapAsync();

    return () => {
      isReadyRef.current = false;
    };
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (data) => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token

        // await AsyncStorage.setItem('userToken', data.token);
        // console.log('sigin context');

        dispatch({type: 'SIGN_IN', token: 'b3ScJaP67wX2WxJ0p6K9vacHbQh2n'});
      },
      signOut: () => dispatch({type: 'SIGN_OUT'}),
      signUp: async (data) => {
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token

        dispatch({type: 'SIGN_IN', token: 'dummy-auth-token'});
      },
    }),
    [],
  );

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current.getCurrentRoute().name;
        isReadyRef.current = true;
        reactNavigationV5Instrumentation.registerNavigationContainer(
          navigationRef,
        );
      }}
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current.getCurrentRoute().name;

        if (previousRouteName !== currentRouteName) {
          analytics().logScreenView({
            screen_name: currentRouteName,
            screen_class: currentRouteName,
          });
          analytics().logEvent(`screen_${currentRouteName}`);
        }

        // Save the current route name for later comparision
        routeNameRef.current = currentRouteName;
      }}
      // TODO: light, dark from OS appearance
      theme={getTheme('light')}>
      <LocalizationProvider>
        <AuthContext.Provider value={authContext}>
          <RootStack.Navigator
            screenOptions={{
              headerShown: false,
            }}>
            <RootStack.Screen name="Splash" component={SplashScreen} />
            <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
            <RootStack.Screen name="HomeTabs" component={HomeTabs} />
            <RootStack.Screen name="Snaps" component={SnapNavigator} />
            <RootStack.Screen name="ShowList" component={ShowListScreen} />
            <RootStack.Screen name="SerialList" component={SerialListScreen} />
          </RootStack.Navigator>
        </AuthContext.Provider>
      </LocalizationProvider>
    </NavigationContainer>
  );
});

// NOTE: UselessName, /^SomeRegex/ will be added later
export default Sentry.withTouchEventBoundary(AppNavigator, {
  ignoreNames: ['Provider', 'UselessName', /^SomeRegex/],
});
