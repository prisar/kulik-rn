import React, {useContext, useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker';
import analytics from '@react-native-firebase/analytics';
import {useNavigation} from '@react-navigation/native';
import LottieView from 'lottie-react-native';

import {LocalizationContext} from '../Translation/Translations';
const waves = require('../../assets/animations/waves-and-stripe.json');

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    marginBottom: 30,
  },
  phoneIcon: {
    width: 150,
    height: 150,
    marginTop: (height * 2) / 5,
    alignSelf: 'flex-start',
    tintColor: 'blue',
  },
  modalText: {
    width: 0.7 * width,
  },
  otp: {
    width: 30,
    margin: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    color: 'black',
    fontSize: 20,
  },
  error: {
    color: 'red',
    marginLeft: 30,
  },
});

interface IProps {
  route: any;
}

export default function PhoneVerificationScreen({route}: IProps) {
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [code, setCode] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState([null, null, null, null, null, null]);
  const [error, setError] = useState('');
  const [country, setCountry] = useState('+91');
  const navigation = useNavigation();
  // const [country, setCountry] = useState('uk');

  //Phone siginin: If null, no SMS has been sent
  const [confirmation, setConfirmation] = useState(null);

  const otpRefs = [
    useRef<any>(),
    useRef<any>(),
    useRef<any>(),
    useRef<any>(),
    useRef<any>(),
    useRef<any>(),
  ];

  const {translations} = useContext(LocalizationContext);

  const iconSize = 32;

  const verifyOtpAndUpdate = async () => {
    try {
      if (!verificationId) {
        return;
      }
      const credential = auth.PhoneAuthProvider.credential(
        verificationId, // snapshot.verificationId,
        code as any, // snapshot.code,
      );

      // Update user with new verified phone number
      await auth().currentUser?.updatePhoneNumber(credential);
      navigation.navigate('Account');
    } catch (err) {
      setError(err.toString());
      Sentry.captureException(err);
    }
  };

  const confirm = async () => {
    try {
      if (!otpSent) {
        await sendOtp();
        setOtpSent(true);
        return;
      }
      // phonesigin
      if (route?.params?.phoneSignIn) {
        confirmSigin();
        return;
      }
      const userOtp = otp.join('');
      if (userOtp.match(code as any)) {
        await verifyOtpAndUpdate();
      }
    } catch (err) {
      setError(err.toString());
      Sentry.captureException(err);
    }
  };

  const sendOtp = async () => {
    try {
      // if ((phoneNumber as any)?.length < 10) {
      //   setError('Check Number');
      //   return;
      // }

      if (route.params?.phoneSignIn) {
        await signInWithPhoneNumber(phoneNumber as any);
        return;
      }

      auth()
        .verifyPhoneNumber(`${country}${phoneNumber}`, false, false)
        .on('state_changed', (phoneAuthSnapshot) => {
          if (phoneAuthSnapshot.state === 'verified') {
            setVerificationId(phoneAuthSnapshot?.verificationId as any);
            setCode(phoneAuthSnapshot?.code as any);
          }
        })
        .then((data: any) => {
          Sentry.captureMessage('otp', data);
        })
        .catch((err) => {
          setError(err.message || err.toString());
          Sentry.captureException(err);
        });
      analytics().logEvent('phone_number_entered');
    } catch (err) {
      setError(err.toString());
      Sentry.captureException(err);
    }
  };

  const changeOtp = (text: any, index: number) => {
    let userotp = [...otp];
    userotp[index] = text;
    setOtp(userotp);
    if (!text) {
      return;
    }
    otpRefs[index]?.current?.blur();
    if (index !== otp.length - 1) {
      focusNextField(index + 1);
    }
  };

  async function signInWithPhoneNumber(mobile: any) {
    try {
      const result = await auth().signInWithPhoneNumber(`+91${mobile as any}`);
      setConfirmation(result as any); // let confirmation happen before creation which can be done though backend
      analytics().logEvent('phone_number_verified');
    } catch (err) {
      setError(err.message);
      Sentry.captureException(err);
    }
  }

  const saveUserAndNavigate = async () => {
    try {
      if (!auth().currentUser) {
        return;
      }
      const dbuser = await firestore()
        .collection('users')
        .doc(auth().currentUser?.uid)
        .get();
      if (dbuser.exists) {
        await firestore()
          .collection('users')
          .doc(auth().currentUser?.uid)
          .set(
            {
              userId: auth().currentUser?.uid || '',
              displayName: auth().currentUser?.displayName || 'আগ্রহী',
              phoneNumber: auth().currentUser?.phoneNumber || '',
              phoneVerified: true,
              avatar: auth().currentUser?.photoURL,
              updatedAt: moment().format(),
              lastSignInTime: auth().currentUser?.metadata?.lastSignInTime,
              lastActivityAt: moment().format(),
              preferredLanguage: 'bn',
              loggedInApps: firestore.FieldValue.arrayUnion('com.agrohi.kulik'),
            },
            {merge: true},
          );
        navigation.navigate('Home');
      } else {
        await firestore()
          .collection('users')
          .doc(auth().currentUser?.uid)
          .set(
            {
              userId: auth().currentUser?.uid || '',
              displayName: auth().currentUser?.displayName || 'আগ্রহী',
              phoneNumber: auth().currentUser?.phoneNumber || '',
              phoneVerified: true,
              avatar: auth().currentUser?.photoURL,
              createdAt: moment().format(),
              updatedAt: moment().format(),
              lastSignInTime: auth().currentUser?.metadata?.lastSignInTime,
              lastActivityAt: moment().format(),
              preferredLanguage: 'bn',
              loggedInApps: firestore.FieldValue.arrayUnion('com.agrohi.kulik'),
            },
            {merge: true},
          );
        navigation.navigate('Account', {editingOn: true});
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  async function confirmSigin() {
    try {
      // https://stackoverflow.com/questions/57054891/the-sms-code-has-expired-please-re-send-the-verification-code-to-try-again
      if (!auth().currentUser) {
        await (confirmation as any)?.confirm(otp.join(''));
      }
      await saveUserAndNavigate();
    } catch (err) {
      // console.log('Invalid code.');
      setError(err.message);
      Sentry.captureException(err);
    }
  }

  const focusNextField = (nextField: number) => {
    otpRefs[nextField].current.focus();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setOtpSent(false);
      setError('');
      setPhoneNumber(null);
      setOtp([null, null, null, null, null, null]);
    });

    return () => {
      unsubscribe;
      // remove the listsner on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, phoneNumber]);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../assets/phone.png')}
        style={styles.phoneIcon}
      />
      <Text>{translations['phoneverification.message.otp']}</Text>
      <View style={{flexDirection: 'row'}}>
        {otpSent && !error?.length ? (
          <>
            <TextInput
              ref={otpRefs[0]}
              value={otp[0] || ''}
              autoFocus={true}
              returnKeyType="next"
              onChangeText={(text) => changeOtp(text, 0)}
              style={styles.otp}
              placeholder="0"
              autoCompleteType={'cc-number'}
              keyboardType={'phone-pad'}
              maxLength={1}
            />
            <TextInput
              ref={otpRefs[1]}
              value={otp[1] || ''}
              onChangeText={(text) => changeOtp(text, 1)}
              style={styles.otp}
              placeholder="0"
              autoCompleteType={'cc-number'}
              keyboardType={'phone-pad'}
              maxLength={1}
            />
            <TextInput
              ref={otpRefs[2]}
              value={otp[2] || ''}
              onChangeText={(text) => changeOtp(text, 2)}
              style={styles.otp}
              placeholder="0"
              autoCompleteType={'cc-number'}
              keyboardType={'phone-pad'}
              maxLength={1}
            />
            <TextInput
              ref={otpRefs[3]}
              value={otp[3] || ''}
              onChangeText={(text) => changeOtp(text, 3)}
              style={styles.otp}
              placeholder="0"
              autoCompleteType={'cc-number'}
              keyboardType={'phone-pad'}
              maxLength={1}
            />
            <TextInput
              ref={otpRefs[4]}
              value={otp[4] || ''}
              onChangeText={(text) => changeOtp(text, 4)}
              style={styles.otp}
              placeholder="0"
              autoCompleteType={'cc-number'}
              keyboardType={'phone-pad'}
              maxLength={1}
            />
            <TextInput
              ref={otpRefs[5]}
              value={otp[5] || ''}
              onChangeText={(text) => changeOtp(text, 5)}
              style={styles.otp}
              placeholder="0"
              autoCompleteType={'cc-number'}
              keyboardType={'phone-pad'}
              maxLength={1}
            />
          </>
        ) : (
          <>
            <DropDownPicker
              items={[
                {
                  label: '+91',
                  value: '+91',
                  icon: () => <Text>🇮🇳</Text>,
                  // hidden: true,
                },
                {
                  label: '+880',
                  value: '+880',
                  icon: () => <Text>🇧🇩</Text>,
                },
                {
                  label: '+977',
                  value: '+977',
                  icon: () => <Text>🇳🇵</Text>,
                },
              ]}
              defaultValue={country}
              containerStyle={{
                height: 50,
                width: 95,
                marginVertical: 10,
                marginHorizontal: 5,
              }}
              style={{backgroundColor: '#fafafa'}}
              itemStyle={{
                justifyContent: 'flex-start',
              }}
              dropDownStyle={{backgroundColor: '#fff'}}
              onChangeItem={(item) => setCountry(item.value)}
            />
            <TextInput
              value={phoneNumber || ''}
              onChangeText={(text) => setPhoneNumber(text as any)}
              style={{
                width: 0.5 * width,
                marginVertical: 10,
                marginHorizontal: 5,
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 5,
                fontSize: 20,
              }}
              placeholder={
                translations['phoneverification.placeholder.entermobile']
              }
              autoFocus={true}
              autoCompleteType={'cc-number'}
              keyboardType={'phone-pad'}
              maxLength={12}
            />
          </>
        )}
        <TouchableOpacity
          style={{
            height: 50,
            width: 70,
            margin: 10,
            borderRadius: 5,
            backgroundColor: 'blue',
            alignSelf: 'flex-end',
          }}
          onPress={confirm}>
          <Icon
            name="arrow-right"
            color={'white'}
            size={iconSize}
            style={{alignSelf: 'center', margin: 5}}
          />
        </TouchableOpacity>
      </View>
      <LottieView
        source={waves}
        autoPlay
        loop
        style={{width: width, height: (height * 3) / 5, marginBottom: 150}}
        resizeMode="cover"
        autoSize
      />
      <Text style={styles.error}>{error.toString()}</Text>
    </SafeAreaView>
  );
}
