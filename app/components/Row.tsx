import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 10,
  },
  content: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3a3a3a',
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    marginTop: 2,
  },
  separator: {
    // backgroundColor: '#ececec',
    // height: 0.5,
  },
  right: {
    alignItems: 'flex-end',
    flex: 1,
  },
});

interface IProps {
  image: any;
  title: any;
  subtitle: any;
  lastMesssageAt: any;
  onPress: any;
}

export const Row = ({
  image,
  title,
  subtitle,
  lastMesssageAt,
  onPress,
}: IProps) => (
  <TouchableOpacity onPress={onPress} style={styles.container}>
    <View>
      <Image source={image} style={styles.image} />
    </View>
    <View style={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
    <View style={styles.right}>
      <Text>{lastMesssageAt}</Text>
    </View>
  </TouchableOpacity>
);

export const Separator = () => <View style={styles.separator} />;
