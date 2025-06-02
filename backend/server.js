// server.js
const cors = require('cors');
const express = require('express');
const admin = require('firebase-admin');
const axios = require('axios');

const app = express();
app.use(express.json());

const serviceAccount = require('.//firebase/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// POST /kakao-login
app.post('/kakao-login', async (req, res) => {
  const { accessToken } = req.body;
  try {
    // Kakao 사용자 정보 조회
    const kakaoRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const kakaoUser = kakaoRes.data;
    const kakaoUid = `kakao_${kakaoUser.id}`;

    // Firebase 커스텀 토큰 생성
    const customToken = await admin.auth().createCustomToken(kakaoUid);

    res.send({ token: customToken });
  } catch (error) {
    console.error('Kakao 로그인 실패:', error);
    res.status(400).send('인증 실패');
  }
});
app.use(cors());

app.listen(3000, () => {
  console.log('🔥 서버 실행 중: http://localhost:3000');
});
