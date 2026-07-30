import React, { useState, useEffect } from 'react';

export default function Inventory() {
  // --- States ---
  const [farmItemsDB, setFarmItemsDB] = useState({});
  const [groupTitles, setGroupTitles] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // ฟอร์มเพิ่มสินค้า
  const [newItemName, setNewItemName] = useState('');
  const [newItemMarketPrice, setNewItemMarketPrice] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('ตัว');
  const [groupSelect, setGroupSelect] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  // โมดัลจัดการกลุ่มสินค้า / แก้ไขสินค้า
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isManageGroupOpen, setIsManageGroupOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // { groupKey, index, name, marketPrice, unit }

  // --- โหลดข้อมูลเริ่มต้น ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const savedDB = JSON.parse(localStorage.getItem('farmItemsDB'));
      const savedTitles = JSON.parse(localStorage.getItem('groupTitles'));

      if (savedDB && savedTitles && typeof savedDB === 'object' && typeof savedTitles === 'object' && Object.keys(savedTitles).length > 0) {
        setFarmItemsDB(savedDB);
        setGroupTitles(savedTitles);
        const firstKey = Object.keys(savedTitles)[0] || '';
        setGroupSelect(firstKey);
      } else {
        throw new Error();
      }
    } catch {
      // ค่าเริ่มต้นถ้า LocalStorage ว่างหรือเสียหาย
      const defaultDB = {
        "pets-group": [
          { name: "🐔 ไก่ไข่", marketPrice: 240, unit: "ตัว" },
          { name: "🐟 ปลานิล", marketPrice: 8, unit: "ตัว" }
        ],
        "plants-group": [
          { name: "🌿 มะกรูด", marketPrice: 20, unit: "ลูก" },
          { name: "🍄 เห็ดนางฟ้าภูฐาน", marketPrice: 15, unit: "กก." }
        ],
        "consumable-group": [
          { name: "🛢️ ปั๊มน้ำอินเวอร์เตอร์ 2 แรงม้า", marketPrice: 2590, unit: "ตัว" }
        ]
      };
      const defaultTitles = {
        "pets-group": "สัตว์เลี้ยง",
        "plants-group": "พืชสวน",
        "consumable-group": "วัสดุสิ้นเปลือง"
      };
      setFarmItemsDB(defaultDB);
      setGroupTitles(defaultTitles);
      setGroupSelect("pets-group");
      localStorage.setItem('farmItemsDB', JSON.stringify(defaultDB));
      localStorage.setItem('groupTitles', JSON.stringify(defaultTitles));
    }
  };

  // --- บันทึกข้อมูลอัตโนมัติ ---
  const saveDataToStorage = (newDB, newTitles) => {
    try {
      localStorage.setItem('farmItemsDB', JSON.stringify(newDB));
      localStorage.setItem('groupTitles', JSON.stringify(newTitles));
      setFarmItemsDB({ ...newDB });
      setGroupTitles({ ...newTitles });
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลลงหน่วยความจำ");
    }
  };

  // --- ฟังก์ชันจัดการสินค้า ---
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return alert("กรุณากรอกชื่อสินค้า");

    let targetGroup = groupSelect;
    let updatedTitles = { ...groupTitles };
    let updatedDB = { ...farmItemsDB };

    // ถ้าเลือกสร้างกลุ่มใหม่
    if (targetGroup === "new-group-action") {
      if (!newGroupName.trim()) return alert("กรุณาตั้งชื่อกลุ่มสินค้าใหม่");
      
      // ตรวจสอบชื่อกลุ่มซ้ำ
      const isDuplicateGroup = Object.values(updatedTitles).some(
        title => title.trim().toLowerCase() === newGroupName.trim().toLowerCase()
      );
      if (isDuplicateGroup) return alert("มีชื่อกลุ่มสินค้านี้อยู่แล้วในระบบ");

      targetGroup = "group-" + Date.now();
      updatedTitles[targetGroup] = newGroupName.trim();
      updatedDB[targetGroup] = [];
      setNewGroupName('');
    }

    if (!updatedDB[targetGroup]) updatedDB[targetGroup] = [];

    // ตรวจสอบชื่อสินค้าซ้ำในกลุ่มเดียวกัน
    const isDuplicateItem = updatedDB[targetGroup].some(
      item => item.name.trim().toLowerCase() === newItemName.trim().toLowerCase()
    );
    if (isDuplicateItem) return alert("มีสินค้านี้อยู่แล้วในกลุ่มดังกล่าว");

    // เพิ่มสินค้าใหม่และจัดเรียง A-Z
    updatedDB[targetGroup].push({
      name: newItemName.trim(),
      marketPrice: parseFloat(newItemMarketPrice) || 0,
      unit: newItemUnit
    });
    updatedDB[targetGroup].sort((a, b) => a.name.localeCompare(b.name, 'th'));

    saveDataToStorage(updatedDB, updatedTitles);

    // รีเซ็ตฟอร์ม
    setNewItemName('');
    setNewItemMarketPrice('');
    setGroupSelect(targetGroup);
    alert("✨ เพิ่มสินค้าสำเร็จ!");
  };

  const handleDeleteItem = (groupKey, index) => {
    if (!window.confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) return;
    const updatedDB = { ...farmItemsDB };
    updatedDB[groupKey].splice(index, 1);
    saveDataToStorage(updatedDB, groupTitles);
  };

  const handleUpdateItem = (e) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) return alert("กรุณากรอกชื่อสินค้า");

    const { groupKey, index, name, marketPrice, unit } = editingItem;
    const updatedDB = { ...farmItemsDB };

    updatedDB[groupKey][index] = {
      name: name.trim(),
      marketPrice: parseFloat(marketPrice) || 0,
      unit: unit
    };
    updatedDB[groupKey].sort((a, b) => a.name.localeCompare(b.name, 'th'));

    saveDataToStorage(updatedDB, groupTitles);
    setEditingItem(null);
    alert("💾 บันทึกการแก้ไขสำเร็จ!");
  };

  // --- ฟังก์ชันจัดการกลุ่มสินค้า ---
  const handleRenameGroup = (groupKey) => {
    const currentTitle = groupTitles[groupKey];
    const newTitle = prompt("เปลี่ยนชื่อกลุ่มสินค้า:", currentTitle);
    if (!newTitle || !newTitle.trim() || newTitle.trim() === currentTitle) return;

    const updatedTitles = { ...groupTitles };
    updatedTitles[groupKey] = newTitle.trim();
    saveDataToStorage(farmItemsDB, updatedTitles);
  };

  const handleDeleteGroup = (groupKey) => {
    const itemsCount = farmItemsDB[groupKey]?.length || 0;
    if (itemsCount > 0) {
      return alert("ไม่สามารถลบกลุ่มนี้ได้ เนื่องจากยังมีสินค้าอยู่ภายในกลุ่ม กรุณาลบสินค้าออกให้หมดก่อน");
    }
    if (!window.confirm(`คุณต้องการลบกลุ่ม "${groupTitles[groupKey]}" ใช่หรือไม่?`)) return;

    const updatedDB = { ...farmItemsDB };
    const updatedTitles = { ...groupTitles };

    delete updatedDB[groupKey];
    delete updatedTitles[groupKey];

    saveDataToStorage(updatedDB, updatedTitles);
    const remainingKeys = Object.keys(updatedTitles);
    if (remainingKeys.length > 0) {
      setGroupSelect(remainingKeys[0]);
    } else {
      setGroupSelect('');
    }
  };

  return (
    <div className="glass-card" style={{ padding: '16px', borderRadius: '12px', maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#34d399', margin: '0 0 4px 0', fontSize: '18px' }}>📦 ระบบจัดการคลังสินค้า</h2>
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>จัดการราคาและรายการสินค้าฟาร์มของคุณอย่างมีประสิทธิภาพ</p>
      </div>

      {/* ────────────────────────── */}
      {/* 1. ส่วนเพิ่มสินค้าใหม่ */}
      {/* ────────────────────────── */}
      <div style={{ background: '#0f172a', padding: '16px', borderRadius: '14px', border: '1px solid #334155', marginBottom: '16px' }}>
        <h3 style={{ color: '#38bdf8', fontSize: '14px', marginTop: 0, marginBottom: '12px' }}>
          ➕ เพิ่มสินค้าใหม่
        </h3>
        
        <form onSubmit={handleAddItem}>
          {/* ชื่อสินค้า */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>ชื่อสินค้า</label>
            <input 
              type="text" 
              value={newItemName} 
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="ระบุชื่อสินค้า..." 
              style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', outline: 'none', fontSize: '12px' }}
            />
          </div>

          {/* ราคากลาง */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>ราคากลาง (บาท)</label>
            <input 
              type="number" 
              value={newItemMarketPrice} 
              onChange={(e) => setNewItemMarketPrice(e.target.value)}
              placeholder="0"
              style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', outline: 'none', fontSize: '12px' }}
            />
          </div>

          {/* หน่วยสินค้า */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>หน่วย</label>
            <select 
              value={newItemUnit} 
              onChange={(e) => setNewItemUnit(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', outline: 'none', fontSize: '12px' }}
            >
              <option value="ตัว">ตัว</option>
              <option value="กก.">กก.</option>
              <option value="ลูก">ลูก</option>
              <option value="กำ">กำ</option>
              <option value="แผง">แผง</option>
              <option value="กระสอบ">กระสอบ</option>
              <option value="ถุง">ถุง</option>
              <option value="ขวด">ขวด</option>
            </select>
          </div>

          {/* กลุ่มสินค้า (กดเปิด Modal เลือกกลุ่ม) */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '11px', color: '#94a3b8' }}>กลุ่มสินค้า</label>
              <span 
                onClick={() => setIsManageGroupOpen(true)}
                style={{ fontSize: '11px', color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ⚙️ จัดการกลุ่ม
              </span>
            </div>
            
            <div 
              onClick={() => setIsGroupModalOpen(true)}
              style={{ 
                width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #475569', 
                borderRadius: '8px', color: '#fff', cursor: 'pointer', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box', fontSize: '12px' 
              }}
            >
              <span>{groupSelect === 'new-group-action' ? '➕ -- สร้างกลุ่มใหม่ --' : `📁 ${groupTitles[groupSelect] || 'เลือกกลุ่มสินค้า'}`}</span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>▼ เลือก</span>
            </div>
          </div>

          {/* ช่องกรอกชื่อกลุ่มใหม่ (กรณีเลือกสร้างกลุ่มใหม่) */}
          {groupSelect === 'new-group-action' && (
            <div style={{ marginBottom: '12px', background: '#111827', padding: '10px', borderRadius: '8px', border: '1px dashed #34d399' }}>
              <label style={{ fontSize: '11px', color: '#34d399', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>✨ ตั้งชื่อกลุ่มสินค้าใหม่</label>
              <input 
                type="text" 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="ระบุชื่อกลุ่มสินค้าใหม่..." 
                style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', outline: 'none', fontSize: '12px' }}
              />
            </div>
          )}

          <button type="submit" style={{ width: '100%', padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
            ➕ เพิ่มสินค้า
          </button>
        </form>
      </div>

      {/* ────────────────────────── */}
      {/* 2. ส่วนค้นหา */}
      {/* ────────────────────────── */}
      <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '14px', border: '1px solid #334155', marginBottom: '16px' }}>
        <input 
          type="text" 
          placeholder="🔍 พิมพ์ชื่อสินค้าเพื่อค้นหาทันที..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', outline: 'none', fontSize: '12px' }}
        />
      </div>

      {/* ────────────────────────── */}
      {/* 3. รายการสินค้าในระบบ (แสดงผลแยกตามกลุ่ม A-Z) */}
      {/* ────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.keys(farmItemsDB).length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '20px', fontSize: '12px' }}>ไม่พบข้อมูลสินค้าในระบบ</div>
        ) : (
          Object.keys(farmItemsDB).map((groupId) => {
            const title = groupTitles[groupId] || groupId;
            const items = farmItemsDB[groupId] || [];
            const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

            if (filteredItems.length === 0 && searchQuery) return null;

            return (
              <div key={groupId} style={{ background: '#0f172a', borderRadius: '12px', padding: '12px', border: '1px solid #334155' }}>
                {/* หัวข้อกลุ่ม + ปุ่มจัดการกลุ่ม */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
                  <div style={{ fontWeight: 'bold', color: '#38bdf8', fontSize: '13px' }}>
                    📁 {title} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>({filteredItems.length})</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', fontSize: '11px' }}>
                    <span onClick={() => handleRenameGroup(groupId)} style={{ color: '#34d399', cursor: 'pointer', background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>✏️ เปลี่ยนชื่อ</span>
                    <span onClick={() => handleDeleteGroup(groupId)} style={{ color: '#ef4444', cursor: 'pointer', background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>🗑️ ลบ</span>
                  </div>
                </div>

                {/* รายการสินค้าในกลุ่ม */}
                {filteredItems.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '11px', fontStyle: 'italic', padding: '4px 0' }}>ไม่มีสินค้าในกลุ่มนี้</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filteredItems.map((item, idx) => {
                      const originalIndex = items.findIndex(i => i.name === item.name);
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '8px 10px', borderRadius: '8px', border: '1px solid #334155' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '12px' }}>{item.name}</div>
                            <div style={{ color: '#34d399', fontSize: '11px', marginTop: '2px' }}>ราคา: {item.marketPrice} ฿ / {item.unit}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
                            <span 
                              onClick={() => setEditingItem({ groupKey: groupId, index: originalIndex, ...item })} 
                              style={{ cursor: 'pointer', padding: '2px' }} 
                              title="แก้ไข"
                            >
                              ✏️
                            </span>
                            <span 
                              onClick={() => handleDeleteItem(groupId, originalIndex)} 
                              style={{ cursor: 'pointer', padding: '2px' }} 
                              title="ลบ"
                            >
                              🗑️
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ────────────────────────── */}
      {/* Modal 1: ป๊อปอัปเลือกกลุ่มสินค้าสำหรับฟอร์มเพิ่มสินค้า */}
      {/* ────────────────────────── */}
      {isGroupModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '14px', width: '100%', maxWidth: '320px', padding: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '10px', fontSize: '14px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
              📁 เลือกกลุ่มสินค้า
            </div>
            
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.keys(groupTitles).map((gKey) => (
                <div 
                  key={gKey} 
                  onClick={() => {
                    setGroupSelect(gKey);
                    setIsGroupModalOpen(false);
                  }}
                  style={{ 
                    padding: '10px', background: groupSelect === gKey ? '#334155' : '#0f172a', 
                    borderRadius: '8px', cursor: 'pointer', color: '#fff', fontSize: '13px',
                    border: groupSelect === gKey ? '1px solid #38bdf8' : '1px solid transparent'
                  }}
                >
                  📁 {groupTitles[gKey]}
                </div>
              ))}

              <div 
                onClick={() => {
                  setGroupSelect('new-group-action');
                  setIsGroupModalOpen(false);
                }}
                style={{ 
                  padding: '10px', background: groupSelect === 'new-group-action' ? '#334155' : '#0f172a', 
                  borderRadius: '8px', cursor: 'pointer', color: '#34d399', fontSize: '13px', fontWeight: 'bold',
                  border: groupSelect === 'new-group-action' ? '1px solid #34d399' : '1px solid transparent'
                }}
              >
                ➕ -- สร้างกลุ่มใหม่ --
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => setIsGroupModalOpen(false)}
              style={{ width: '100%', padding: '8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────── */}
      {/* Modal 2: ป๊อปอัปจัดการกลุ่มสินค้าทั้งหมด */}
      {/* ────────────────────────── */}
      {isManageGroupOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '14px', width: '100%', maxWidth: '320px', padding: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '10px', fontSize: '14px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
              ⚙️ รายชื่อกลุ่มสินค้าทั้งหมด
            </div>

            <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.keys(groupTitles).map((gKey) => (
                <div key={gKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '8px 10px', borderRadius: '8px', fontSize: '12px' }}>
                  <span>📁 {groupTitles[gKey]}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span onClick={() => handleRenameGroup(gKey)} style={{ color: '#34d399', cursor: 'pointer' }}>✏️</span>
                    <span onClick={() => handleDeleteGroup(gKey)} style={{ color: '#ef4444', cursor: 'pointer' }}>🗑️</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              onClick={() => setIsManageGroupOpen(false)}
              style={{ width: '100%', padding: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────── */}
      {/* Modal 3: ป๊อปอัปแก้ไขข้อมูลสินค้า */}
      {/* ────────────────────────── */}
      {editingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '14px', width: '100%', maxWidth: '320px', padding: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ fontWeight: 'bold', color: '#34d399', marginBottom: '10px', fontSize: '14px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
              ✏️ แก้ไขข้อมูลสินค้า
            </div>
            
            <form onSubmit={handleUpdateItem}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>ชื่อสินค้า</label>
                <input 
                  type="text" 
                  value={editingItem.name} 
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', boxSizing: 'border-box', fontSize: '12px' }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>ราคากลาง (บาท)</label>
                <input 
                  type="number" 
                  value={editingItem.marketPrice} 
                  onChange={(e) => setEditingItem({ ...editingItem, marketPrice: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', boxSizing: 'border-box', fontSize: '12px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>หน่วย</label>
                <select 
                  value={editingItem.unit} 
                  onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', boxSizing: 'border-box', fontSize: '12px' }}
                >
                  <option value="ตัว">ตัว</option>
                  <option value="กก.">กก.</option>
                  <option value="ลูก">ลูก</option>
                  <option value="กำ">กำ</option>
                  <option value="แผง">แผง</option>
                  <option value="กระสอบ">กระสอบ</option>
                  <option value="ถุง">ถุง</option>
                  <option value="ขวด">ขวด</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" style={{ flex: 1, padding: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                  บันทึก
                </button>
                <button type="button" onClick={() => setEditingItem(null)} style={{ flex: 1, padding: '8px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
    );
    if (isDuplicateItem) return alert("มีสินค้านี้อยู่แล้วในกลุ่มดังกล่าว");

    // เพิ่มสินค้าใหม่และจัดเรียง A-Z
    updatedDB[targetGroup].push({
      name: newItemName.trim(),
      marketPrice: parseFloat(newItemMarketPrice) || 0,
      unit: newItemUnit
    });
    updatedDB[targetGroup].sort((a, b) => a.name.localeCompare(b.name, 'th'));

    saveDataToStorage(updatedDB, updatedTitles);

    // รีเซ็ตฟอร์ม
    setNewItemName('');
    setNewItemMarketPrice('');
    setGroupSelect(targetGroup);
    alert("✨ เพิ่มสินค้าสำเร็จ!");
  };

  const handleDeleteItem = (groupKey, index) => {
    if (!window.confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) return;
    const updatedDB = { ...farmItemsDB };
    updatedDB[groupKey].splice(index, 1);
    saveDataToStorage(updatedDB, groupTitles);
  };

  const handleUpdateItem = (e) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) return alert("กรุณากรอกชื่อสินค้า");

    const { groupKey, index, name, marketPrice, unit } = editingItem;
    const updatedDB = { ...farmItemsDB };

    updatedDB[groupKey][index] = {
      name: name.trim(),
      marketPrice: parseFloat(marketPrice) || 0,
      unit: unit
    };
    updatedDB[groupKey].sort((a, b) => a.name.localeCompare(b.name, 'th'));

    saveDataToStorage(updatedDB, groupTitles);
    setEditingItem(null);
    alert("💾 บันทึกการแก้ไขสำเร็จ!");
  };

  // --- ฟังก์ชันจัดการกลุ่มสินค้า ---
  const handleRenameGroup = (groupKey) => {
    const currentTitle = groupTitles[groupKey];
    const newTitle = prompt("เปลี่ยนชื่อกลุ่มสินค้า:", currentTitle);
    if (!newTitle || !newTitle.trim() || newTitle.trim() === currentTitle) return;

    const updatedTitles = { ...groupTitles };
    updatedTitles[groupKey] = newTitle.trim();
    saveDataToStorage(farmItemsDB, updatedTitles);
  };

  const handleDeleteGroup = (groupKey) => {
    const itemsCount = farmItemsDB[groupKey]?.length || 0;
    if (itemsCount > 0) {
      return alert("ไม่สามารถลบกลุ่มนี้ได้ เนื่องจากยังมีสินค้าอยู่ภายในกลุ่ม กรุณาลบสินค้าออกให้หมดก่อน");
    }
    if (!window.confirm(`คุณต้องการลบกลุ่ม "${groupTitles[groupKey]}" ใช่หรือไม่?`)) return;

    const updatedDB = { ...farmItemsDB };
    const updatedTitles = { ...groupTitles };

    delete updatedDB[groupKey];
    delete updatedTitles[groupKey];

    saveDataToStorage(updatedDB, updatedTitles);
    const remainingKeys = Object.keys(updatedTitles);
    if (remainingKeys.length > 0) setGroupSelect(remainingKeys[0]);
  };

  return (
    <div style={{ padding: '16px', color: '#f8fafc', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', background: '#090d16', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#34d399', margin: '0 0 4px 0', fontSize: '20px' }}>📦 ระบบจัดการคลังสินค้า</h2>
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>จัดการราคาและรายการสินค้าฟาร์มของคุณอย่างมีประสิทธิภาพ</p>
      </div>

      {/* ────────────────────────── */}
      {/* 1. ส่วนเพิ่มสินค้าใหม่ */}
      {/* ────────────────────────── */}
      <div style={{ background: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '20px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
        <h3 style={{ color: '#38bdf8', fontSize: '15px', marginTop: 0, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ➕ เพิ่มสินค้าใหม่
        </h3>
        
        <form onSubmit={handleAddItem}>
          {/* ชื่อสินค้า */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500', display: 'block', marginBottom: '4px' }}>ชื่อสินค้า</label>
            <input 
              type="text" 
              value={newItemName} 
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="ระบุชื่อสินค้า..." 
              style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          {/* ราคากลาง */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500', display: 'block', marginBottom: '4px' }}>ราคากลาง (บาท)</label>
            <input 
              type="number" 
              value={newItemMarketPrice} 
              onChange={(e) => setNewItemMarketPrice(e.target.value)}
              placeholder="0"
              style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          {/* หน่วยสินค้า */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500', display: 'block', marginBottom: '4px' }}>หน่วย</label>
            <select 
              value={newItemUnit} 
              onChange={(e) => setNewItemUnit(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', outline: 'none' }}
            >
              <option value="ตัว">ตัว</option>
              <option value="กก.">กก.</option>
              <option value="ลูก">ลูก</option>
              <option value="กำ">กำ</option>
              <option value="แผง">แผง</option>
              <option value="กระสอบ">กระสอบ</option>
              <option value="ถุง">ถุง</option>
              <option value="ขวด">ขวด</option>
            </select>
          </div>

          {/* กลุ่มสินค้า (กดเปิด Modal เลือกกลุ่ม) */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>กลุ่มสินค้า</label>
              <span 
                onClick={() => setIsManageGroupOpen(true)}
                style={{ fontSize: '11px', color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ⚙️ จัดการกลุ่มทั้งหมด
              </span>
            </div>
            
            <div 
              onClick={() => setIsGroupModalOpen(true)}
              style={{ 
                width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', 
                borderRadius: '8px', color: '#fff', cursor: 'pointer', 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' 
              }}
            >
              <span>{groupSelect === 'new-group-action' ? '➕ -- สร้างกลุ่มใหม่ --' : `📁 ${groupTitles[groupSelect] || 'เลือกกลุ่มสินค้า'}`}</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>▼ แตะเพื่อเลือก</span>
            </div>
          </div>

          {/* ช่องกรอกชื่อกลุ่มใหม่ (กรณีเลือกสร้างกลุ่มใหม่) */}
          {groupSelect === 'new-group-action' && (
            <div style={{ marginBottom: '16px', background: '#111827', padding: '12px', borderRadius: '10px', border: '1px dashed #34d399' }}>
              <label style={{ fontSize: '12px', color: '#34d399', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>✨ ตั้งชื่อกลุ่มสินค้าใหม่</label>
              <input 
                type="text" 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="ระบุชื่อกลุ่มสินค้าใหม่..." 
                style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
          )}

          <button type="submit" style={{ width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)' }}>
            ➕ เพิ่มสินค้า
          </button>
        </form>
      </div>

      {/* ────────────────────────── */}
      {/* 2. ส่วนค้นหา */}
      {/* ────────────────────────── */}
      <div style={{ background: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '20px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
        <h3 style={{ color: '#38bdf8', fontSize: '15px', marginTop: 0, marginBottom: '10px' }}>🔍 ค้นหาสินค้า</h3>
        <input 
          type="text" 
          placeholder="พิมพ์ชื่อสินค้าเพื่อค้นหาทันที..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff', boxSizing: 'border-box', outline: 'none' }}
        />
      </div>

      {/* ────────────────────────── */}
      {/* 3. รายการสินค้าในระบบ (แสดงผลแยกตามกลุ่ม A-Z) */}
      {/* ────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {Object.keys(farmItemsDB).length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>ไม่พบข้อมูลสินค้าในระบบ</div>
        ) : (
          Object.keys(farmItemsDB).map((groupId) => {
            const title = groupTitles[groupId] || groupId;
            const items = farmItemsDB[groupId] || [];
            const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

            if (filteredItems.length === 0 && searchQuery) return null;

            return (
              <div key={groupId} style={{ background: '#0f172a', borderRadius: '14px', padding: '14px', border: '1px solid #334155' }}>
                {/* หัวข้อกลุ่ม + ปุ่มจัดการกลุ่ม */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
                  <div style={{ fontWeight: 'bold', color: '#38bdf8', fontSize: '14px' }}>
                    📁 {title} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>({filteredItems.length})</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                    <span onClick={() => handleRenameGroup(groupId)} style={{ color: '#34d399', cursor: 'pointer', background: '#1e293b', padding: '2px 8px', borderRadius: '4px' }}>✏️ เปลี่ยนชื่อ</span>
                    <span onClick={() => handleDeleteGroup(groupId)} style={{ color: '#ef4444', cursor: 'pointer', background: '#1e293b', padding: '2px 8px', borderRadius: '4px' }}>🗑️ ลบกลุ่ม</span>
                  </div>
                </div>

                {/* รายการสินค้าในกลุ่ม */}
                {filteredItems.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic', padding: '4px 0' }}>ไม่มีสินค้าในกลุ่มนี้</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredItems.map((item, idx) => {
                      // หา index จริงใน raw array ของกลุ่มนั้นๆ เพื่อใช้ลบ/แก้ไข
                      const originalIndex = items.findIndex(i => i.name === item.name);
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '10px 12px', borderRadius: '10px', border: '1px solid #334155' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '13px' }}>{item.name}</div>
                            <div style={{ color: '#34d399', fontSize: '11px', marginTop: '2px' }}>ราคา: {item.marketPrice} ฿ / {item.unit}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', fontSize: '14px' }}>
                            <span 
                              onClick={() => setEditingItem({ groupKey: groupId, index: originalIndex, ...item })} 
                              style={{ cursor: 'pointer', padding: '4px' }} 
                              title="แก้ไข"
                            >
                              ✏️
                            </span>
                            <span 
                              onClick={() => handleDeleteItem(groupId, originalIndex)} 
                              style={{ cursor: 'pointer', padding: '4px' }} 
                              title="ลบ"
                            >
                              🗑️
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ────────────────────────── */}
      {/* Modal 1: ป๊อปอัปเลือกกลุ่มสินค้าสำหรับฟอร์มเพิ่มสินค้า */}
      {/* ────────────────────────── */}
      {isGroupModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: '0', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '16px', width: '100%', maxWidth: '340px', padding: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px', fontSize: '15px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
              📁 เลือกกลุ่มสินค้า
            </div>
            
            <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.keys(groupTitles).map((gKey) => (
                <div 
                  key={gKey} 
                  onClick={() => {
                    setGroupSelect(gKey);
                    setIsGroupModalOpen(false);
                  }}
                  style={{ 
                    padding: '12px', background: groupSelect === gKey ? '#334155' : '#0f172a', 
                    borderRadius: '8px', cursor: 'pointer', color: '#fff', fontSize: '14px',
                    border: groupSelect === gKey ? '1px solid #38bdf8' : '1px solid transparent'
                  }}
                >
                  📁 {groupTitles[gKey]}
                </div>
              ))}

              <div 
                onClick={() => {
                  setGroupSelect('new-group-action');
                  setIsGroupModalOpen(false);
                }}
                style={{ 
                  padding: '12px', background: groupSelect === 'new-group-action' ? '#334155' : '#0f172a', 
                  borderRadius: '8px', cursor: 'pointer', color: '#34d399', fontSize: '14px', fontWeight: 'bold',
                  border: groupSelect === 'new-group-action' ? '1px solid #34d399' : '1px solid transparent'
                }}
              >
                ➕ -- สร้างกลุ่มใหม่ --
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => setIsGroupModalOpen(false)}
              style={{ width: '100%', padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────── */}
      {/* Modal 2: ป๊อปอัปจัดการกลุ่มสินค้าทั้งหมด (เพิ่มกลุ่มใหม่ด่วน) */}
      {/* ────────────────────────── */}
      {isManageGroupOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '16px', width: '100%', maxWidth: '340px', padding: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px', fontSize: '15px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
              ⚙️ รายชื่อกลุ่มสินค้าทั้งหมด
            </div>

            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.keys(groupTitles).map((gKey) => (
                <div key={gKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}>
                  <span>📁 {groupTitles[gKey]}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span onClick={() => handleRenameGroup(gKey)} style={{ color: '#34d399', cursor: 'pointer' }}>✏️</span>
                    <span onClick={() => handleDeleteGroup(gKey)} style={{ color: '#ef4444', cursor: 'pointer' }}>🗑️</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              onClick={() => setIsManageGroupOpen(false)}
              style={{ width: '100%', padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────── */}
      {/* Modal 3: ป๊อปอัปแก้ไขข้อมูลสินค้า (ชื่อ, ราคา, หน่วย) */}
      {/* ────────────────────────── */}
      {editingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '16px', width: '100%', maxWidth: '340px', padding: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ fontWeight: 'bold', color: '#34d399', marginBottom: '12px', fontSize: '15px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
              ✏️ แก้ไขข้อมูลสินค้า
            </div>
            
            <form onSubmit={handleUpdateItem}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>ชื่อสินค้า</label>
                <input 
                  type="text" 
                  value={editingItem.name} 
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>ราคากลาง (บาท)</label>
                <input 
                  type="number" 
                  value={editingItem.marketPrice} 
                  onChange={(e) => setEditingItem({ ...editingItem, marketPrice: e.target.value })}
                  style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>หน่วย</label>
                <select 
                  value={editingItem.unit} 
                  onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                  style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="ตัว">ตัว</option>
                  <option value="กก.">กก.</option>
                  <option value="ลูก">ลูก</option>
                  <option value="กำ">กำ</option>
                  <option value="แผง">แผง</option>
                  <option value="กระสอบ">กระสอบ</option>
                  <option value="ถุง">ถุง</option>
                  <option value="ขวด">ขวด</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  บันทึก
                </button>
                <button type="button" onClick={() => setEditingItem(null)} style={{ flex: 1, padding: '10px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
