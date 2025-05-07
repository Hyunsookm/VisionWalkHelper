import { ExpoRoot } from 'expo-router';

export default function App() {
  const ctx = require.context('./app');  // 자동 라우팅
  return <ExpoRoot context={ctx} />;
}
