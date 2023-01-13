import React, {useEffect} from 'react';
import database from '@react-native-firebase/database';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import * as Sentry from '@sentry/react-native';

import AppNavigator from '../../navigation/AppNavigator';
import {User} from '../../store/user/model';
import {selectLoggedInUser} from '../../store/auth/selectors';
import {login} from '../../store/auth/actions';

// We'll create two constants which we will write to
// the Realtime database when this device is offline
// or online.
const isOfflineForDatabase = {
  state: 'offline',
  last_changed: database.ServerValue.TIMESTAMP,
};

const isOnlineForDatabase = {
  state: 'online',
  last_changed: database.ServerValue.TIMESTAMP,
};

export default function RootScreen() {
  const loggedInUser: User | undefined = selectLoggedInUser();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!loggedInUser) {
      // updateStoredUser();
      AsyncStorage.getItem('user')
        .then((user) => {
          dispatch(login(user && JSON.parse(user)));
        })
        .catch((err) => Sentry.captureException(err));
    }

    const userStatusDatabaseRef =
      loggedInUser && database().ref('/status/' + loggedInUser.uid);

    loggedInUser &&
      database()
        .ref('.info/connected')
        .on('value', function (snapshot) {
          // If we're not currently connected, don't do anything.
          if (snapshot.val() == false) {
            return;
          }

          // If we are currently connected, then use the 'onDisconnect()'
          // method to add a set which will only trigger once this
          // client has disconnected by closing the app,
          // losing internet, or any other means.
          userStatusDatabaseRef
            .onDisconnect()
            .set(isOfflineForDatabase)
            .then(function () {
              // The promise returned from .onDisconnect().set() will
              // resolve as soon as the server acknowledges the onDisconnect()
              // request, NOT once we've actually disconnected:
              // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

              // We can now safely set ourselves as 'online' knowing that the
              // server will mark us as offline once we lose connection.
              userStatusDatabaseRef.set(isOnlineForDatabase);
            })
            .catch((err) => {
              Sentry.captureException(err);
            });
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  return (
    <>
      <AppNavigator />
    </>
  );
}
