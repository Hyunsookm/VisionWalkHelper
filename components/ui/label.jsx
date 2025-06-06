import { Text } from 'react-native'

export function Label({ children, style = {} }) {
  return (
    <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4, ...style }}>
      {children}
    </Text>
  )
}