import React, { useState, useEffect } from 'react';
import { dbService } from './services/database';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลจาก IndexedDB เมื่อเปิดหน้าแอป
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
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // คำนวณสรุปตัวเลขทางการเงิน
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <div style={styles.container}>
      {/* 🟢 HEADER / NAVIGATION BAR */}
      <header style={styles.header}>
        <h1 style={styles.title}>🌾 LAMAY — ละม้ายฟาร์ม</h1>
        <p style={styles.subtitle}>ระบบจัดการผลผลิตและบัญชีฟาร์ม</p>
      </header>

      {/* 🔵 MAIN MENU TABS */}
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

      {/* 🟡 CONTENT BODY */}
      {loading ? (
        <div style={styles.loading}>กำลังโหลดข้อมูลฐานข้อมูล...</div>
      ) : (
        <main style={styles.mainContent}>
          {/* TAB 1: DASHBOARD (หน้าเมนหลัก) */}
          {activeTab === 'dashboard' && (
            <div>
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

              {/* QUICK ACTIONS */}
              <div style={styles.actionSection}>
                <h3>⚡ เมนูด่วน</h3>
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
              <h3>รายการผลผลิตในฟาร์ม</h3>
              {products.length === 0 ? (
                <p style={styles.emptyText}>ยังไม่มีรายการผลผลิต บันทึกเพิ่มได้เลยครับ</p>
              ) : (
                <ul style={styles.list}>
                  {products.map((p) => (
                    <li key={p.id} style={styles.listItem}>
                      <strong>{p.name}</strong> — {p.quantity} {p.unit} (฿{p.price})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNTING */}
          {activeTab === 'accounting' && (
            <div>
              <h3>ประวัติการทำรายการ รายรับ-รายจ่าย</h3>
              {transactions.length === 0 ? (
                <p style={styles.emptyText}>ยังไม่มีบันทึกรายรับ-รายจ่าย</p>
              ) : (
                <ul style={styles.list}>
                  {transactions.map((t) => (
                    <li key={t.id} style={styles.listItem}>
                      <span>{t.date} — {t.title}</span>
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

// Inline CSS Styling สำหรับตกแต่ง UI ให้สวยสะอาด
const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '16px', fontFamily: 'system-ui, sans-serif', color: '#1f2937' },
  header: { textAlign: 'center', marginBottom: '20px' },
  title: { margin: '0', color: '#1e3a8a', fontSize: '1.8rem' },
  subtitle: { margin: '4px 0 0', color: '#6b7280', fontSize: '0.9rem' },
  navTabs: { display: 'flex', gap: '8px', borderBottom: '2px solid #e5e7eb', marginBottom: '20px' },
  tabBtn: { flex: 1, padding: '12px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: '#6b7280' },
  activeTab: { color: '#2563eb', borderBottom: '3px solid #2563eb', background: '#eff6ff' },
  gridCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' },
  card: { background: '#f9fafb', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardLabel: { fontSize: '0.85rem', color: '#6b7280' },
  cardVal: { margin: '8px 0 0', fontSize: '1.4rem' },
  mainContent: { background: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  actionSection: { marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' },
  btnGroup: { display: 'flex', gap: '10px' },
  btnPrimary: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' },
  btnSecondary: { background: '#4b5563', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '40px', color: '#6b7280' },
  emptyText: { color: '#9ca3af', fontStyle: 'italic' },
  list: { listStyle: 'none', padding: 0 },
  listItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }
};
