import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {WebView} from 'react-native-webview';
import firestore from '@react-native-firebase/firestore';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  webview: {
    width: 0.95 * width,
    height: 250,
    margin: 10,
  },
  title: {
    width: '100%',
    padding: 5,
    color: '#fff',
    backgroundColor: '#48a05e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    fontSize: 32,
  },
});

const PAGE_SIZE = 3;

export default function FacebookVideosScreen({navigation}: any) {
  const [fbvideos, setFbvideos] = useState([]);
  const [error, setError] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  //   const {source} = route.params;

  const getVideos = async () => {
    try {
      const result = await firestore()
        .collection('fbvideos')
        .orderBy('createdAt', 'desc')
        .limit(PAGE_SIZE)
        .get();
      if (!result.empty) {
        const last = result.docs[result.docs.length - 1];
        setLastDoc(last as any);
        const fvideos: any = [];
        result.docs.map((doc) => {
          fvideos.push(doc.data());
        });
        setFbvideos(fvideos);
      }
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  const loadMoreVideos = async () => {
    try {
      if (!lastDoc) {
        return;
      }
      const result = await firestore()
        .collection('fbvideos')
        .orderBy('createdAt', 'desc')
        .startAfter((lastDoc as any)?.data()?.createdAt)
        .limit(PAGE_SIZE)
        .get();

      const last = result.docs[result.docs.length - 1];
      setLastDoc(last as any);

      const newvideos: any = [];
      result.forEach((doc) => {
        newvideos.push({docId: doc.id, ...doc.data()});
      });

      const prevvideos = [...fbvideos];
      setFbvideos(prevvideos.concat(newvideos));
    } catch (err) {
      Sentry.captureException(err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getVideos();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{margin: 10, alignSelf: 'flex-start'}}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            fontFamily: 'sans-serif-medium',
          }}>
          Fb
        </Text>
      </View>
      <FlatList
        horizontal={false}
        data={fbvideos}
        showsVerticalScrollIndicator={false}
        renderItem={({item, index}) => (
          <View>
            <Text style={{margin: 10, fontSize: 20, fontWeight: 'bold'}}>
              #{index + 1}
            </Text>
            {!error && (
              <WebView
                style={styles.webview}
                source={{uri: (item as any).source}}
                scalesPageToFit={true}
                renderLoading={() => <ActivityIndicator size={'small'} />}
                onError={() => {
                  setError(true);
                }}
                renderError={() => (
                  <View>
                    <Text>Error</Text>
                  </View>
                )}
                key={index}
              />
            )}
            {error && <Text>Check internet connection</Text>}
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        onEndReachedThreshold={0.1}
        onEndReached={loadMoreVideos}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
}
