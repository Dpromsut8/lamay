import React, { useState, useEffect } from 'react';

export default function Inventory() {
  const [farmItemsDB, setFarmItemsDB] = useState({});
  const [groupTitles, setGroupTitles] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemMarketPrice, setNewItemMarketPrice] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('ตัว');
  const [groupSelect, setGroupSelect] = useState('pets-group');
  const [newGroupName, setNewGroupName] = useState('');

  // ควบคุมการเปิด-ปิดหน้าต่างเลือกกลุ่มสินค้าแบบ Custom บนมือถือ
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedDB = JSON.parse(localStorage.getItem('farmItemsDB')) || {
      "pets-group": [{name: "🐔 ไก่ไข่", marketPrice: 240, unit: "ตัว"}, {name: "🐟 ปลานิล", marketPrice: 8, unit: "ตัว"}],
      "plants-group": [{name: "🌿 มะกรูด", marketPrice: 20, unit: "ลูก"}, {name: "🍄 เห็ดนางฟ้าภูฐาน", marketPrice: 15, unit: "กก."}, {name: "🌿 ชะอม", marketPrice: 20, unit: "กำ"}],
      "consumable-group": [{name: "🛢️ ปั๊มน้ำอินเวอร์เตอร์ 2 แรงม้า", marketPrice: 2590, unit: "ตัว"}]
    };

    const savedTitles = JSON.parse(localStorage.getItem('groupTitles')) || {
      "pets-group": "สัตว์เลี้ยง",
      "plants-group": "พืชสวน",
      "consumable-group": "วัสดุสิ้นเปลือง"
    };

    setFarmItemsDB(savedDB);
    setGroupTitles(savedTitles);
  };

  const addNewButton = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return alert("กรุณากรอกชื่อรายการ");

    let targetGroup = groupSelect;
    let updatedTitles = { ...groupTitles };
    let updatedDB = { ...farmItemsDB };

    if (targetGroup === "new") {
      if (!newGroupName.trim()) return alert("กรุณาตั้งชื่อกลุ่มใหม่");
      targetGroup = "group-" + Date.now();
      updatedTitles[targetGroup] = newGroupName.trim();
      localStorage.setItem('groupTitles', JSON.stringify(updatedTitles));
      updatedDB[targetGroup] = [];
    }

    if (!updatedDB[targetGroup]) updatedDB[targetGroup] = [];
    
    updatedDB[targetGroup].push({
      name: newItemName.trim(),
      marketPrice: parseFloat(newItemMarketPrice) || 0,
      unit: newItemUnit
    });

    localStorage.setItem('farmItemsDB', JSON.stringify(updatedDB));
    setFarmItemsDB(updatedDB);
    setGroupTitles(updatedTitles);

    setNewItemName('');
    setNewItemMarketPrice('');
    setNewGroupName('');
    alert("เพิ่มสินค้าใหม่สำเร็จ!");
  };

  return (
    <div style={{ padding: '12px', color: '#f8fafc' }}>
      {/* 1. ส่วนเพิ่มรายการสินค้าใหม่ */}
      <div className="glass-card" style={{ background: '#0f172a', padding: '14px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '16px' }}>
        <h3 style={{ color: '#34d399', fontSize: '15px', marginTop: 0 }}>➕ เพิ่มรายการสินค้าใหม่</h3>
        <form onSubmit={addNewButton}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>ชื่อสินค้าใหม่</label>
            <input 
              type="text" 
              value={newItemName} 
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="ระบุชื่อสินค้า..." 
              style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', marginTop: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>ราคากลาง (บาท)</label>
            <input 
              type="number" 
              value={newItemMarketPrice} 
              onChange={(e) => setNewItemMarketPrice(e.target.value)}
              style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', marginTop: '4px' }}
            />
          </div>

          {/* ปุ่มกดเลือกกลุ่มสินค้า (Custom Modal สำหรับมือถือ) */}
          <div style={{ marginBottom: '10px', position: 'relative' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>เลือกกลุ่มสินค้า</label>
            <div 
              onClick={() => setIsGroupModalOpen(true)}
              style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', marginTop: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}
            >
              <span>{groupSelect === 'new' ? '-- สร้างกลุ่มใหม่ --' : `กลุ่ม: ${groupTitles[groupSelect] || groupSelect}`}</span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>▼</span>
            </div>

            {/* กล่องเลือกกลุ่มสินค้า (Modal Popup) */}
            {isGroupModalOpen && (
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}>
                <div style={{
                  background: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '12px',
                  width: '100%',
                  maxWidth: '320px',
                  padding: '16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px', fontSize: '14px' }}>📁 เลือกกลุ่มสินค้า</div>
                  
                  {Object.keys(groupTitles).map((gKey) => (
                    <div 
                      key={gKey} 
                      onClick={() => {
                        setGroupSelect(gKey);
                        setIsGroupModalOpen(false);
                      }}
                      style={{ padding: '10px', background: groupSelect === gKey ? '#334155' : 'transparent', borderRadius: '6px', marginBottom: '6px', cursor: 'pointer', color: '#fff', fontSize: '13px' }}
                    >
                      กลุ่ม: {groupTitles[gKey]}
                    </div>
                  ))}

                  <div 
                    onClick={() => {
                      setGroupSelect('new');
                      setIsGroupModalOpen(false);
                    }}
                    style={{ padding: '10px', background: groupSelect === 'new' ? '#334155' : 'transparent', borderRadius: '6px', marginBottom: '12px', cursor: 'pointer', color: '#34d399', fontSize: '13px', fontWeight: 'bold' }}
                  >
                    -- สร้างกลุ่มใหม่ --
                  </div>

                  <button 
                    type="button" 
                    onClick={() => setIsGroupModalOpen(false)}
                    style={{ width: '100%', padding: '8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    ปิด
                  </button>
                </div>
              </div>
            )}
          </div>

          {groupSelect === 'new' && (
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>ชื่อกลุ่มใหม่</label>
              <input 
                type="text" 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="ระบุชื่อกลุ่มสินค้าใหม่..." 
                style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', marginTop: '4px' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>หน่วยสินค้า</label>
            <select 
              value={newItemUnit} 
              onChange={(e) => setNewItemUnit(e.target.value)}
              style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', marginTop: '4px' }}
            >
              <option value="ตัว">ตัว</option>
              <option value="กก.">กก.</option>
              <option value="ลูก">ลูก</option>
              <option value="กำ">กำ</option>
              <option value="แผง">แผง</option>
              <option value="กระสอบ">กระสอบ</option>
            </select>
          </div>

          <button type="submit" style={{ width: '100%', padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            เพิ่มสินค้าใหม่
          </button>
        </form>
      </div>

      {/* 2. ส่วนรายการสินค้าในระบบ */}
      <div className="glass-card" style={{ background: '#0f172a', padding: '14px', borderRadius: '12px', border: '1px solid #334155' }}>
        <h3 style={{ color: '#34d399', fontSize: '15px', marginTop: 0, marginBottom: '12px' }}>📦 รายการสินค้าในระบบ</h3>
        <input 
          type="text" 
          placeholder="พิมพ์ชื่อเพื่อค้นหา..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '8px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', marginBottom: '12px' }}
        />

        {Object.keys(farmItemsDB).map((groupId) => {
          const title = groupTitles[groupId] || groupId;
          const items = farmItemsDB[groupId] || [];
          const filtered = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

          if (filtered.length === 0 && searchQuery) return null;

          return (
            <div key={groupId} style={{ marginTop: '10px', background: '#1e293b', borderRadius: '8px', padding: '8px', border: '1px solid #475569' }}>
              <div style={{ fontWeight: 'bold', color: '#38bdf8', fontSize: '13px', marginBottom: '6px' }}>📁 {title}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {filtered.map((item, idx) => (
                  <div key={idx} style={{ flex: '1 1 calc(50% - 4px)', background: '#0f172a', padding: '6px', borderRadius: '6px', border: '1px solid #334155', fontSize: '12px' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '10px' }}>{item.marketPrice} ฿ / {item.unit}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
