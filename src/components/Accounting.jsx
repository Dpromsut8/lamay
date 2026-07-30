import React, { useState } from 'react';

export default function Accounting() {
  // สถานะเก็บรายการรับ-จ่ายทั้งหมด
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'income', title: 'ขายผลผลิตพืช', amount: 14500, date: '2026-06-01' },
    { id: 2, type: 'expense', title: 'ซื้อปุ๋ยและเมล็ดพันธุ์', amount: 4200, date: '2026-06-03' }
  ]);

  // สถานะสำหรับฟอร์มเพิ่มรายการใหม่
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income'); // 'income' หรือ 'expense'

  // คำนวณยอดรวมรายรับและรายจ่าย
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpense;

  // ฟังก์ชันเพิ่มรายการใหม่
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!title || !amount || isNaN(amount)) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      title,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString().split('T')[0]
    };

    setTransactions([newTransaction, ...transactions]);
    setTitle('');
    setAmount('');
    setShowModal(false);
  };

  return (
    <div className="glass-card" style={{ padding: '16px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ color: '#34d399', fontSize: '15px', margin: 0 }}>💰 บัญชีรับ-จ่าย ฟาร์ม</h3>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#34d399', color: '#0f172a', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          + เพิ่มรายการ
        </button>
      </div>

      {/* สรุปยอดเงิน */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', background: 'rgba(15,23,42,0.5)', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
        <span>รายรับ: <b style={{ color: '#34d399' }}>฿{totalIncome.toLocaleString()}</b></span>
        <span>รายจ่าย: <b style={{ color: '#f87171' }}>฿{totalExpense.toLocaleString()}</b></span>
        <span>คงเหลือ: <b style={{ color: netBalance >= 0 ? '#34d399' : '#f87171' }}>฿{netBalance.toLocaleString()}</b></span>
      </div>

      {/* รายการย้อนหลัง */}
      <div style={{ fontSize: '12px' }}>
        <p style={{ color: '#94a3b8', margin: '0 0 6px 0', fontSize: '11px' }}>รายการล่าสุด</p>
        <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {transactions.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
              <span style={{ color: '#cbd5e1' }}>{t.title}</span>
              <span style={{ color: t.type === 'income' ? '#34d399' : '#f87171', fontWeight: 'bold' }}>
                {t.type === 'income' ? '+' : '-'}฿{t.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal / ฟอร์มสำหรับเพิ่มข้อมูล */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', width: '90%', maxWidth: '320px', border: '1px solid #334155' }}>
            <h4 style={{ color: '#34d399', margin: '0 0 10px 0', fontSize: '14px' }}>เพิ่มรายการบัญชี</h4>
            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                style={{ padding: '6px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', fontSize: '12px' }}
              >
                <option value="income">รายรับ</option>
                <option value="expense">รายจ่าย</option>
              </select>
              <input 
                type="text" 
                placeholder="ชื่อรายการ (เช่น ขายผัก, ค่าปุ๋ย)" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                style={{ padding: '6px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', fontSize: '12px' }}
              />
              <input 
                type="number" 
                placeholder="จำนวนเงิน (บาท)" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                style={{ padding: '6px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #475569', fontSize: '12px' }}
              />
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
