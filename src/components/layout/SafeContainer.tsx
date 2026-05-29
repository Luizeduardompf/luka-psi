import React, { memo } from 'react'
import { View, ViewProps, StatusBar } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { theme } from '@/constants/theme'

interface SafeContainerProps extends ViewProps {
  backgroundColor?: string
  edges?: ('top' | 'bottom' | 'left' | 'right')[]
}

export const SafeContainer = memo(function SafeContainer({
  backgroundColor = theme.colors.background,
  edges = ['top', 'bottom', 'left', 'right'],
  style,
  children,
  ...rest
}: SafeContainerProps) {
  const insets = useSafeAreaInsets()

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <View
        style={[
          {
            flex: 1,
            backgroundColor,
            paddingTop: edges.includes('top') ? insets.top : 0,
            paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
            paddingLeft: edges.includes('left') ? insets.left : 0,
            paddingRight: edges.includes('right') ? insets.right : 0,
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    </>
  )
})
