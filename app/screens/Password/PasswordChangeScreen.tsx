import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';

import Button from '../../components/Button';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  password: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
  },
  passwordConfirm: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '80%',
    marginTop: 30,
    marginBottom: 30,
  },
  button: {
    marginTop: 30,
  },
  error: {
    color: 'red',
    marginLeft: 30,
  },
});

export default function PasswordChangeScreen() {
  const [password, onChangePassword] = React.useState('');
  const [passwordConfirm, onChangePasswordConfirm] = React.useState('');
  const [error, setError] = React.useState('');

  const changePassword = async () => {
    try {
      setError('');
      if (password !== passwordConfirm) throw 'Not equal';
      if (!password || !passwordConfirm) throw 'Empty fields';
      const user = auth().currentUser;
      await user?.updatePassword(password);
      onChangePassword('');
      onChangePasswordConfirm('');
    } catch (err) {
      // An error happened.
      setError(err.toString());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{fontSize: 32, marginBottom: 30}}>
        {translations['password.title']}
      </Text>
      <TextInput
        secureTextEntry={true}
        style={styles.password}
        onChangeText={(pass) => onChangePassword(pass)}
        value={password}
        placeholder="Password"
      />
      <TextInput
        secureTextEntry={true}
        style={styles.passwordConfirm}
        onChangeText={(passc) => onChangePasswordConfirm(passc)}
        value={passwordConfirm}
        placeholder="Password Confirmation"
      />
      <Button
        variant="primary"
        // label={translations['password.button.change']}
        onPress={changePassword}
        disabled={password !== passwordConfirm}
      />
      <Text style={styles.error}>{error.toString()}</Text>
    </View>
  );
}
