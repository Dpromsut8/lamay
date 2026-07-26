import React from 'react';
export default function FarmMap() {
  return (
    <div className="glass-card">
      <h3 style={{ color: '#34d399', fontSize: '15px', marginTop: 0 }}>🗺️ ผังแปลงเกษตร (22 ไร่)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
        <div style={{ background: '#065f46', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px' }}>💧</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>สระน้ำหลัก (7 ไร่)</div>
        </div>
        <div style={{ background: '#1e3a8a', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px' }}>🏡</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>โคก หนอง นา (15 ไร่)</div>
        </div>
      </div>
    </div>
  );
}
