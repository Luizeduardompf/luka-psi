import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import { router, usePathname } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useSessionStore } from '@/stores/session.store'
import { config } from '@/constants/config'

export default function SplashScreen() {
  const { session, isInitialized } = useSessionStore()
  const isAuthenticated = !!session
  const pathname = usePathname()
  const isFocused = !pathname.startsWith('/f')

  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.82)).current
  const taglineOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const navigate = () => {
      if (!isFocused) return
      if (isInitialized && isAuthenticated) {
        router.replace('/(app)')
      } else {
        router.replace('/(auth)/login')
      }
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start()

    const timer = setTimeout(navigate, config.splash.duration)
    return () => clearTimeout(timer)
  }, [isAuthenticated, isInitialized, isFocused])

  return (
    <LinearGradient
      colors={['#7C3AED', '#9F67FA', '#A78BFA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="heart" size={52} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Luka</Text>
      </Animated.View>

      <Animated.View style={[styles.taglineContainer, { opacity: taglineOpacity }]}>
        <Text style={styles.tagline}>Gestão humanizada para psicólogos</Text>
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
