import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import Typography from '../constants/typography';
import ScreenContainer from './ScreenContainer';





export const PlaceholderScreen = ({ label }) => {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.subtitle}>Coming soon</Text>
      </View>
    </ScreenContainer>);

};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    ...Typography.heading2,
    color: Colors.textPrimary,
    marginBottom: 4
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary
  }
});

export default PlaceholderScreen;