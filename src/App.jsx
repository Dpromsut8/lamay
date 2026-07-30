import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import FarmMap from './components/FarmMap';
import Inventory from './components/Inventory';
import Accounting from './components/Accounting';
import AIDoctor from './components/AIDoctor';
import { takeSnapshot } from './utils/nativeCamera';
import './Style.css';

// ฐานข้อมูลราคากลางและอีโมจิอัตโนมัติ (รวมครบทุกรายการจากเวอร์ชันเดิม)
const marketPricesDB = {
    "มะกรูด": { marketPrice: 20, emoji: "🌿", unit: "ลูก" },
    "มะนาว": { marketPrice: 4, emoji: "🍋", unit: "ลูก" },
    "มะละกอ": { marketPrice: 25, emoji: "🥭", unit: "ลูก" },
    "ทุเรียน": { marketPrice: 180, emoji: "🌳", unit: "กก." },
    "เห็ด": { marketPrice: 15, emoji: "🍄", unit: "กก." },
    "ชะอม": { marketPrice: 20, emoji: "🌿", unit: "กำ" },
    "ไก่": { marketPrice: 240, emoji: "🐔", unit: "ตัว" },
    "ปลา": { marketPrice: 8, emoji: "🐟", unit: "ตัว" },
    "ไข่": { marketPrice: 130, emoji: "🥚", unit: "แผง" },
    "อาหาร": { marketPrice: 460, emoji: "🌾", unit: "กระสอบ" },
    "น้ำมัน": { marketPrice: 33, emoji: "🛢️", unit: "ถุง" },
    "สายไฟ": { marketPrice: 680, emoji: "⚡", unit: "ม้วน" },
    "ปั๊มน้ำ": { marketPrice: 2590, emoji: "⚙️", unit: "ตัว" }
};

const initialFarmData = {
    "spices-group": [
        { name: "🌿 ชะอม", marketPrice: 20, unit: "กำ" },
        { name: "🌿 มะกรูด", marketPrice: 20, unit: "ลูก" }
    ],
    "pets-group": [
        { name: "🐔 ไก่ไข่", marketPrice: 240, unit: "ตัว" }
    ]
};

export default function App() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('ชะอม');
  const [farmBanner, setFarmBanner] = useState("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80");
  
  // State ข้อมูลฟาร์มและบัญชี ซิงค์กับ LocalStorage
  const [farmData, setFarmData] = useState(() => {
    const saved = localStorage.getItem('lamay_farmData');
    return saved ? JSON.parse(saved) : initialFarmData;
  });

  const [expenseHistory, setExpenseHistory] = useState(() => {
    const saved = localStorage.getItem('lamay_expenseHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // State กล่อง AI แนะนำข้อมูลพืช (อัปเดตอัตโนมัติตามคำค้นหา)
  const [aiBoxData, setAiBoxData] = useState({
    visible: true,
    title: '💡 ข้อมูล: ชะอม',
    content: 'ชะอมเป็นพืชผักสวนครัวที่ปลูกง่าย แตกยอดไว ชอบแดดจัดและน้ำปานกลาง แนะนำให้รดน้ำสม่ำเสมอ ตัดแต่งกิ่งบ่อยๆ เพื่อให้แตกยอดอ่อนสำหรับเก็บเกี่ยว'
  });

  // บันทึกข้อมูลลง localStorage อัตโนมัติเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem('lamay_farmData', JSON.stringify(farmData));
  }, [farmData]);

  useEffect(() => {
    localStorage.setItem('lamay_expenseHistory', JSON.stringify(expenseHistory));
  }, [expenseHistory]);

  // ระบบประมวลผล AI อัจฉริยะ ค้นหาจากฐานข้อมูลราคากลางตามพิมพ์คำค้น
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) return;

    let foundKey = Object.keys(marketPricesDB).find(k => query.includes(k));
    if (foundKey) {
        setAiBoxData({
            visible: true,
            title: `💡 ข้อมูล: ${foundKey}`,
            content: `ราคากลางอ้างอิง: ${marketPricesDB[foundKey].marketPrice} บาท/${marketPricesDB[foundKey].unit} เหมาะสำหรับการวางแผนปลูกและบริหารจัดการภายในละม้ายฟาร์ม`
        });
    } else {
        setAiBoxData({
            visible: true,
            title: `💡 ข้อมูล: ${query}`,
            content: `คำแนะนำทั่วไปสำหรับ "${query}": ตรวจสอบความชื้น ดิน และระบบน้ำให้เหมาะสม เพื่อผลผลิตที่ดีเยี่ยมในโคกหนองนา`
        });
    }
  }, [searchQuery]);

  // ระบบถ่ายรูปอัปเดตฟาร์มรองรับทุกแพลตฟอร์ม (Capacitor & Web)
  const handleCaptureBanner = async () => {
    try {
      const photoUrl = await takeSnapshot();
      if (photoUrl) {
        setFarmBanner(photoUrl);
        alert("✨ อัปเดตรูปภาพบรรยากาศฟาร์มสำเร็จ!");
      }
    } catch (error) {
      console.error("Camera error:", error);
      alert("❌ ไม่สามารถเปิดใช้งานกล้องได้");
    }
  };

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="app-container page">
      {/* Header bar */}
      <div className="game-header">
        <div>
          <h1>LAMAY - ละม้ายฟาร์ม</h1>
          <p>ผู้ดูแลระบบ: {user?.name || 'Admin'}</p>
        </div>
        <button 
          className="danger-btn" 
          onClick={() => setUser(null)} 
          style={{ width: 'auto', padding: '6px 12px', fontSize: '12px', margin: 0 }}
        >
          ออกจากระบบ
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Farm Banner & AI Box */}
        <div className="glass-card" style={{ padding: '10px', textAlign: 'center', marginBottom: '15px' }}>
          <div className="farm-banner-container">
            <img src={farmBanner} alt="ละม้ายฟาร์ม" className="farm-banner-img" />
            
            <button 
              type="button" 
              onClick={handleCaptureBanner} 
              className="btn-success" 
              style={{ position: 'absolute', bottom: '10px', right: '10px', width: 'auto', padding: '8px 12px', fontSize: '11px', margin: 0, zIndex: 15 }}
            >
              📷 ถ่ายรูปอัปเดตฟาร์ม
            </button>

            {aiBoxData.visible && (
              <div className="knowledge-frame" style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', margin: 0, zIndex: 10, textAlign: 'left' }}>
                <div className="knowledge-header">
                  <h3>{aiBoxData.title}</h3>
                  <button className="close-icon-btn" onClick={() => setAiBoxData({ ...aiBoxData, visible: false })}>✕</button>
                </div>
                <div className="knowledge-content">
                  <div style={{ color: '#60a5fa', fontWeight: 'bold', marginBottom: '4px' }}>✨ ข้อมูลภาพรวมโดย AI</div>
                  {aiBoxData.content}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="glass-card" style={{ padding: '12px', marginBottom: '15px' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#94a3b8' }}>🔍 ค้นหารายการสินค้า/วัตถุดิบ (เชื่อมโยงระบบ AI อัตโนมัติ)</p>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="พิมพ์ชื่อพืชผัก หรืออุปกรณ์ฟาร์ม..." 
          />
        </div>

        {/* Sub-Components (ส่ง Props ครบถ้วนเพื่อให้ทำงานร่วมกันได้อย่างไร้รอยต่อ) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <FarmMap />
          <Inventory farmData={farmData} setFarmData={setFarmData} searchQuery={searchQuery} />
          <Accounting expenseHistory={expenseHistory} setExpenseHistory={setExpenseHistory} farmData={farmData} />
          <AIDoctor searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  );
}
