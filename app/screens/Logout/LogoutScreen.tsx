import React, {useEffect, useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useDispatch} from 'react-redux';

import {LocalizationContext} from '../Translation/Translations';
import Button from '../../components/Button';
import {logout} from '../../store/auth/actions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function SignupScreen({navigation}) {
  const {translations} = useContext(LocalizationContext);
  const dispatch = useDispatch();

  const logOut = () => {
    auth()
      .signOut()
      .then(() => {
        dispatch(logout());
      });
  };

  useEffect(() => {
    logOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={styles.container}>
      <Text style={{fontSize: 32, marginBottom: 30}}>
        {translations['logout.message']}
      </Text>
      <Button
        variant="primary"
        label={translations['logout.signin']}
        onPress={() => {
          navigation.navigate('Login');
        }}
      />
    </View>
  );
}
