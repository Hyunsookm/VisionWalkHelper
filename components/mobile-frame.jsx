import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function MobileFrame({ title, showBackButton, onBackClick, children }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        {showBackButton && (
          <TouchableOpacity onPress={onBackClick}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
        )}
        {/* ✅ 제목은 반드시 Text 컴포넌트 안에 */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>{title}</Text>
      </View>

      {/* ✅ children은 View로 감싸기 */}
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </SafeAreaView>
  )
}