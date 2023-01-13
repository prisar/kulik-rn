import React from 'react';
import {StyleSheet, Text, View, FlatList, Dimensions} from 'react-native';
import {connectInfiniteHits} from 'react-instantsearch-native';
import Highlight from './Highlight';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  separator: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  item: {
    padding: 10,
    marginHorizontal: 20,
    width: 0.8 * width,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    paddingVertical: 10,
    justifyContent: 'space-between',
    // borderBottomWidth: 1,
    alignItems: 'center',
  },
  titleText: {
    fontWeight: 'bold',
  },
});

interface IProps {
  hits: any;
  hasMore: any;
  refine: any;
}

const InfiniteHits = ({hits, hasMore, refine}: IProps) => (
  <FlatList
    data={hits}
    showsVerticalScrollIndicator={false}
    keyExtractor={(item) => item.objectID}
    ItemSeparatorComponent={() => <View style={styles.separator} />}
    onEndReached={() => hasMore && refine()}
    renderItem={({item}) => (
      <View style={styles.item}>
        <Text style={styles.titleText}>
          <Highlight attribute="displayName" hit={item} />
        </Text>
      </View>
    )}
    style={{
      marginTop: 20,
    }}
  />
);

export default connectInfiniteHits(InfiniteHits);
