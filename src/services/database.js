/**
 * LAMAY Database Service (IndexedDB + ES Module Engine)
 * ออกแบบสำหรับ React + Vite + Capacitor 6 (Offline-First Ready)
 */

// สินค้าตั้งต้นอ้างอิงราคากลางสำหรับฟาร์ม
const DEFAULT_PRODUCTS = [
  { id: '1', name: 'ไข่ไก่', category: 'สัตว์เลี้ยง', standardPrice: 120, unit: 'แผง' },
  { id: '2', name: 'เห็ดนางฟ้า', category: 'พืชสวน', standardPrice: 60, unit: 'กก.' },
  { id: '3', name: 'ชะอม', category: 'พืชสวน', standardPrice: 30, unit: 'กำ' },
  { id: '4', name: 'อาหารไก่', category: 'วัสดุสิ้นเปลือง', standardPrice: 450, unit: 'กระสอบ' },
  { id: '5', name: 'ค่าไฟ/โซล่าเซลล์', category: 'ค่าใช้จ่ายระบบ', standardPrice: 1000, unit: 'หน่วย' }
];

class LamayDB {
  constructor() {
    this.dbName = 'LamayFarmDB';
    this.dbVersion = 1;
    this.db = null;
  }

  /**
   * เริ่มต้นเปิดใช้งาน IndexedDB (Auto-reconnect ถ้า db ยังไม่พร้อม)
   */
  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (e) => {
        console.error('❌ IndexedDB Error:', e.target.error);
        reject('ไม่สามารถเปิดใช้งานฐานข้อมูลได้');
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        console.log('📦 LAMAY Database Ready (React & Capacitor Engine)');
        resolve(this.db);
      };

      request.onupgradeneeded = (e) => {
        const db = e.target.result;

        // 1. ตารางสินค้า/ผลผลิต (Products Catalog)
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('group', 'group', { unique: false });
          productStore.createIndex('category', 'category', { unique: false });
        }

        // 2. ตารางรายรับ-รายจ่าย (Transactions Account)
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('date', 'date', { unique: false });
          txStore.createIndex('type', 'type', { unique: false });
          txStore.createIndex('category', 'category', { unique: false });
        }

        // 3. ตารางตั้งค่าแอปพลิเคชัน (Settings Store)
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Helper สำหรับเปิด ObjectStore ตาม Mode
   */
  getStore(storeName, mode = 'readonly') {
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  // ==========================================
  // 📦 PRODUCTS MANAGEMENT (จัดการสินค้า/ผลผลิต)
  // ==========================================

  async getProducts() {
    await this.init();
    return new Promise((resolve) => {
      const store = this.getStore('products');
      const req = store.getAll();
      req.onsuccess = async () => {
        let list = req.result || [];
        // ถ้าฐานข้อมูลยังไม่มีสินค้า ให้ลงรายการตั้งต้นให้อัตโนมัติ
        if (list.length === 0) {
          for (const p of DEFAULT_PRODUCTS) {
            await this.saveProduct(p);
          }
          list = DEFAULT_PRODUCTS;
        }
        resolve(list);
      };
    });
  }

  async getProductById(id) {
    await this.init();
    return new Promise((resolve) => {
      const store = this.getStore('products');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
    });
  }

  async saveProduct(product) {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('products', 'readwrite');
      const item = {
        ...product,
        id: String(product.id || Date.now()),
        standardPrice: Number(product.standardPrice || product.price || 0),
        updatedAt: new Date().toISOString(),
        synced: false
      };
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject('บันทึกข้อมูลสินค้าไม่สำเร็จ');
    });
  }

  async deleteProduct(id) {
    await this.init();
    return new Promise((resolve) => {
      const store = this.getStore('products', 'readwrite');
      const req = store.delete(String(id));
      req.onsuccess = () => resolve(true);
    });
  }

  // ==========================================
  // 💰 TRANSACTIONS MANAGEMENT (บัญชีรายรับ-รายจ่าย)
  // ==========================================

  async getTransactions() {
    await this.init();
    return new Promise((resolve) => {
      const store = this.getStore('transactions');
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result || [];
        list.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
        resolve(list);
      };
    });
  }

  async getTransactionsByDateRange(startDate, endDate) {
    const all = await this.getTransactions();
    return all.filter(item => item.date >= startDate && item.date <= endDate);
  }

  async saveTransaction(entry) {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('transactions', 'readwrite');
      const item = {
        ...entry,
        id: String(entry.id || Date.now()),
        amount: Number(entry.amount || 0),
        updatedAt: new Date().toISOString(),
        synced: false
      };
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject('บันทึกรายการบัญชีไม่สำเร็จ');
    });
  }

  async deleteTransaction(id) {
    await this.init();
    return new Promise((resolve) => {
      const store = this.getStore('transactions', 'readwrite');
      const req = store.delete(String(id));
      req.onsuccess = () => resolve(true);
    });
  }

  // ==========================================
  // ⚙️ SETTINGS MANAGEMENT (ตั้งค่าระบบ)
  // ==========================================

  async getSetting(key, defaultValue = null) {
    await this.init();
    return new Promise((resolve) => {
      const store = this.getStore('settings');
      const req = store.get(key);
      req.onsuccess = () => {
        resolve(req.result ? req.result.value : defaultValue);
      };
    });
  }

  async saveSetting(key, value) {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('settings', 'readwrite');
      const req = store.put({ key, value, updatedAt: new Date().toISOString() });
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject('บันทึกการตั้งค่าไม่สำเร็จ');
    });
  }

  // ==========================================
  // 📤 BACKUP / IMPORT / EXPORT (สำรองข้อมูล)
  // ==========================================

  async exportBackupJSON() {
    const products = await this.getProducts();
    const transactions = await this.getTransactions();

    const backupData = {
      appName: 'LAMAY',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      products,
      transactions
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `lamay_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return backupData;
  }

  async importBackupJSON(jsonData) {
    await this.init();
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (!data.products || !data.transactions) {
        throw new Error('โครงสร้างไฟล์สำรองข้อมูลไม่ถูกต้อง');
      }

      for (const p of data.products) {
        await this.saveProduct(p);
      }
      for (const t of data.transactions) {
        await this.saveTransaction(t);
      }

      return { success: true, countProducts: data.products.length, countTransactions: data.transactions.length };
    } catch (err) {
      console.error('Import Backup Error:', err);
      return { success: false, error: err.message };
    }
  }

  async clearAllData() {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction(['products', 'transactions', 'settings'], 'readwrite');
      tx.objectStore('products').clear();
      tx.objectStore('transactions').clear();
      tx.objectStore('settings').clear();
      tx.oncomplete = () => resolve(true);
    });
  }
}

export const dbService = new LamayDB();

