import React, { useState } from 'react';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phoneNumber || !password) {
      alert('전화번호와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password }),
      });

      const data = await response.json();

      if (data.success) {
        alert('로그인 성공!');
        // 예: 토큰 저장, 페이지 이동 등
        // localStorage.setItem('token', data.token);
        // navigate('/home');
      } else {
        alert('로그인 실패: ' + data.message);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>전화번호</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            required
          />
        </div>

        <div>
          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">로그인</button>
      </form>
    </div>
  );
};

export default Login;