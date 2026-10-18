import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';

export default function AuthRequiredState({
  title = 'Login Required',
  message = 'Sign in to access your orders, bookings, active ads, and verified profile.',
  icon = 'lock-closed-outline',
  buttonText = 'Log In / Sign Up'
}) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={36} color={Colors.terracotta} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.88}
        >
          <Ionicons name="log-in-outline" size={18} color={Colors.card} style={{ marginRight: 8 }} />
          <Text style={styles.loginBtnText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.canvas
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.subtle
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md
  },
  title: {
    ...Typography.heading2,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center'
  },
  message: {
    ...Typography.caption,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg
  },
  loginBtn: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.terracotta,
    borderRadius: Radii.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle
  },
  loginBtnText: {
    ...Typography.button,
    color: Colors.card,
    fontSize: 14,
    fontWeight: '700'
  }
});
