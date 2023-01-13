import React from 'react';
import {
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';

import {selectLoggedInUser} from '../../store/auth/selectors';
import {User} from '../../store/user/model';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  numbers: {
    margin: 3,
    width: 0.07 * width,
    backgroundColor: '#fac030',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 22,
  },
});

interface IProps {
  navigation: any;
}

export default function FeedbackScreen({navigation}: IProps) {
  const loggedInUser: User | undefined = selectLoggedInUser();

  const sendFeedback = async (rating: number) => {
    try {
      await firestore().collection('nps').add({
        userId: loggedInUser?.uid,
        type: 'APP_FEEDBACK',
        rating: rating,
        createdAt: moment().format(),
      });
      navigation.navigate('Home');
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{fontSize: 32, margin: 10}}>
        How likely are you to recommend this app to a friend?
      </Text>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          style={styles.numbers}
          onPress={() => sendFeedback(0)}>
          <Text style={styles.ratingText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numbers}
          onPress={() => sendFeedback(1)}>
          <Text style={styles.ratingText}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numbers}
          onPress={() => sendFeedback(2)}>
          <Text style={styles.ratingText}>2</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numbers}
          onPress={() => sendFeedback(3)}>
          <Text style={styles.ratingText}>3</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numbers}
          onPress={() => sendFeedback(4)}>
          <Text style={styles.ratingText}>4</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numbers}
          onPress={() => sendFeedback(5)}>
          <Text style={styles.ratingText}>5</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numbers}
          onPress={() => sendFeedback(6)}>
          <Text style={styles.ratingText}>6</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numbers}
          onPress={() => sendFeedback(7)}>
          <Text style={styles.ratingText}>7</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numbers}
          onPress={() => sendFeedback(8)}>
          <Text style={styles.ratingText}>8</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numbers}
          onPress={() => sendFeedback(9)}>
          <Text style={styles.ratingText}>9</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numbers}
          onPress={() => sendFeedback(10)}>
          <Text style={styles.ratingText}>10</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
