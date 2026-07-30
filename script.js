/**
 * ==========================================================
 * 🛠️ script.js - ไฟล์ควบคุมการทำงานหลัก LAMAY Smart Farm & Accounting (Fused Version)
 * ==========================================================
 */

// --- ตัวแปรควบคุมสถานะระบบทั้งหมด ---
let isAdmin = false;
let currentFarmData = JSON.parse(localStorage.getItem('farmDataStorage')) || {
    "spices-group": [{name: "🌿 มะกรูด", marketPrice: 20, unit: "ลูก"}],
    "pets-group": [{name: "🐔 ไก่ไข่", marketPrice: 240, unit: "ตัว", price: 240}],
    "plants-group": [{name: "🍄 เห็ด", marketPrice: 15, unit: "กก.", price: 15}],
    "consumable-group": [{name: "🛢️ น้ำมัน", marketPrice: 33, unit: "ถุง", price: 33}]
};

let expenseHistory = JSON.parse(localStorage.getItem('lamay_expenseHistory')) || [];
let showAllHistory = false;
let searchKeyword = '';
let typingTimer;
const DEBOUNCE_DELAY = 800;
let currentSelectedUnit = "หน่วย";

// ฐานข้อมูลราคากลางอ้างอิงและอีโมจิอัตโนมัติ
const marketPricesDB = {
    "มะกรูด": { marketPrice: 20, emoji: "🌿", unit: "ลูก", group: "spices-group" },
    "มะนาว": { marketPrice: 4, emoji: "🍋", unit: "ลูก", group: "fruits-group" },
    "มะละกอ": { marketPrice: 25, emoji: "🥭", unit: "ลูก", group: "fruits-group" },
    "ทุเรียน": { marketPrice: 180, emoji: "🌳", unit: "กก.", group: "plants-group" },
    "เห็ด": { marketPrice: 15, emoji: "🍄", unit: "กก.", group: "plants-group" },
    "ชะอม": { marketPrice: 20, emoji: "🌿", unit: "กำ", group: "leaves-group" },
    "ไก่": { marketPrice: 240, emoji: "🐔", unit: "ตัว", group: "pets-group" },
    "ปลา": { marketPrice: 8, emoji: "🐟", unit: "ตัว", group: "pets-group" },
    "ไข่": { marketPrice: 130, emoji: "🥚", unit: "แผง", group: "pets-group" },
    "อาหาร": { marketPrice: 460, emoji: "🌾", unit: "กระสอบ", group: "consumable-group" },
    "น้ำมัน": { marketPrice: 33, emoji: "🛢️", unit: "ถุง", group: "consumable-group" },
    "สายไฟ": { marketPrice: 680, emoji: "⚡", unit: "ม้วน", group: "consumable-group" },
    "ปั๊มน้ำ": { marketPrice: 2590, emoji: "⚙️", unit: "ตัว", group: "consumable-group" }
};

// ฐานข้อมูลความรู้ (Knowledge Base สำหรับ Drawer)
const knowledgeBase = {
    "ไก่ไข่": { title: "🐔 การเลี้ยงไก่ไข่", info: "ควรให้อาหารโปรตีน 16-18% เพื่อการเจริญเติบโต และเสริมแคลเซียมเพื่อสร้างเปลือกไข่ให้แข็งแรง" },
    "ปลานิล": { title: "🐟 การเลี้ยงปลานิล", info: "ควบคุมคุณภาพน้ำ pH 6.5-8.5 ให้อาหารเช้า-เย็นอย่างเป็นเวลา" },
    "ชะอม": { title: "🌿 ประโยชน์ของชะอม", info: "มีเบต้าแคโรทีนสูง ช่วยบำรุงสายตา และทนทานต่อสภาพอากาศได้ดี" },
    "ทุเรียน": { title: "🌳 การดูแลทุเรียน", info: "ชอบดินร่วนซุย ระบายน้ำดี ต้องการน้ำสม่ำเสมอในช่วงติดผลแรก" }
};

// เริ่มต้นการทำงานเมื่อหน้าเว็บโหลดเสร็จ
window.onload = () => {
    // ตรวจสอบว่าระบบ Login ถูกใช้งานหรือไม่ ถ้ามีหน้า Login ให้รอผู้ใช้กด Login ก่อน
    const loginPage = document.getElementById('login-page');
    if (!loginPage) {
        initApp();
    }
};

function login() {
    const name = document.getElementById("nameInput").value;
    const pass = document.getElementById("passInput").value;
    if(pass === "1234") {
        isAdmin = true;
        document.getElementById("login-page").style.display = "none";
        document.getElementById("app-page").style.display = "block";
        const displayName = document.getElementById("displayName");
        if (displayName) displayName.innerText = name || "ผู้ใช้งาน";
        initApp();
    } else { 
        alert("รหัสผ่านไม่ถูกต้อง!"); 
    }
}

function logout() { 
    location.reload(); 
}

function initApp() {
    // กำหนดวันที่ปัจจุบันให้ช่องกรอกวันที่อัตโนมัติ
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('expenseDate');
    if (dateInput) dateInput.value = today;

    renderGroupSelect();
    renderGroupsContainer();
    updateAccountingSummary();
    renderHistoryTable();
}

// ==========================================
// 1. จัดการกลุ่มสินค้า & ฟอร์ม & Tab Switcher
// ==========================================
function switchTab(tabName) {
    const menuPanel = document.getElementById("menu-panel");
    const accountPanel = document.getElementById("account-panel");
    const btnMenu = document.getElementById("tab-btn-menu");
    const btnAccount = document.getElementById("tab-btn-account");

    if (!menuPanel || !accountPanel) return;

    if (tabName === 'menu') {
        menuPanel.classList.add("active-section");
        accountPanel.classList.remove("active-section");
        if (btnMenu) btnMenu.classList.add("active");
        if (btnAccount) btnAccount.classList.remove("active");
    } else {
        accountPanel.classList.add("active-section");
        menuPanel.classList.remove("active-section");
        if (btnAccount) btnAccount.classList.add("active");
        if (btnMenu) btnMenu.classList.remove("active");
    }
}

function renderGroupSelect() {
    const select = document.getElementById('groupSelect');
    if (!select) return;
    
    const groupNames = {
        "spices-group": "🌿 กลุ่มเครื่องเทศ & สมุนไพร",
        "roots-group": "🥕 กลุ่มราก & หัว",
        "fruits-veg-group": "🥒 กลุ่มผักผล & แตง",
        "leaves-group": "🥬 กลุ่มผักใบ & ยอด",
        "fruits-group": "🍋 กลุ่มผลไม้",
        "mushrooms-group": "🍄 กลุ่มเห็ด",
        "onions-group": "🧅 กลุ่มหอม & กระเทียม",
        "pets-group": "🐔 กลุ่มสัตว์เลี้ยง",
        "plants-group": "🌳 กลุ่มพืชผล & ต้นกล้า",
        "consumable-group": "⚙️ กลุ่มวัสดุสิ้นเปลือง"
    };

    select.innerHTML = '';
    for (let key in currentFarmData) {
        let opt = document.createElement('option');
        opt.value = key;
        opt.textContent = groupNames[key] || key;
        select.appendChild(opt);
    }

    let customOpt = document.createElement('option');
    customOpt.value = 'new_group';
    customOpt.textContent = '+ สร้างกลุ่มสินค้าใหม่...';
    select.appendChild(customOpt);
}

function toggleNewGroupInput(val) {
    const input = document.getElementById('newGroupName');
    if (input) {
        input.style.display = (val === 'new_group' || val === 'new') ? 'block' : 'none';
    }
}

function toggleCustomUnitInput(val) {
    const input = document.getElementById('customUnitName');
    if (input) {
        input.style.display = (val === 'custom') ? 'block' : 'none';
    }
}

function onManualUnitChange(val) {
    currentSelectedUnit = val;
}

// ==========================================
// 2. เรนเดอร์รายการสินค้า & ค้นหา (รวม Sortable & Context Menu)
// ==========================================
function renderGroupsContainer() {
    const container = document.getElementById('groups-container');
    if (!container) return;

    container.innerHTML = '';

    const groupTitles = {
        "spices-group": "🌿 เครื่องเทศ & สมุนไพร",
        "roots-group": "🥕 ราก & หัว",
        "fruits-veg-group": "🥒 ผักผล & แตง",
        "leaves-group": "🥬 ผักใบ & ยอด",
        "fruits-group": "🍋 ผลไม้",
        "mushrooms-group": "🍄 เห็ด",
        "onions-group": "🧅 หอม & กระเทียม",
        "pets-group": "🐔 สัตว์เลี้ยง",
        "plants-group": "🌳 พืชผล & ต้นกล้า",
        "consumable-group": "⚙️ วัสดุสิ้นเปลือง"
    };

    for (let groupKey in currentFarmData) {
        let items = currentFarmData[groupKey];
        if (!Array.isArray(items)) continue;

        let filteredItems = items.filter(item => 
            item.name.toLowerCase().includes(searchKeyword.toLowerCase())
        );

        if (searchKeyword && filteredItems.length === 0) continue;

        let groupDiv = document.createElement('div');
        groupDiv.style.marginBottom = '14px';
        
        let groupTitleText = groupTitles[groupKey] || groupKey.replace('-group', '').replace(/-/g, ' ');
        groupDiv.innerHTML = `
            <div style="font-size: 13px; font-weight: bold; color: var(--accent-color); margin-bottom: 6px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; text-transform: capitalize;">
                ${groupTitleText}
            </div>
            <div class="item-grid-${groupKey}" style="display: flex; flex-wrap: wrap; gap: 6px;" id="grid-${groupKey}"></div>
        `;

        container.appendChild(groupDiv);

        let grid = groupDiv.querySelector(`#grid-${groupKey}`);
        filteredItems.forEach((item, index) => {
            let btn = document.createElement('button');
            btn.type = 'button';
            btn.style.cssText = 'background: var(--item-bg); border: 1px solid var(--border-color); color: var(--text-color); padding: 8px 10px; border-radius: 8px; font-size: 12px; cursor: pointer; text-align: left; flex: 1 1 calc(50% - 6px); display: flex; justify-content: space-between; align-items: center; transition: 0.2s;';
            
            let displayPrice = item.marketPrice !== undefined ? item.marketPrice : (item.price || 0);
            let displayUnit = item.unit || 'หน่วย';
            btn.innerHTML = `<span>${item.name}</span> <span style="color: var(--accent-color); font-size: 11px;">${displayPrice}฿/${displayUnit}</span>`;
            
            btn.onclick = () => {
                selectItemForExpense(item);
                openKnowledge(item.name);
                switchTab('account'); // สลับไปหน้าบัญชีอัตโนมัติบนมือถือ
            };

            // รองรับคลิกขวาเพื่อลบรายการ (โหมดแอดมินหรือทั่วไป)
            btn.oncontextmenu = (e) => {
                e.preventDefault();
                if(confirm(`ต้องการลบ "${item.name}" ใช่หรือไม่?`)) {
                    currentFarmData[groupKey].splice(index, 1);
                    localStorage.setItem('farmDataStorage', JSON.stringify(currentFarmData));
                    renderGroupsContainer();
                }
            };

            grid.appendChild(btn);
        });

        if (typeof Sortable !== 'undefined' && grid) {
            Sortable.create(grid, {
                animation: 150,
                ghostClass: 'sortable-ghost'
            });
        }
    }
}

function filterButtons(keyword) {
    searchKeyword = keyword.trim();
    renderGroupsContainer();
}

// ==========================================
// 3. เพิ่มสินค้าใหม่ + Smart Emoji & Auto Suggest
// ==========================================
function getSmartEmoji(text) {
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu.test(text); 
    if (hasEmoji) return text;
    for (let key in marketPricesDB) {
        if (text.includes(key)) return marketPricesDB[key].emoji + " " + text;
    }
    return text;
}

const smartMarketData = {
    "มะละกอ": { price: 25, group: "fruits-group", unit: "ลูก" },
    "ทุเรียน": { price: 180, group: "plants-group", unit: "กก." },
    "เห็ด": { price: 15, group: "plants-group", unit: "กก." },
    "ชะอม": { price: 20, group: "leaves-group", unit: "กำ" },
    "ไก่": { price: 240, group: "pets-group", unit: "ตัว" },
    "ปลา": { price: 8, group: "pets-group", unit: "ตัว" },
    "ไข่": { price: 130, group: "pets-group", unit: "แผง" },
    "น้ำมัน": { price: 33, group: "consumable-group", unit: "ถุง" }
};

function autoSuggest() {
    const inputEl = document.getElementById("newItemName");
    const priceEl = document.getElementById("newItemMarketPrice") || document.getElementById("newItemPrice");
    const groupSelect = document.getElementById("groupSelect");
    
    if (!inputEl) return;
    const input = inputEl.value.trim();
    if (input.length < 2) return;

    for (let key in smartMarketData) {
        if (input.includes(key)) {
            if (priceEl) priceEl.value = smartMarketData[key].price;
            if (groupSelect) {
                groupSelect.value = smartMarketData[key].group;
                toggleNewGroupInput(smartMarketData[key].group);
            }
            break;
        }
    }
}

function addNewButton() {
    const nameInput = document.getElementById('newItemName');
    const priceInput = document.getElementById('newItemMarketPrice') || document.getElementById('newItemPrice');
    const groupSelect = document.getElementById('groupSelect');
    const newGroupNameInput = document.getElementById('newGroupName');
    const unitSelect = document.getElementById('newItemUnit');
    const customUnitInput = document.getElementById('customUnitName');

    if (!nameInput || !priceInput || !groupSelect) return;

    let rawName = nameInput.value.trim();
    let price = parseFloat(priceInput.value) || 0;
    let targetGroup = groupSelect.value;
    let unit = (unitSelect && unitSelect.value === 'custom') ? (customUnitInput ? customUnitInput.value.trim() || 'หน่วย' : 'หน่วย') : (unitSelect ? unitSelect.value : 'หน่วย');

    if (!rawName) {
        alert('กรุณากรอกชื่อสินค้า');
        return;
    }

    let name = getSmartEmoji(rawName);

    if (targetGroup === 'new_group' || targetGroup === 'new') {
        let newKeyName = newGroupNameInput ? newGroupNameInput.value.trim() : '';
        if (!newKeyName) {
            alert('กรุณาตั้งชื่อกลุ่มสินค้าใหม่');
            return;
        }
        targetGroup = newKeyName.replace(/\s+/g, '-').toLowerCase() + "-group";
    }

    if (!currentFarmData[targetGroup]) {
        currentFarmData[targetGroup] = [];
    }

    currentFarmData[targetGroup].push({ name, marketPrice: price, price: price, unit });
    
    localStorage.setItem('farmDataStorage', JSON.stringify(currentFarmData));

    nameInput.value = '';
    priceInput.value = '';
    if (customUnitInput) customUnitInput.value = '';

    renderGroupSelect();
    renderGroupsContainer();
    alert('✨ เพิ่มสินค้าใหม่สำเร็จ!');
}

// ==========================================
// 4. บันทึกบัญชี & คำนวณอัตโนมัติ (รวม Debounce)
// ==========================================
function selectItemForExpense(item) {
    const detailInput = document.getElementById('expenseDetail');
    const unitPriceInput = document.getElementById('unitPrice');
    const unitQuantityInput = document.getElementById('unitQuantity');
    const unitSelect = document.getElementById('dynamicUnitSelect');
    
    if (detailInput) detailInput.value = item.name;
    let itemPrice = item.marketPrice !== undefined ? item.marketPrice : (item.price || 0);
    if (unitPriceInput) unitPriceInput.value = itemPrice;
    if (unitQuantityInput) unitQuantityInput.value = 1;
    if (unitSelect) unitSelect.value = item.unit || 'หน่วย';
    currentSelectedUnit = item.unit || 'หน่วย';

    displayPriceComparison(item.name, itemPrice, item.unit || 'หน่วย');
    calculateTotal();
}

function onTypeDebounce(el) {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        const query = el.value.trim().toLowerCase();
        if (!query) {
            const compareBox = document.getElementById('priceCompareBox');
            if (compareBox) compareBox.style.display = 'none';
            return;
        }

        let foundItem = null;
        for (let group in currentFarmData) {
            let match = currentFarmData[group].find(i => i.name.toLowerCase().includes(query));
            if (match) {
                foundItem = match;
                break;
            }
        }

        if (foundItem) {
            displayPriceComparison(foundItem.name, foundItem.marketPrice || foundItem.price || 0, foundItem.unit || 'หน่วย');
        } else {
            for (let key in marketPricesDB) {
                if (query.includes(key)) {
                    displayPriceComparison(key, marketPricesDB[key].marketPrice, marketPricesDB[key].unit);
                    break;
                }
            }
        }
    }, DEBOUNCE_DELAY);
}

function displayPriceComparison(itemName, marketPrice, unit) {
    const compareBox = document.getElementById('priceCompareBox');
    const priceDisplay = document.getElementById('marketPriceDisplay');
    const unitDisplay = document.getElementById('marketPriceUnit');

    if (compareBox && priceDisplay) {
        compareBox.style.display = 'flex';
        priceDisplay.textContent = marketPrice;
        if (unitDisplay) unitDisplay.textContent = `฿/${unit || 'หน่วย'}`;
    }
}

function calculateTotal() {
    const price = parseFloat(document.getElementById('unitPrice').value) || 0;
    const qty = parseFloat(document.getElementById('unitQuantity').value) || 0;
    const total = price * qty;

    const displayTotal = document.getElementById('displayTotal');
    if (displayTotal) displayTotal.textContent = total.toLocaleString();
}

function addEntry(type) {
    const date = document.getElementById('expenseDate').value;
    const detail = document.getElementById('expenseDetail').value.trim();
    const price = parseFloat(document.getElementById('unitPrice').value) || 0;
    const qty = parseFloat(document.getElementById('unitQuantity').value) || 1;
    const unitSelect = document.getElementById('dynamicUnitSelect');
    const unit = unitSelect ? unitSelect.value : currentSelectedUnit;
    const amount = price * qty;

    if (!date || !detail || amount <= 0) {
        alert('กรุณากรอกวันที่ รายการ และจำนวนเงินให้ถูกต้อง');
        return;
    }

    const newEntry = {
        id: Date.now(),
        date,
        detail: `${detail} (${qty} ${unit})`,
        amount,
        total: amount, // รองรับทั้งโครงสร้างเก่าและใหม่
        type
    };

    expenseHistory.unshift(newEntry);
    localStorage.setItem('lamay_expenseHistory', JSON.stringify(expenseHistory));

    document.getElementById('expenseDetail').value = '';
    document.getElementById('unitPrice').value = '';
    document.getElementById('unitQuantity').value = '1';
    const displayTotal = document.getElementById('displayTotal');
    if (displayTotal) displayTotal.textContent = '0';
    
    const compareBox = document.getElementById('priceCompareBox');
    if (compareBox) compareBox.style.display = 'none';

    updateAccountingSummary();
    renderHistoryTable();
}

// ==========================================
// 5. สรุปยอดบัญชี, ประวัติ & Wikipedia Knowledge Drawer
// ==========================================
function updateAccountingSummary() {
    let totalIncome = 0;
    let totalExpense = 0;

    expenseHistory.forEach(item => {
        let val = item.amount !== undefined ? item.amount : (parseFloat(item.total) || 0);
        if (item.type === 'รายรับ') {
            totalIncome += val;
        } else {
            totalExpense += val;
        }
    });

    let net = totalIncome - totalExpense;

    const incEl = document.getElementById('totalIncome');
    const expEl = document.getElementById('totalExpense');
    const netEl = document.getElementById('netBalance');

    if (incEl) incEl.textContent = totalIncome.toLocaleString();
    if (expEl) expEl.textContent = totalExpense.toLocaleString();
    if (netEl) {
        netEl.textContent = net.toLocaleString();
        netEl.style.color = net >= 0 ? '#10b981' : '#ef4444';
    }
}

function renderHistoryTable() {
    const tbody = document.getElementById('historyBody');
    const countText = document.getElementById('historyCountText');
    const toggleBtn = document.getElementById('toggleHistoryBtn');
    if (!tbody) return;

    tbody.innerHTML = '';

    let displayList = showAllHistory ? expenseHistory : expenseHistory.slice(0, 5);

    if (countText) countText.textContent = showAllHistory ? `ประวัติทั้งหมด (${expenseHistory.length} รายการ)` : `รายการล่าสุด (แสดง 5 จาก ${expenseHistory.length})`;
    if (toggleBtn) toggleBtn.textContent = showAllHistory ? 'ซ่อนประวัติ 📜' : 'ดูประวัติทั้งหมด 📝';

    if (displayList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted, #94a3b8); padding: 12px;">ยังไม่มีประวัติการทำรายการ</td></tr>`;
        return;
    }

    displayList.forEach((item) => {
        let tr = document.createElement('tr');
        let colorStyle = item.type === 'รายรับ' ? 'color: #10b981;' : 'color: #ef4444;';
        let amountVal = item.amount !== undefined ? item.amount : (parseFloat(item.total) || 0);
        
        let uniqueId = item.id || item.originalIndex || Math.random();

        tr.innerHTML = `
            <td style="padding: 8px; font-size: 12px; border-bottom: 1px solid var(--border-color); color: #94a3b8;">${item.date}</td>
            <td style="padding: 8px; font-size: 12px; border-bottom: 1px solid var(--border-color);">${item.detail} <br><span style="font-size: 10px; ${colorStyle}">${item.type}</span></td>
            <td style="padding: 8px; font-size: 12px; border-bottom: 1px solid var(--border-color); ${colorStyle} font-weight: bold;">${item.type === 'รายรับ' ? '+' : '-'}${amountVal.toLocaleString()} ฿</td>
            <td style="padding: 8px; font-size: 12px; border-bottom: 1px solid var(--border-color); text-align: center;">
                <button onclick="deleteEntry('${uniqueId}')" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px 6px; font-size: 12px; width: auto; margin: 0;">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleHistoryLimit() {
    showAllHistory = !showAllHistory;
    renderHistoryTable();
}

function deleteEntry(id) {
    if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
        expenseHistory = expenseHistory.filter(item => String(item.id) !== String(id) && String(item.originalIndex) !== String(id));
        localStorage.setItem('lamay_expenseHistory', JSON.stringify(expenseHistory));
        updateAccountingSummary();
        renderHistoryTable();
    }
}

// ฟังก์ชันลบแบบ index ตรง (รองรับชุดโค้ดเดิม)
function deleteRecord(index) {
    deleteEntry(index);
}

function clearAllData() {
    if (confirm('⚠️ คำเตือน: คุณต้องการล้างข้อมูลทั้งหมดจริงหรือ? ข้อมูลจะถูกรีเซ็ต')) {
        expenseHistory = [];
        localStorage.clear();
        location.reload();
    }
}

// ระบบ Knowledge Drawer เชื่อมโยง Wikipedia API
async function openKnowledge(rawItemName) {
    const drawer = document.getElementById("knowledge-drawer");
    const title = document.getElementById("knowledge-title");
    const content = document.getElementById("knowledge-content");
    if (!drawer || !title || !content) return;

    const cleanItemName = rawItemName.replace(/[\u1000-\uFFFF]/g, '').trim();

    drawer.style.display = "block";
    title.innerText = `🔍 กำลังค้นหา: ${rawItemName}...`;
    content.innerHTML = "<p style='color: #60a5fa;'>กำลังดึงข้อมูล...</p>";

    if (knowledgeBase[cleanItemName]) {
        title.innerText = knowledgeBase[cleanItemName].title;
        content.innerText = knowledgeBase[cleanItemName].info;
        return; 
    }

    try {
        const response = await fetch(`https://th.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanItemName)}`);
        const data = await response.json();
        if (data.type === "standard" && data.extract) {
            title.innerText = `🌐 ${rawItemName}`;
            content.innerText = data.extract; 
        } else {
            title.innerText = `❓ ${rawItemName}`;
            content.innerHTML = `<p style="color: #ef4444;">ไม่พบข้อมูลใน Wikipedia สำหรับคำว่า "${cleanItemName}"</p>`;
        }
    } catch (error) {
        title.innerText = `❌ ข้อผิดพลาด`;
        content.innerText = "ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้";
    }
}

function closeDrawer() {
    const drawer = document.getElementById("knowledge-drawer");
    if (drawer) drawer.style.display = "none";
}
