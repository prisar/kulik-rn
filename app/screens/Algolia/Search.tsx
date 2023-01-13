import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import algoliasearch from 'algoliasearch';
import {InstantSearch} from 'react-instantsearch-native';

import SearchBox from './SearchBox';
import InfiniteHits from './InfiniteHits';
import constants from '../../config/constants';

const searchClient = algoliasearch(
  `${constants.config.algolia.appid}`,
  `${constants.config.algolia.searchkey}`,
);

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    // backgroundColor: '#252b33',
    width: 0.95 * width,
    padding: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
});

class Search extends React.Component {
  root = {
    Root: View,
    props: {
      style: {
        flex: 1,
      },
    },
  };

  render() {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
        <View style={styles.container}>
          <InstantSearch
            searchClient={searchClient}
            indexName="prod_users"
            root={this.root}>
            <SearchBox />
            <InfiniteHits />
          </InstantSearch>
        </View>
      </SafeAreaView>
    );
  }
}

export default Search;
