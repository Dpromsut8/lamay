import React, { useState, useEffect } from 'react';
import { dbService } from './services/database';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- State สำหรับฟอร์มป้อนลงบัญชี (Quick Transaction Entry) ---
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actualPrice, setActualPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('แผง');
  const [txType, setTxType] = useState('income'); // 'income' หรือ 'expense'

  // --- State สำหรับฟอร์มสร้างรายการผลผลิตใหม่ ---
  const [newProdName, setNewProdName] = useState('');
  const [newProdStdPrice, setNewProdStdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('สัตว์เลี้ยง');
  const [newProdUnit, setNewProdUnit] = useState('แผง');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const pList = await dbService.getProducts();
      const tList = await dbService.getTransactions();
      setProducts(pList);
      setTransactions(tList);

      if (pList.length > 0 && !selectedProduct) {
        selectProductForEntry(pList[0]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // เลือกสินค้าเพื่อนำมาป้อนลงบัญชี
  const selectProductForEntry = (prod) => {
    setSelectedProduct(prod);
    setActualPrice(prod.standardPrice || '');
    setUnit(prod.unit || 'หน่วย');
    setQuantity(1);
    // ตั้งประเภทอัตโนมัติตามกลุ่มสินค้า
    if (prod.category === 'วัสดุสิ้นเปลือง' || prod.category === 'ค่าใช้จ่ายระบบ') {
      setTxType('expense');
    } else {
      setTxType('income');
    }
  };

  // บันทึกรายการลงบัญชี
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !actualPrice || !quantity) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const totalAmount = Number(actualPrice) * Number(quantity);
    const entry = {
      date: new Date().toISOString().slice(0, 10),
      title: `${selectedProduct.name} (${quantity} ${unit})`,
      productId: selectedProduct.id,
      pricePerUnit: Number(actualPrice),
      quantity: Number(quantity),
      unit: unit,
      amount: totalAmount,
      type: txType
    };

    await dbService.saveTransaction(entry);
    await loadAllData();
    alert('✅ บันทึกรายการบัญชีสำเร็จ!');
  };

  // สร้างรายการผลผลิตใหม่ลง DB
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdStdPrice) {
      alert('กรุณากรอกชื่อรายการและราคากลาง');
      return;
    }

    const newProd = {
      name: newProdName,
      standardPrice: Number(newProdStdPrice),
      category: newProdCategory,
      unit: newProdUnit
    };

    await dbService.saveProduct(newProd);
    setNewProdName('');
    setNewProdStdPrice('');
    await loadAllData();
    alert('✨ เพิ่มรายการผลผลิตใหม่เรียบร้อยแล้ว!');
  };

  // คำนวณสรุปยอดเงิน
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;

  // จัดกลุ่มสินค้าตามหมวดหมู่
  const categories = ['สัตว์เลี้ยง', 'พืชสวน', 'วัสดุสิ้นเปลือง', 'ค่าใช้จ่ายระบบ'];

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <h1 style={styles.title}>🌾 LAMAY — ละม้ายฟาร์ม</h1>
        <p style={styles.subtitle}>ระบบจัดการผลผลิตและบัญชีฟาร์ม (Offline-First)</p>
      </header>

      {/* TABS */}
      <nav style={styles.navTabs}>
        <button
          style={{ ...styles.tabBtn, ...(activeTab === 'dashboard' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 ภาพรวม
        </button>
        <button
          style={{ ...styles.tabBtn, ...(activeTab === 'products' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('products')}
        >
          📦 ผลผลิต ({products.length})
        </button>
        <button
          style={{ ...styles.tabBtn, ...(activeTab === 'accounting' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('accounting')}
        >
          💰 บัญชีฟาร์ม ({transactions.length})
        </button>
      </nav>

      {loading ? (
        <div style={styles.loading}>กำลังโหลดข้อมูลฐานข้อมูล...</div>
      ) : (
        <main style={styles.mainContent}>
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              {/* SUMMARY CARDS */}
              <div style={styles.gridCards}>
                <div style={{ ...styles.card, borderLeft: '5px solid #10B981' }}>
                  <span style={styles.cardLabel}>รายรับรวม</span>
                  <h2 style={{ ...styles.cardVal, color: '#10B981' }}>฿{totalIncome.toLocaleString()}</h2>
                </div>
                <div style={{ ...styles.card, borderLeft: '5px solid #EF4444' }}>
                  <span style={styles.cardLabel}>รายจ่ายรวม</span>
                  <h2 style={{ ...styles.cardVal, color: '#EF4444' }}>฿{totalExpense.toLocaleString()}</h2>
                </div>
                <div style={{ ...styles.card, borderLeft: '5px solid #3B82F6' }}>
                  <span style={styles.cardLabel}>คงเหลือสุทธิ</span>
                  <h2 style={{ ...styles.cardVal, color: netBalance >= 0 ? '#3B82F6' : '#EF4444' }}>
                    ฿{netBalance.toLocaleString()}
                  </h2>
                </div>
              </div>

              {/* 🟢 ส่วนการ์ดเลือกผลผลิต / สินค้า */}
              <div style={styles.sectionBox}>
                <h3 style={styles.sectionTitle}>🛒 เลือกรายการบันทึกบัญชี</h3>
                {categories.map((cat) => {
                  const items = products.filter((p) => (p.category || 'พืชสวน') === cat);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat} style={{ marginBottom: '12px' }}>
                      <span style={styles.catBadge}>{cat}</span>
                      <div style={styles.productGrid}>
                        {items.map((p) => {
                          const isSelected = selectedProduct?.id === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => selectProductForEntry(p)}
                              style={{
                                ...styles.productCardBtn,
                                borderColor: isSelected ? '#2563eb' : '#374151',
                                background: isSelected ? '#1e293b' : '#0f172a'
                              }}
                            >
                              <div style={styles.productCardTitle}>{p.name}</div>
                              <div style={styles.productCardPrice}>
                                {p.standardPrice}฿ <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/ {p.unit}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 🟡 ส่วนฟอร์มป้อนข้อมูลลงบัญชี (LAYOUT 2x2 ตามที่ออกแบบไว้) */}
              {selectedProduct && (
                <form onSubmit={handleSaveTransaction} style={styles.formCard}>
                  <div style={styles.formHeader}>
                    <h4>📝 บันทึกรายการ: <span style={{ color: '#38bdf8' }}>{selectedProduct.name}</span></h4>
                    <select
                      value={txType}
                      onChange={(e) => setTxType(e.target.value)}
                      style={styles.selectType}
                    >
                      <option value="income">🟢 รายรับ</option>
                      <option value="expense">🔴 รายจ่าย</option>
                    </select>
                  </div>

                  {/* 💥 GRID 2x2 DESIGN 💥 */}
                  <div style={styles.grid2x2}>
                    {/* [ซ้ายบน]: แสดงราคากลางอ้างอิงจาก DB */}
                    <div style={styles.refPriceBox}>
                      <span style={styles.fieldLabel}>ราคากลาง (อ้างอิง DB)</span>
                      <div style={styles.refPriceVal}>
                        {selectedProduct.standardPrice || 0} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>฿/{selectedProduct.unit}</span>
                      </div>
                    </div>

                    {/* [ขวาบน]: ราคา/หน่วย (ซื้อ-ขายจริง) */}
                    <div>
                      <label style={styles.fieldLabel}>ราคา/หน่วย (฿)</label>
                      <input
                        type="number"
                        value={actualPrice}
                        onChange={(e) => setActualPrice(e.target.value)}
                        style={styles.inputField}
                        required
                      />
                    </div>

                    {/* [ซ้ายล่าง]: จำนวน */}
                    <div>
                      <label style={styles.fieldLabel}>จำนวน</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        style={styles.inputField}
                        required
                      />
                    </div>

                    {/* [ขวาล่าง]: หน่วย (เลื่อนมาอยู่ฝั่งขวาใต้ราคาตามโจทย์) */}
                    <div>
                      <label style={styles.fieldLabel}>หน่วย</label>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        style={styles.inputField}
                      >
                        <option value="แผง">แผง</option>
                        <option value="กก.">กก.</option>
                        <option value="กำ">กำ</option>
                        <option value="กระสอบ">กระสอบ</option>
                        <option value="หน่วย">หน่วย</option>
                        <option value="ตัว">ตัว</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" style={styles.btnSave}>
                    💾 บันทึกลงบัญชี (รวม ฿{(Number(actualPrice || 0) * Number(quantity || 0)).toLocaleString()})
                  </button>
                </form>
              )}

              {/* 🔵 ฟอร์มสร้างรายการผลผลิตใหม่ */}
              <form onSubmit={handleCreateProduct} style={{ ...styles.formCard, marginTop: '20px' }}>
                <h4>⚙️ สร้างรายการผลผลิตใหม่</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  <input
                    type="text"
                    placeholder="ชื่อรายการ (เช่น มะกรูด)"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                  <input
                    type="number"
                    placeholder="ราคากลางมาตรฐาน"
                    value={newProdStdPrice}
                    onChange={(e) => setNewProdStdPrice(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={styles.fieldLabel}>กลุ่มสินค้า</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        style={styles.inputField}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>หน่วยสินค้า</label>
                      <select
                        value={newProdUnit}
                        onChange={(e) => setNewProdUnit(e.target.value)}
                        style={styles.inputField}
                      >
                        <option value="แผง">แผง</option>
                        <option value="กก.">กก.</option>
                        <option value="กำ">กำ</option>
                        <option value="กระสอบ">กระสอบ</option>
                        <option value="หน่วย">หน่วย</option>
                        <option value="ตัว">ตัว</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" style={styles.btnSecondary}>
                    ➕ เพิ่มรายการสินค้าเข้า DB
                  </button>
                </div>
              </form>

              {/* QUICK ACTIONS */}
              <div style={styles.actionSection}>
                <div style={styles.btnGroup}>
                  <button onClick={() => dbService.exportBackupJSON()} style={styles.btnSecondary}>
                    📤 สำรองข้อมูล (Backup JSON)
                  </button>
                  <button onClick={loadAllData} style={styles.btnPrimary}>
                    🔄 รีเฟรชข้อมูล
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div>
              <h3>รายการผลผลิตทั้งหมดใน DB</h3>
              {products.length === 0 ? (
                <p style={styles.emptyText}>ยังไม่มีรายการผลผลิต</p>
              ) : (
                <ul style={styles.list}>
                  {products.map((p) => (
                    <li key={p.id} style={styles.listItem}>
                      <div>
                        <strong>{p.name}</strong> <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>({p.category})</span>
                      </div>
                      <div>
                        <span style={{ color: '#10B981', fontWeight: 'bold' }}>ราคากลาง: ฿{p.standardPrice}</span> /{p.unit}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNTING */}
          {activeTab === 'accounting' && (
            <div>
              <h3>ประวัติบันทึก รายรับ-รายจ่าย</h3>
              {transactions.length === 0 ? (
                <p style={styles.emptyText}>ยังไม่มีบันทึกรายรับ-รายจ่าย</p>
              ) : (
                <ul style={styles.list}>
                  {transactions.map((t) => (
                    <li key={t.id} style={styles.listItem}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{t.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{t.date}</div>
                      </div>
                      <strong style={{ color: t.type === 'income' ? '#10B981' : '#EF4444' }}>
                        {t.type === 'income' ? '+' : '-'}฿{Number(t.amount).toLocaleString()}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </main>
      )}
    </div>
  );
}

// STYLES (ธีม Dark Mode / Modern Clean)
const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '12px', fontFamily: 'system-ui, sans-serif', background: '#090d16', minHeight: '100vh', color: '#f3f4f6' },
  header: { textAlign: 'center', marginBottom: '16px' },
  title: { margin: '0', color: '#60a5fa', fontSize: '1.5rem' },
  subtitle: { margin: '4px 0 0', color: '#9ca3af', fontSize: '0.85rem' },
  navTabs: { display: 'flex', gap: '4px', borderBottom: '2px solid #1f2937', marginBottom: '16px' },
  tabBtn: { flex: 1, padding: '10px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: '#9ca3af', borderRadius: '8px 8px 0 0' },
  activeTab: { color: '#60a5fa', borderBottom: '3px solid #3b82f6', background: '#1e293b' },
  gridCards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' },
  card: { background: '#1e293b', padding: '10px', borderRadius: '8px' },
  cardLabel: { fontSize: '0.75rem', color: '#9ca3af' },
  cardVal: { margin: '4px 0 0', fontSize: '1.1rem' },
  mainContent: { background: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px solid #1e293b' },
  sectionBox: { marginBottom: '16px' },
  sectionTitle: { fontSize: '0.95rem', margin: '0 0 8px 0', color: '#e2e8f0' },
  catBadge: { fontSize: '0.75rem', background: '#334155', padding: '2px 8px', borderRadius: '4px', color: '#cbd5e1' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '6px' },
  productCardBtn: { padding: '10px', border: '1px solid', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', color: '#fff' },
  productCardTitle: { fontWeight: 'bold', fontSize: '0.9rem' },
  productCardPrice: { fontSize: '0.8rem', color: '#38bdf8', marginTop: '2px' },
  formCard: { background: '#1e293b', padding: '14px', borderRadius: '10px', border: '1px solid #334155' },
  formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  selectType: { background: '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '6px', padding: '4px 8px' },
  grid2x2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' },
  refPriceBox: { background: '#0f172a', padding: '8px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  refPriceVal: { fontSize: '1.1rem', fontWeight: 'bold', color: '#34d399', marginTop: '2px' },
  fieldLabel: { fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' },
  inputField: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '8px', color: '#fff', boxSizing: 'border-box' },
  btnSave: { width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  actionSection: { marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #1e293b' },
  btnGroup: { display: 'flex', gap: '8px' },
  btnPrimary: { flex: 1, background: '#2563eb', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' },
  btnSecondary: { flex: 1, background: '#334155', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '30px', color: '#9ca3af' },
  emptyText: { color: '#6b7280', fontStyle: 'italic', textAlign: 'center' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1e293b' }
};
