import React from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  StyleSheet,
  Button,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import * as Sentry from '@sentry/react-native';
import {useNavigation} from '@react-navigation/native';

import Donut from '../../components/Donut';
import moment from 'moment';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
  },
  title: {
    margin: 20,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
  },
  donut: {
    margin: 30,
  },
  ledger: {
    height: 700,
    margin: 5,
  },
  ledgerContainer: {
    paddingTop: 100,
  },
  item: {
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: {
      height: 10,
      width: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    margin: 10,
    borderWidth: 1,
    borderColor: '#f9f9f9',
  },
  itemDetails: {
    flexDirection: 'row',
    margin: 5,
    justifyContent: 'space-between',
    width: 0.9 * width,
  },
});

const logError = (e: any) => {
  console.log(e);
  // Alert.alert('Error', e.message)
};

export default function CoinsScreen() {
  const [ledger, setLedger] = React.useState([]);
  const navigation = useNavigation();
  const [isAvailable, setIsAvailable] = React.useState(false);

  const getCoinsLedger = async () => {
    try {
      const result = await firestore()
        .collection('coins')
        .where('userId', '==', auth().currentUser?.uid)
        .orderBy('createdAt', 'desc')
        .get();

      if (!result.empty) {
        const recentcoins = result.docs.map((doc) => doc.data());
        setLedger(recentcoins as any);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const isWhatsAppAvailable = () =>
    new Promise((resolve, reject) =>
      Linking.canOpenURL('whatsapp://send')
        .then((supported) => resolve(supported))
        .catch((e) => reject(e)),
    );

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getCoinsLedger();
      // RNWhatsAppStickers.
      isWhatsAppAvailable()
        .then(() => setIsAvailable(true))
        .catch(logError);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendStickerPack = () => {
    WaStickers.send('bongfunnypackstickers', 'Kulik Stickers')
      .then(() => console.log('success'))
      .catch(logError);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.title}>
          <Text style={styles.titleText}>Coins</Text>
        </View>
        <View style={styles.donut}>
          <Donut textColor={'green'} />
        </View>
      </View>

      <FlatList
        contentContainerStyle={styles.ledgerContainer}
        horizontal={false}
        data={ledger}
        renderItem={({item}) => {
          return (
            <View style={styles.item}>
              <View style={styles.itemDetails}>
                <Text style={{width: 0.1 * width}}>
                  +{(item as any)?.coins}
                </Text>
                <Text>{(item as any)?.mode}</Text>
                <Text style={{width: 0.3 * width}}>
                  {moment((item as any)?.createdAt).fromNow()}
                </Text>
              </View>
            </View>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
        style={styles.ledger}
        showsVerticalScrollIndicator={false}
      />
      <Text style={{marginBottom: 24, fontSize: 16}}>
        WhatsApp is{' '}
        {isAvailable ? <Text>available</Text> : <Text>not available</Text>}
      </Text>
      {/* {isAvailable && (
        <Button title="Send Stickers" onPress={sendStickerPack} />
      )} */}
    </SafeAreaView>
  );
}
