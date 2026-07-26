import React from 'react';
export default function Accounting() {
  return (
    <div className="glass-card">
      <h3 style={{ color: '#34d399', fontSize: '15px', marginTop: 0 }}>💰 บัญชีรับ-จ่าย ฟาร์ม</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', background: 'rgba(15,23,42,0.5)', padding: '10px', borderRadius: '8px' }}>
        <span>รายรับเดือนนี้: <b style={{ color: '#34d399' }}>฿14,500</b></span>
        <span>รายจ่าย: <b style={{ color: '#f87171' }}>฿4,200</b></span>
      </div>
    </div>
  );
}
