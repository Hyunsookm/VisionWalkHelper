import { TextInput } from 'react-native'

export function Input({ style = {}, ...props }) {
  return (
    <TextInput
      style={{
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        ...style,
      }}
      {...props}
    />
  )
}