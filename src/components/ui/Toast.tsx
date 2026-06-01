import React, { useEffect, useRef } from 'react'
import { Animated, Text, View, StyleSheet, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '@/constants/theme'

interface ToastProps {
  visible: boolean
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onHide?: () => void
}

export function Toast({ visible, message, type = 'success', duration = 2500, onHide }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(-20)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 20 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start()

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => onHide?.())
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!visible) return null

  const bgColor = type === 'success' ? '#10B981' : type === 'error' ? theme.colors.error : theme.colors.primary
  const icon = type === 'success' ? 'checkmark-circle' : type === 'error' ? 'alert-circle' : 'information-circle'

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }], backgroundColor: bgColor },
      ]}
      pointerEvents="none"
    >
      <Ionicons name={icon} size={18} color="#FFF" />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  )
}

/** Hook to manage toast state */
export function useToast() {
  const [toast, setToast] = React.useState<{ visible: boolean; message: string; type?: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
  })

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type })
  }

  const hideToast = () => setToast((t) => ({ ...t, visible: false }))

  return { toast, showToast, hideToast }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  text: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
})
