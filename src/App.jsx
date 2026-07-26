import React, { useState } from 'react';
import Login from './components/Login';
import FarmMap from './components/FarmMap';
import Inventory from './components/Inventory';
import Accounting from './components/Accounting';
import AIDoctor from './components/AIDoctor';
import './components/Dashboard.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('ชะอม');
  const [aiBoxData, setAiBoxData] = useState({
    visible: true,
    title: '💡 ข้อมูล: ชะอม',
    content: 'ชะอมเป็นพืชผักสวนครัวที่ปลูกง่าย แตกยอดไว ชอบแดดจัดและน้ำปานกลาง แนะนำให้รดน้ำสม่ำเสมอ ตัดแต่งกิ่งบ่อยๆ เพื่อให้แตกยอดอ่อนสำหรับเก็บเกี่ยว'
  });

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="app-container">
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(15,23,42,0.9)', borderBottom: '1px solid #334155' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#34d399' }}>LAMAY - ละม้ายฟาร์ม & โคกหนองนา</h2>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>สวัสดี, ผู้ดูแลระบบ ({user.name})</span>
        </div>
        <button onClick={() => setUser(null)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}>ออกจากระบบ</button>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '12px' }}>
        
        {/* การ์ดรูปภาพฟาร์ม พร้อมกล่อง AI ลอยอยู่ด้านบน (จัดระเบียบให้เหลือบล็อกเดียวแสดงผลสวยงาม) */}
        <div className="glass-card" style={{ padding: '10px', textAlign: 'center' }}>
          <div className="farm-banner-container" style={{ position: 'relative' }}>
            <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80" alt="ละม้ายฟาร์ม" className="farm-banner-img" />
            
            {/* กล่อง AI ที่ซ้อนทับบนรูปภาพ */}
            {aiBoxData.visible && (
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                right: '10px',
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #34d399',
                borderRadius: '12px',
                padding: '12px',
                zIndex: 10,
                textAlign: 'left',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '13px' }}>{aiBoxData.title}</span>
                  <button onClick={() => setAiBoxData({ ...aiBoxData, visible: false })} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '11px', lineHeight: '1.4', marginBottom: '8px' }}>
                  <div style={{ color: '#60a5fa', fontWeight: 'bold', marginBottom: '4px' }}>✨ ข้อมูลภาพรวมโดย AI</div>
                  {aiBoxData.content}
                </div>
                <a href={`https://www.google.com/search?q=${encodeURIComponent(`การดูแลรักษา วิธีนำไปใช้งาน ${searchQuery}`)}`} target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none', padding: '6px', background: '#1e293b', color: '#60a5fa', border: '1px solid #475569', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', textAlign: 'center' }}>
                  🔍 ค้นหาบน Google เพิ่มเติม
                </a>
              </div>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>🌱 ละม้ายฟาร์ม - โคก หนอง นา, สระน้ำ, โรงเรือน และแปลงเกษตรครบวงจร</div>
        </div>

        {/* Search Bar */}
        <div className="glass-card" style={{ padding: '10px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>🔍 ค้นหารายการสินค้า/วัตถุดิบ</div>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
        </div>

        {/* Sub-Components */}
        <FarmMap />
        <Inventory />
        <Accounting />
        <AIDoctor />

      </div>
    </div>
  );
}
