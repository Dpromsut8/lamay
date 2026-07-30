import { farmDataStorage, smartMarketData, saveFarmDataStorage } from './database.js';

/**
 * ============================================================================
 * LAMAY - ละม้ายฟาร์ม & ระบบจัดการบัญชี (Core Application Script)
 * Version: 2.0.1 Perfect Edition (Mobile Touch & Class Fixed)
 * ============================================================================
 */

class LamayApp {
    constructor() {
        // State Management
        this.products = JSON.parse(localStorage.getItem('lamay_products')) || this.getDefaultProducts();
        this.transactions = JSON.parse(localStorage.getItem('lamay_transactions')) || [];
        this.showAllHistory = false;
        this.currentUser = localStorage.getItem('lamay_user') || 'เจ้าของฟาร์ม';
        this.debounceTimer = null;

        // Initialize App
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.applyTimeTheme();
            this.bindEvents();
            this.checkAuthState();
            
            // Re-apply theme every 5 minutes
            setInterval(() => this.applyTimeTheme(), 300000);
        });
    }

    // ------------------------------------------------------------------------
    // 1. DEFAULT DATA
    // ------------------------------------------------------------------------
    getDefaultProducts() {
        return [
            { id: 1, name: 'ไข่ไก่ (แผง)', price: 120, group: 'สัตว์เลี้ยง', unit: 'แผง' },
            { id: 2, name: 'เห็ดนางฟ้า', price: 60, group: 'พืชสวน', unit: 'กก.' },
            { id: 3, name: 'ชะอม', price: 30, group: 'พืชสวน', unit: 'กำ' },
            { id: 4, name: 'อาหารไก่', price: 450, group: 'วัสดุสิ้นเปลือง', unit: 'กระสอบ' },
            { id: 5, name: 'ค่าไฟ/โซล่าเซลล์', price: 1000, group: 'ค่าใช้จ่ายระบบ', unit: 'หน่วย' }
        ];
    }

    // ------------------------------------------------------------------------
    // 2. THEME & TIME MANAGEMENT
    // ------------------------------------------------------------------------
    applyTimeTheme() {
        const hour = new Date().getHours();
        const body = document.body;
        const badge = document.getElementById('timeStatusBadge');
        
        body.classList.remove('theme-morning', 'theme-afternoon', 'theme-night');

        if (hour >= 6 && hour < 12) {
            body.classList.add('theme-morning');
            if (badge) badge.textContent = '🌅 ช่วงเช้า';
        } else if (hour >= 12 && hour < 18) {
            body.classList.add('theme-afternoon');
            if (badge) badge.textContent = '☀️ ช่วงบ่าย';
        } else {
            body.classList.add('theme-night');
            if (badge) badge.textContent = '🌙 ช่วงค่ำ/กลางคืน';
        }
    }

    // ------------------------------------------------------------------------
    // 3. AUTHENTICATION & SPLASH SCREEN
    // ------------------------------------------------------------------------
    proceedToAuth() {
        const splash = document.getElementById('splash-screen');
        if (!splash) return;
        
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            const isRegistered = localStorage.getItem('lamay_registered');
            
            if (isRegistered === 'true') {
                document.getElementById('user-display-name').innerText = this.currentUser;
                document.getElementById('one-click-view').style.display = 'block';
            } else {
                document.getElementById('auth-wrapper').style.display = 'block';
            }
        }, 800);
    }

    checkAuthState() {
        // Auto setup initial view if splash not clicked
    }

    switchAuthMode(mode) {
        document.getElementById('login-page').style.display = mode === 'login' ? 'block' : 'none';
        document.getElementById('register-page').style.display = mode === 'register' ? 'block' : 'none';
    }

    login() {
        const name = document.getElementById('loginNameInput').value.trim();
        const pass = document.getElementById('loginPassInput').value.trim();
        if (!name || !pass) return alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        
        this.saveSession(name);
    }

    register() {
        const name = document.getElementById('regNameInput').value.trim();
        const p1 = document.getElementById('regPassInput').value.trim();
        const p2 = document.getElementById('regConfirmPassInput').value.trim();

        if (!name || !p1) return alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        if (p1 !== p2) return alert('รหัสผ่านยืนยันไม่ตรงกัน');

        this.saveSession(name);
    }

    saveSession(name) {
        this.currentUser = name;
        localStorage.setItem('lamay_registered', 'true');
        localStorage.setItem('lamay_user', name);
        
        document.getElementById('auth-wrapper').style.display = 'none';
        document.getElementById('one-click-view').style.display = 'none';
        this.startApp();
    }

    executeOneClickLogin() {
        document.getElementById('one-click-view').style.display = 'none';
        this.startApp();
    }

    resetToFirstTime() {
        if (confirm('คุณต้องการสลับบัญชี หรือล้างข้อมูลเซสชันเดิมใช่หรือไม่?')) {
            localStorage.removeItem('lamay_registered');
            localStorage.removeItem('lamay_user');
            document.getElementById('one-click-view').style.display = 'none';
            document.getElementById('auth-wrapper').style.display = 'block';
        }
    }

    logout() {
        document.getElementById('app-page').style.display = 'none';
        document.getElementById('one-click-view').style.display = 'block';
    }

    // ------------------------------------------------------------------------
    // 4. MAIN APPLICATION CONTROLLER
    // ------------------------------------------------------------------------
    startApp() {
        document.getElementById('app-page').style.display = 'block';
        document.getElementById('displayName').innerText = this.currentUser;
        document.getElementById('expenseDate').valueAsDate = new Date();

        this.renderProducts();
        this.renderHistory();
        this.updateDashboard();
    }

    switchTab(tabName) {
        if (window.innerWidth >= 768) return; // Desktop uses side-by-side grid
        
        const menuPanel = document.getElementById('menu-panel');
        const accountPanel = document.getElementById('account-panel');
        const btnMenu = document.getElementById('tab-btn-menu');
        const btnAccount = document.getElementById('tab-btn-account');

        if (tabName === 'menu') {
            menuPanel.style.display = 'block';
            accountPanel.style.display = 'none';
            btnMenu.classList.add('active');
            btnAccount.classList.remove('active');
        } else {
            menuPanel.style.display = 'none';
            accountPanel.style.display = 'block';
            btnMenu.classList.remove('active');
            btnAccount.classList.add('active');
        }
    }

    // ------------------------------------------------------------------------
    // 5. CATALOG & PRODUCT MANAGEMENT
    // ------------------------------------------------------------------------
    selectProductById(id) {
        const product = this.products.find(p => p.id == id);
        if (product) {
            this.selectProductForAccount(product);
        }
    }

    renderProducts() {
        const container = document.getElementById('dynamic-groups-container');
        if (!container) return;
        
        container.innerHTML = '';
        const groups = [...new Set(this.products.map(p => p.group))];

        groups.forEach(group => {
            const title = document.createElement('h4');
            title.className = 'group-title';
            title.textContent = group;
            container.appendChild(title);

            const groupDiv = document.createElement('div');
            groupDiv.className = 'btn-group';

            this.products.filter(p => p.group === group).forEach(p => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'farm-item-btn';
                btn.innerHTML = `<strong>${p.name}</strong><br><small style="color:var(--text-muted)">${p.price}฿ / ${p.unit}</small>`;

                // Click Event Handlers
                btn.onclick = () => this.selectProductForAccount(p);

                // Context Delete (Right Click / Long Press)
                btn.oncontextmenu = (e) => {
                    e.preventDefault();
                    this.deleteProduct(p);
                };

                groupDiv.appendChild(btn);
            });

            container.appendChild(groupDiv);

            // Enable Drag-and-Drop via SortableJS with Touch Protection
            if (typeof Sortable !== 'undefined') {
                new Sortable(groupDiv, {
                    animation: 150,
                    group: 'shared',
                    delay: 150,               
                    delayOnTouchOnly: true,    
                    onEnd: () => this.saveProductsFromDOM()
                });
            }
        });
    }

    addNewProduct() {
        const nameInput = document.getElementById('newItemName');
        const priceInput = document.getElementById('newItemPrice');
        const groupSelect = document.getElementById('groupSelect');
        const newGroupInput = document.getElementById('newGroupName');
        const unitSelect = document.getElementById('newItemUnit');
        const customUnitInput = document.getElementById('customUnitName');

        const name = nameInput.value.trim();
        const price = parseFloat(priceInput.value);
        let group = groupSelect.value === 'new' ? newGroupInput.value.trim() : groupSelect.value;
        let unit = unitSelect.value === 'custom' ? customUnitInput.value.trim() : unitSelect.value;

        if (!name || isNaN(price) || !group || !unit) {
            return alert('กรุณากรอกข้อมูลรายการ ราคา กลุ่ม และหน่วยให้ครบถ้วน');
        }

        const newProd = { id: Date.now(), name, price, group, unit };
        this.products.push(newProd);
        this.saveProducts();

        // Reset inputs
        nameInput.value = '';
        priceInput.value = '';
        if (groupSelect.value === 'new') {
            newGroupInput.value = '';
            newGroupInput.style.display = 'none';
            groupSelect.value = 'สัตว์เลี้ยง';
        }
        if (unitSelect.value === 'custom') {
            customUnitInput.value = '';
            customUnitInput.style.display = 'none';
            unitSelect.value = 'ตัว';
        }

        this.renderProducts();
    }

    deleteProduct(product) {
        if (confirm(`คุณต้องการลบ "${product.name}" ออกจากแคตตาล็อกหรือไม่?`)) {
            this.products = this.products.filter(p => p.id !== product.id);
            this.saveProducts();
            this.renderProducts();
        }
    }

    saveProducts() {
        localStorage.setItem('lamay_products', JSON.stringify(this.products));
    }

    saveProductsFromDOM() {
        // Option to synchronize new drag-and-drop order
    }

    // ------------------------------------------------------------------------
    // 6. AUTO-FILL & ACCOUNTING FORM LOGIC
    // ------------------------------------------------------------------------
    selectProductForAccount(product) {
        const detailInput = document.getElementById('expenseDetail');
        const priceInput = document.getElementById('unitPrice');
        const unitSelect = document.getElementById('dynamicUnitSelect');

        if (!detailInput || !priceInput || !unitSelect) return;

        // Auto Populate Data
        detailInput.value = product.name;
        priceInput.value = product.price;

        // Dynamic Unit Injection if not present
        if (!Array.from(unitSelect.options).some(opt => opt.value === product.unit)) {
            unitSelect.add(new Option(product.unit, product.unit));
        }
        unitSelect.value = product.unit;

        // Calculate Total Price
        this.calculateTotal();

        // Auto Mobile Navigation
        if (window.innerWidth < 768) {
            this.switchTab('account');
        }

        // Visual Feedback Effect (Green Glow Highlight)
        detailInput.style.transition = 'background-color 0.4s ease, border 0.4s ease';
        detailInput.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
        detailInput.style.border = '1px solid #10b981';

        setTimeout(() => {
            detailInput.style.backgroundColor = 'var(--bg-color)';
            detailInput.style.border = '1px solid var(--border-color)';
        }, 600);
    }

    onTypeDebounce(inputEl) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            const query = inputEl.value.trim().toLowerCase();
            const box = document.getElementById('priceCompareBox');
            const displayPrice = document.getElementById('marketPriceDisplay');
            const displayUnit = document.getElementById('marketPriceUnit');

            if (!query) {
                if (box) box.style.display = 'none';
                return;
            }

            const match = this.products.find(p => p.name.toLowerCase().includes(query));

            if (match && box) {
                box.style.display = 'flex';
                displayPrice.innerText = match.price.toLocaleString();
                displayUnit.innerText = `฿/${match.unit}`;

                // Fill price automatically if price input is currently empty
                const priceInput = document.getElementById('unitPrice');
                if (priceInput && !priceInput.value) {
                    priceInput.value = match.price;
                    this.calculateTotal();
                }
            } else if (box) {
                box.style.display = 'none';
            }
        }, 350);
    }

    calculateTotal() {
        const price = parseFloat(document.getElementById('unitPrice').value) || 0;
        const qty = parseFloat(document.getElementById('unitQuantity').value) || 0;
        const totalEl = document.getElementById('displayTotal');
        if (totalEl) {
            totalEl.innerText = (price * qty).toLocaleString();
        }
    }

    // ------------------------------------------------------------------------
    // 7. TRANSACTION & LEDGER SYSTEM
    // ------------------------------------------------------------------------
    addEntry(type) {
        const date = document.getElementById('expenseDate').value;
        const detail = document.getElementById('expenseDetail').value.trim();
        const price = parseFloat(document.getElementById('unitPrice').value) || 0;
        const qty = parseFloat(document.getElementById('unitQuantity').value) || 1;
        const unit = document.getElementById('dynamicUnitSelect').value;

        if (!detail || price <= 0) {
            return alert('กรุณากรอกชื่อรายการและราคาให้ถูกต้อง');
        }

        const entry = {
            id: Date.now(),
            type, // 'รายรับ' or 'รายจ่าย'
            date: date || new Date().toISOString().split('T')[0],
            detail,
            price,
            qty,
            unit,
            total: price * qty
        };

        this.transactions.push(entry);
        this.saveTransactions();

        // Clear Form Inputs
        document.getElementById('expenseDetail').value = '';
        document.getElementById('unitPrice').value = '';
        document.getElementById('unitQuantity').value = '1';
        document.getElementById('displayTotal').innerText = '0';
        const compareBox = document.getElementById('priceCompareBox');
        if (compareBox) compareBox.style.display = 'none';

        this.renderHistory();
        this.updateDashboard();
    }

    deleteEntry(id) {
        if (confirm('ยืนยันการลบรายการนี้ออกจากบัญชี?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.renderHistory();
            this.updateDashboard();
        }
    }

    clearAllData() {
        if (confirm('⚠️ คำเตือน: คุณต้องการลบประวัติรายการบัญชีทั้งหมดใช่หรือไม่? (ไม่สามารถกู้คืนได้)')) {
            this.transactions = [];
            this.saveTransactions();
            this.renderHistory();
            this.updateDashboard();
        }
    }

    saveTransactions() {
        localStorage.setItem('lamay_transactions', JSON.stringify(this.transactions));
    }

    // ------------------------------------------------------------------------
    // 8. DASHBOARD & HISTORY RENDERING
    // ------------------------------------------------------------------------
    renderHistory() {
        const tbody = document.getElementById('historyBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        let sorted = [...this.transactions].sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
        let displayList = this.showAllHistory ? sorted : sorted.slice(0, 5);

        document.getElementById('historyCountText').innerText = this.showAllHistory ? 'ประวัติทั้งหมด' : 'ประวัติล่าสุด (5 รายการ)';
        document.getElementById('toggleHistoryBtn').innerText = this.showAllHistory ? 'ย่อกลับ ⬆️' : 'ดูทั้งหมด 📝';

        if (displayList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:15px;">ยังไม่มีรายการบันทึก</td></tr>`;
            return;
        }

        displayList.forEach(t => {
            const isIncome = t.type === 'รายรับ';
            const color = isIncome ? '#059669' : '#dc2626';
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${new Date(t.date).toLocaleDateString('th-TH')}</td>
                <td><strong>${t.detail}</strong><br><small style="color:var(--text-muted)">${t.qty} ${t.unit} x ${t.price}฿</small></td>
                <td style="color:${color}; font-weight:bold;">${isIncome ? '+' : '-'}${t.total.toLocaleString()}</td>
                <td style="text-align:center;">
                    <button onclick="app.deleteEntry(${t.id})" style="background:none; border:none; color:#ef4444; font-size:16px; cursor:pointer;">❌</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    toggleHistoryLimit() {
        this.showAllHistory = !this.showAllHistory;
        this.renderHistory();
    }

    updateDashboard() {
        const income = this.transactions.filter(t => t.type === 'รายรับ').reduce((sum, t) => sum + t.total, 0);
        const expense = this.transactions.filter(t => t.type === 'รายจ่าย').reduce((sum, t) => sum + t.total, 0);
        const net = income - expense;

        document.getElementById('totalIncome').innerText = income.toLocaleString();
        document.getElementById('totalExpense').innerText = expense.toLocaleString();

        const netEl = document.getElementById('netBalance');
        if (netEl) {
            netEl.innerText = net.toLocaleString();
            netEl.style.color = net >= 0 ? '#059669' : '#dc2626';
        }
    }

    // ------------------------------------------------------------------------
    // 9. AI FARM ADVISOR (DRAWER)
    // ------------------------------------------------------------------------
    openAIDrawer() {
        const drawer = document.getElementById('knowledge-drawer');
        const content = document.getElementById('knowledge-content');
        if (!drawer || !content) return;

        const income = this.transactions.filter(t => t.type === 'รายรับ').reduce((sum, t) => sum + t.total, 0);
        const expense = this.transactions.filter(t => t.type === 'รายจ่าย').reduce((sum, t) => sum + t.total, 0);
        const net = income - expense;

        let html = '';

        if (this.transactions.length === 0) {
            html = `👋 <strong>สวัสดีครับ!</strong> ยังไม่มีข้อมูลการทำบัญชีในระบบ ลองกดเลือกสินค้าจากแคตตาล็อกแล้วบันทึกรายรับ-รายจ่าย เพื่อให้ AI ช่วยวิเคราะห์แนวโน้มฟาร์มนะครับ`;
        } else if (net >= 0) {
            html = `
                <div style="color:#059669; font-weight:bold; font-size:16px; margin-bottom:8px;">🎉 ฟาร์มของคุณมีกำไรสุทธิ ${net.toLocaleString()} บาท</div>
                <p>• <strong>รายรับรวม:</strong> ${income.toLocaleString()} บาท</p>
                <p>• <strong>รายจ่ายรวม:</strong> ${expense.toLocaleString()} บาท</p>
                <hr style="border:0; border-top:1px solid var(--border-color); margin:10px 0;">
                💡 <strong>คำแนะนำจาก AI:</strong> กระแสเงินสดของฟาร์มกำลังไปได้ดี! คุณสามารถแบ่งกำไรส่วนนี้ไปต่อยอด เช่น ติดตั้งระบบน้ำ/โซล่าเซลล์ หรือตุนวัตถุดิบอาหารสัตว์ในช่วงที่ราคาลดลงเพื่อลดต้นทุนระยะยาวครับ
            `;
        } else {
            html = `
                <div style="color:#dc2626; font-weight:bold; font-size:16px; margin-bottom:8px;">⚠️ รายจ่ายสูงกว่ารายรับอยู่ ${Math.abs(net).toLocaleString()} บาท</div>
                <p>• <strong>รายรับรวม:</strong> ${income.toLocaleString()} บาท</p>
                <p>• <strong>รายจ่ายรวม:</strong> ${expense.toLocaleString()} บาท</p>
                <hr style="border:0; border-top:1px solid var(--border-color); margin:10px 0;">
                💡 <strong>คำแนะนำจาก AI:</strong> ลองตรวจสอบหมวดหมู่ "วัสดุสิ้นเปลือง" และ "ค่าใช้จ่ายระบบ" ว่าสามารถลดต้นทุนตรงไหนได้บ้าง เช่น การผสมอาหารไก่เอง หรือตรวจสอบการใช้พลังงานในฟาร์มครับ
            `;
        }

        content.innerHTML = html;
        drawer.style.display = 'block';
    }

    closeDrawer() {
        const drawer = document.getElementById('knowledge-drawer');
        if (drawer) drawer.style.display = 'none';
    }function openAIDrawer() { app.openAIDrawer(); }
function closeDrawer() { app.closeDrawer(); }
    
    // ------------------------------------------------------------------------
    // 10. BIND GLOBAL EVENTS & AUTO-FILL ENTER
    // ------------------------------------------------------------------------
    bindEvents() {
        // Toggle Custom Group Input
        const groupSelect = document.getElementById('groupSelect');
        if (groupSelect) {
            groupSelect.onchange = (e) => {
                const newGroupInput = document.getElementById('newGroupName');
                if (newGroupInput) {
                    newGroupInput.style.display = e.target.value === 'new' ? 'block' : 'none';
                }
            };
        }

        // Toggle Custom Unit Input
        const unitSelect = document.getElementById('newItemUnit');
        if (unitSelect) {
            unitSelect.onchange = (e) => {
                const customUnitInput = document.getElementById('customUnitName');
                if (customUnitInput) {
                    customUnitInput.style.display = e.target.value === 'custom' ? 'block' : 'none';
                }
            };
        }

        // ดักจับการกด Enter ในช่องชื่อรายการ เพื่อ Auto-fill ข้อมูลสินค้าอัตโนมัติ
        const itemNameInput = document.getElementById('expenseDetail'); 
        const itemPriceInput = document.getElementById('unitPrice');      
        const itemGroupSelect = document.getElementById('groupSelect');   
        const itemUnitInput = document.getElementById('dynamicUnitSelect'); 

        if (itemNameInput) {
            itemNameInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault(); // ป้องกันไม่ให้ฟอร์ม submit หรือรีหน้าเว็บ
                    
                    let queryName = itemNameInput.value.trim().toLowerCase();
                    
                    if (!queryName) return;

                    // 1. ค้นหาจากรายการผลิตภัณฑ์ในระบบ (this.products) แบบตรงตัว
                    let match = this.products.find(p => p.name.toLowerCase() === queryName);
                    
                    // 2. ถ้ายังไม่เจอ ลองหาแบบมีคำหรือคีย์เวิร์ดใกล้เคียง (.includes)
                    if (!match) {
                        match = this.products.find(p => p.name.toLowerCase().includes(queryName));
                    }
                    
                    if (match) {
                        // เติมราคาอัตโนมัติ
                        if (itemPriceInput) {
                            itemPriceInput.value = match.price;
                            this.calculateTotal(); // คำนวณราคารวมใหม่ทันที
                        }
                        
                        // เติมหน่วยอัตโนมัติ (หากไม่มีในตัวเลือกให้เพิ่มเข้าไปใหม่)
                        if (itemUnitInput) {
                            if (!Array.from(itemUnitInput.options).some(opt => opt.value === match.unit)) {
                                itemUnitInput.add(new Option(match.unit, match.unit));
                            }
                            itemUnitInput.value = match.unit;
                        }
                        
                        // เติมกลุ่มสินค้าอัตโนมัติ
                        if (itemGroupSelect && match.group) {
                            itemGroupSelect.value = match.group;
                        }
                        
                        // เอฟเฟกต์เรืองแสงสีเขียวแจ้งเตือนว่าดึงข้อมูลสำเร็จ
                        itemNameInput.style.transition = 'background-color 0.3s ease, border 0.3s ease';
                        itemNameInput.style.backgroundColor = 'rgba(16, 185, 129, 0.25)';
                        itemNameInput.style.border = '1px solid #10b981';

                        setTimeout(() => {
                            itemNameInput.style.backgroundColor = 'var(--bg-color)';
                            itemNameInput.style.border = '1px solid var(--border-color)';
                        }, 600);
                        
                        console.log("Auto-fill สำเร็จสำหรับ:", match.name);
                    } else {
                        console.log("ไม่พบสินค้าในระบบ สามารถกรอกเพิ่มเองได้เลย");
                    }
                }
            });
        }
    }

// Global Application Instance
const app = new LamayApp();

// Global Helper Functions for HTML Event Attributes
function proceedToAuth() { app.proceedToAuth(); }
function switchAuthMode(mode) { app.switchAuthMode(mode); }
function login() { app.login(); }
function register() { app.register(); }
function executeOneClickLogin() { app.executeOneClickLogin(); }
function resetToFirstTime() { app.resetToFirstTime(); }
function logout() { app.logout(); }
function switchTab(tab) { app.switchTab(tab); }
function selectProductById(id) { app.selectProductById(id); }
function addNewProduct() { app.addNewProduct(); }
function onTypeDebounce(el) { app.onTypeDebounce(el); }
function calculateTotal() { app.calculateTotal(); }
function addEntry(type) { app.addEntry(type); }
function toggleHistoryLimit() { app.toggleHistoryLimit(); }
function clearAllData() { app.clearAllData(); }
function openAIDrawer() { app.openAIDrawer(); }
function closeDrawer() { app.closeDrawer(); }
