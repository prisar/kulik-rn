import React from 'react';
import {View, Text, Alert, Dimensions} from 'react-native';
// import * as Updates from 'expo-updates';
import * as Sentry from '@sentry/react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TouchableNativeFeedback} from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';

const {width} = Dimensions.get('window');

export default function ManualUpdateScreen() {
  const [available, setAvailable] = React.useState(false);
  /*
  const otaUpdate = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setAvailable(true);
        await Updates.fetchUpdateAsync();
        // ... notify user of update ...
        Alert.alert(
          'Update is Available!',
          'Do you want to update now?',
          [
            {
              text: 'Ok',
              onPress: () => {
                Updates.reloadAsync();
              },
            },
          ],
          {cancelable: true},
        );
      }
    } catch (e) {
      // handle or log error
      Sentry.captureException(e);
    }
  };
  */

  React.useEffect(() => {}, [available]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
      }}>
      <TouchableNativeFeedback
        onPress={() => {}}
        style={{
          width: 0.5 * width,
          height: 50,
          borderRadius: 50,
          // margin: 10,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fac030',
        }}>
        <Text style={{fontSize: 18, color: '#000'}}>Update</Text>
      </TouchableNativeFeedback>
      {available && (
        <View style={{alignSelf: 'center', margin: 10}}>
          <Progress.Bar progress={0.5} width={300} />
        </View>
      )}
    </SafeAreaView>
  );
}
