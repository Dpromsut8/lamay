/**
 * LAMAY Database Service (IndexedDB + ES Module)
 * ออกแบบสำหรับ React + Vite + Capacitor 6
 */

class LamayDB {
  constructor() {
    this.dbName = 'LamayFarmDB';
    this.dbVersion = 1;
    this.db = null;
  }

  // เริ่มต้นเปิดใช้งาน Database
  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (e) => {
        console.error('IndexedDB error:', e.target.error);
        reject('ไม่สามารถเปิด IndexedDB ได้');
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        console.log('📦 IndexedDB พร้อมใช้งานแล้ว (React Engine)');
        resolve(this.db);
      };

      request.onupgradeneeded = (e) => {
        const db = e.target.result;

        // 1. แคตตาล็อกสินค้า
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('group', 'group', { unique: false });
        }

        // 2. ตารางบันทึกรายรับ-รายจ่าย
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('date', 'date', { unique: false });
          txStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  getStore(storeName, mode = 'readonly') {
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  // ==================== PRODUCTS ====================
  async getProducts() {
    await this.init();
    return new Promise((resolve) => {
      const store = this.getStore('products');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
    });
  }

  async saveProduct(product) {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('products', 'readwrite');
      const item = { ...product, id: product.id || Date.now(), updatedAt: new Date().toISOString() };
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject('บันทึกไม่สำเร็จ');
    });
  }

  async deleteProduct(id) {
    await this.init();
    return new Promise((resolve) => {
      const store = this.getStore('products', 'readwrite');
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
    });
  }

  // ==================== TRANSACTIONS ====================
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

  async saveTransaction(entry) {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore('transactions', 'readwrite');
      const item = { ...entry, id: entry.id || Date.now(), updatedAt: new Date().toISOString() };
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject('บันทึกรายการไม่สำเร็จ');
    });
  }

  async deleteTransaction(id) {
    await this.init();
    return new Promise((resolve) => {
      const store = this.getStore('transactions', 'readwrite');
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
    });
  }
}

export const dbService = new LamayDB();
