import React from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import {connectHighlight} from 'react-instantsearch-native';
import {useNavigation} from '@react-navigation/native';

interface IProps {
  attribute: any;
  hit: any;
  highlight: any;
}

const Highlight = ({attribute, hit, highlight}: IProps) => {
  const navigation = useNavigation();
  const highlights = highlight({
    highlightProperty: '_highlightResult',
    attribute,
    hit,
  });

  return (
    <>
      {highlights.map(({value, isHighlighted}: any, index: any) => {
        const style = {
          backgroundColor: isHighlighted ? 'yellow' : 'transparent',
        };

        if (!value) {
          return;
        }

        return (
          <View key={index} style={style}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Profile', {userId: hit.objectID})
              }>
              <Text>{value}</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </>
  );
};

export default connectHighlight(Highlight);
