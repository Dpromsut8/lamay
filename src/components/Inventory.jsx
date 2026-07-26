import React from 'react';
export default function Inventory() {
  const items = ['ชะอม (ยอดอ่อน)', 'ไข่ไก่สดออร์แกนิก', 'เห็ดนางฟ้าภูฐาน', 'ปุ๋ยหมักชีวภาพ'];
  return (
    <div className="glass-card">
      <h3 style={{ color: '#34d399', fontSize: '15px', marginTop: 0 }}>📦 รายการสินค้าในระบบ</h3>
      <ul style={{ paddingLeft: '18px', margin: '8px 0', color: '#cbd5e1', fontSize: '13px' }}>
        {items.map((item, idx) => (
          <li key={idx} style={{ margin: '6px 0' }}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
