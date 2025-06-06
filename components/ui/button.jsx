import { Text, TouchableOpacity } from 'react-native'

export function Button({ onPress, children, style = {} }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#1e90ff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        ...style,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: 'bold' }}>{children}</Text>
    </TouchableOpacity>
  )
}