import React, { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated'
import { router, useIsFocused } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSessionStore } from '@/stores/session.store'
import { config } from '@/constants/config'

export default function SplashScreen() {
  const { session, isInitialized } = useSessionStore()
  const isAuthenticated = !!session
  const isFocused = useIsFocused()

  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.82)
  const taglineOpacity = useSharedValue(0)

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }))

  useEffect(() => {
    const navigate = () => {
      if (!isFocused) return
      if (isInitialized && isAuthenticated) {
        router.replace('/(app)')
      } else {
        router.replace('/(auth)/login')
      }
    }

    opacity.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    })
    scale.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.back(1.2)),
    })
    taglineOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 600 }),
    )

    const timer = setTimeout(() => {
      runOnJS(navigate)()
    }, config.splash.duration)

    return () => clearTimeout(timer)
  }, [isAuthenticated, isInitialized, isFocused, opacity, scale, taglineOpacity])

  return (
    <LinearGradient
      colors={['#7C3AED', '#9F67FA', '#A78BFA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.content, logoStyle]}>
        <View style={styles.iconContainer}>
          <Ionicons name="heart" size={52} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Luka</Text>
      </Animated.View>

      <Animated.View style={[styles.taglineContainer, taglineStyle]}>
        <Text style={styles.tagline}>Gestao humanizada para psicologos</Text>
      </Animated.View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  taglineContainer: {
    position: 'absolute',
    bottom: 80,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.3,
  },
})
