import React, { useState } from 'react';

export default function FarmMap() {
  // สถานะเก็บข้อมูลแต่ละแปลงในฟาร์ม
  const [plots, setPlots] = useState([
    { id: 1, name: 'สระน้ำหลัก', size: '7 ไร่', type: 'water', status: 'ระดับน้ำปกติ (85%)', color: '#065f46', icon: '💧' },
    { id: 2, name: 'โคก หนอง นา', size: '15 ไร่', type: 'land', status: 'กำลังเติบโต (ข้าว/ไม้ผล)', color: '#1e3a8a', icon: '🏡' }
  ]);

  // สถานะสำหรับแปลงที่ถูกเลือกเพื่อดูรายละเอียด
  const [selectedPlot, setSelectedPlot] = useState(null);

  // สถานะสำหรับ Modal เพิ่มแปลงใหม่
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [status, setStatus] = useState('');
  const [icon, setIcon] = useState('🌾');

  // ฟังก์ชันเพิ่มแปลงใหม่
  const handleAddPlot = (e) => {
    e.preventDefault();
    if (!name || !size) {
      alert('กรุณากรอกชื่อแปลงและขนาดพื้นที่ให้ครบถ้วน');
      return;
    }

    const newPlot = {
      id: Date.now(),
      name,
      size,
      status: status || 'ปกติ',
      color: '#0f766e',
      icon
    };

    setPlots([...plots, newPlot]);
    setName('');
    setSize('');
    setStatus('');
    setShowModal(false);
  };

  return (
    <div className="glass-card" style={{ padding: '16px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ color: '#34d399', fontSize: '15px', margin: 0 }}>🗺️ ผังแปลงเกษตร (รวม {plots.length} โซน)</h3>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#34d399', color: '#0f172a', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          + เพิ่มแปลง
        </button>
      </div>

      {/* Grid แสดงผังแปลง */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
        {plots.map((plot) => (
          <div 
            key={plot.id} 
            onClick={() => setSelectedPlot(plot)}
            style={{ 
              background: plot.color, 
              padding: '12px', 
              borderRadius: '10px', 
              textAlign: 'center', 
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'transform 0.2s'
            }}
          >
            <div style={{ fontSize: '18px' }}>{plot.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{plot.name}</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{plot.size}</div>
          </div>
        ))}
      </div>

      {/* Modal แสดงรายละเอียดเมื่อคลิกที่แปลง */}
      {selectedPlot && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', width: '90%', maxWidth: '320px', border: '1px solid #334155' }}>
            <h4 style={{ color: '#34d399', margin: '0 0 8px 0', fontSize: '14px' }}>
              {selectedPlot.icon} ข้อมูลแปลง: {selectedPlot.name}
            </h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0' }}>ขนาดพื้นที่: <b style={{ color: '#fff' }}>{selectedPlot.size}</b></p>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 12px 0' }}>สถานะปัจจุบัน: <b style={{ color: '#34d399' }}>{selectedPlot.status}</b></p>
            <button 
              onClick={() => setSelectedPlot(null)} 
              style={{ width: '100%', background: '#475569', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* Modal สำหรับเพิ่มแปลงใหม่ */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', width: '90%', maxWidth: '320px', border: '1px solid #334155' }}>
            <h4 style={{ color: '#34d399', margin: '0 0 10px 0', fontSize: '14px' }}>เพิ่มโซน/แปลงเกษตรใหม่</h4>
            <form onSubmit={handleAddPlot} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="ชื่อแปลง (เช่น แปลงผักสวนครัว)" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                style={{ padding: '6px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', fontSize: '12px' }}
              />
              <input 
                type="text" 
                placeholder="ขนาดพื้นที่ (เช่น 2 ไร่, 50 ตร.ว.)" 
                value={size} 
                onChange={(e) => setSize(e.target.value)}
                style={{ padding: '6px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', fontSize: '12px' }}
              />
              <input 
                type="text" 
                placeholder="สถานะเบื้องต้น (เช่น กำลังเตรียมดิน)" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                style={{ padding: '6px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', fontSize: '12px' }}
              />
              <select 
                value={icon} 
                onChange={(e) => setIcon(e.target.value)}
                style={{ padding: '6px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', fontSize: '12px' }}
              >
                <option value="🌾">🌾 แปลงนา/พืชไร่</option>
                <option value="💧">💧 สระน้ำ/แหล่งน้ำ</option>
                <option value="🏡">🏡 โคกหนองนา/ที่อยู่อาศัย</option>
                <option value="🌳">🌳 สวนผลไม้/ป่าไม้</option>
              </select>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <button type="submit" style={{ flex: 1, background: '#34d399', color: '#0f172a', border: 'none', padding: '6px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>บันทึก</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#475569', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
