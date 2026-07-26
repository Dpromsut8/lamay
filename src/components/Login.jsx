import React, { useState } from 'react';
import './Login.css';
import { authenticateBiometric } from '../utils/nativeBiometrics';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('••••••••');

  const handleLogin = (e) => {
    e.preventDefault();
    onLoginSuccess({ name: username, role: 'Super Admin' });
  };

  const handleBiometricClick = async () => {
    const success = await authenticateBiometric();
    if (success) {
      onLoginSuccess({ name: 'Biometric User', role: 'Admin' });
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🌱</div>
        <h2 style={{ color: '#34d399', margin: '0 0 8px 0', fontSize: '22px' }}>LAMAY SMART FARM</h2>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>ระบบบริหารจัดการฟาร์มอัจฉริยะครบวงจร</p>
        
        <form onSubmit={handleLogin}>
          <input type="text" className="login-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ชื่อผู้ใช้งาน" />
          <input type="password" className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" />
          <button type="submit" className="btn-primary-custom" style={{ width: '100%', marginTop: '12px', padding: '12px' }}>เข้าสู่ระบบ</button>
        </form>

        <button onClick={handleBiometricClick} style={{ background: 'transparent', border: '1px dashed #34d399', color: '#34d399', width: '100%', marginTop: '12px', padding: '10px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px' }}>
          🔒 สแกนลายนิ้วมือ / Face ID
        </button>
      </div>
    </div>
  );
}
