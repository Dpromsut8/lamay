/**
 * ==========================================================
 * 🛠️ script.js - ไฟล์ควบคุมการทำงานหลัก LAMAY Smart Farm & Accounting
 * ==========================================================
 */

// โหลดข้อมูลหมวดหมู่และรายการสินค้าจาก localStorage หรือใช้ค่าเริ่มต้นจาก database.js
let currentFarmData = JSON.parse(localStorage.getItem('farmDataStorage')) || (typeof farmDataStorage !== 'undefined' ? farmDataStorage : {
    "spices-group": [{name: "🌿 มะกรูด", marketPrice: 20, unit: "ลูก"}],
    "pets-group": [{name: "🐔 ไก่ไข่", marketPrice: 240, unit: "ตัว"}]
});

// ตัวแปรควบคุมสถานะระบบ
let expenseHistory = JSON.parse(localStorage.getItem('lamay_expenseHistory')) || [];
let showAllHistory = false;
let searchKeyword = '';
let typingTimer;
const DEBOUNCE_DELAY = 800;
let currentSelectedUnit = "หน่วย";

// ฐานข้อมูลราคากลางอ้างอิงและอีโมจิอัตโนมัติ
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

// เริ่มต้นการทำงานเมื่อหน้าเว็บโหลดเสร็จ
window.onload = () => {
    initApp();
};

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
// 1. จัดการกลุ่มสินค้า & ฟอร์ม
// ==========================================
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
        input.style.display = (val === 'new_group') ? 'block' : 'none';
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
// 2. เรนเดอร์รายการสินค้า & ค้นหา
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
        groupDiv.innerHTML = `
            <div style="font-size: 13px; font-weight: bold; color: var(--accent-color); margin-bottom: 6px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
                ${groupTitles[groupKey] || groupKey}
            </div>
            <div class="item-grid-${groupKey}" style="display: flex; flex-wrap: wrap; gap: 6px;" id="grid-${groupKey}"></div>
        `;

        container.appendChild(groupDiv);

        let grid = groupDiv.querySelector(`#grid-${groupKey}`);
        filteredItems.forEach((item) => {
            let btn = document.createElement('button');
            btn.type = 'button';
            btn.style.cssText = 'background: var(--item-bg); border: 1px solid var(--border-color); color: var(--text-color); padding: 8px 10px; border-radius: 8px; font-size: 12px; cursor: pointer; text-align: left; flex: 1 1 calc(50% - 6px); display: flex; justify-content: space-between; align-items: center; transition: 0.2s;';
            btn.innerHTML = `<span>${item.name}</span> <span style="color: var(--accent-color); font-size: 11px;">${item.marketPrice || 0}฿/${item.unit || 'หน่วย'}</span>`;
            
            btn.onclick = () => selectItemForExpense(item);
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
// 3. เพิ่มสินค้าใหม่ พร้อมระบบเติมอีโมจิอัจฉริยะ
// ==========================================
function getSmartEmoji(text) {
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu.test(text); 
    if (hasEmoji) return text;
    for (let key in marketPricesDB) {
        if (text.includes(key)) return marketPricesDB[key].emoji + " " + text;
    }
    return text;
}

function addNewButton() {
    const nameInput = document.getElementById('newItemName');
    const priceInput = document.getElementById('newItemMarketPrice');
    const groupSelect = document.getElementById('groupSelect');
    const newGroupNameInput = document.getElementById('newGroupName');
    const unitSelect = document.getElementById('newItemUnit');
    const customUnitInput = document.getElementById('customUnitName');

    if (!nameInput || !priceInput || !groupSelect) return;

    let rawName = nameInput.value.trim();
    let price = parseFloat(priceInput.value) || 0;
    let targetGroup = groupSelect.value;
    let unit = unitSelect.value === 'custom' ? (customUnitInput ? customUnitInput.value.trim() || 'หน่วย' : 'หน่วย') : unitSelect.value;

    if (!rawName) {
        alert('กรุณากรอกชื่อสินค้า');
        return;
    }

    let name = getSmartEmoji(rawName);

    if (targetGroup === 'new_group') {
        let newKeyName = newGroupNameInput ? newGroupNameInput.value.trim() : '';
        if (!newKeyName) {
            alert('กรุณาตั้งชื่อกลุ่มสินค้าใหม่');
            return;
        }
        targetGroup = 'group_' + Date.now();
        currentFarmData[targetGroup] = [];
    }

    if (!currentFarmData[targetGroup]) {
        currentFarmData[targetGroup] = [];
    }

    currentFarmData[targetGroup].push({ name, marketPrice: price, unit });
    
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
    const unitSelect = document.getElementById('dynamicUnitSelect');
    
    if (detailInput) detailInput.value = item.name;
    if (unitPriceInput) unitPriceInput.value = item.marketPrice || 0;
    if (unitSelect) unitSelect.value = item.unit || 'หน่วย';
    currentSelectedUnit = item.unit || 'หน่วย';

    displayPriceComparison(item.name, item.marketPrice || 0, item.unit);
    calculateTotal();
}

function onTypeDebounce(el) {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        const query = el.value.trim().toLowerCase();
        if (!query) {
            document.getElementById('priceCompareBox').style.display = 'none';
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
            displayPriceComparison(foundItem.name, foundItem.marketPrice, foundItem.unit);
        } else {
            // ค้นหาในราคากลางตั้งต้นถ้าไม่มีในกลุ่ม
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
        type
    };

    expenseHistory.unshift(newEntry);
    localStorage.setItem('lamay_expenseHistory', JSON.stringify(expenseHistory));

    document.getElementById('expenseDetail').value = '';
    document.getElementById('unitPrice').value = '';
    document.getElementById('unitQuantity').value = '1';
    
    const compareBox = document.getElementById('priceCompareBox');
    if (compareBox) compareBox.style.display = 'none';

    updateAccountingSummary();
    renderHistoryTable();
}

// ==========================================
// 5. สรุปยอดบัญชี & ประวัติ
// ==========================================
function updateAccountingSummary() {
    let totalIncome = 0;
    let totalExpense = 0;

    expenseHistory.forEach(item => {
        if (item.type === 'รายรับ') {
            totalIncome += item.amount;
        } else {
            totalExpense += item.amount;
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

    displayList.forEach(item => {
        let tr = document.createElement('tr');
        let colorStyle = item.type === 'รายรับ' ? 'color: #10b981;' : 'color: #ef4444;';
        tr.innerHTML = `
            <td style="padding: 8px; font-size: 12px; border-bottom: 1px solid var(--border-color);">${item.date}</td>
            <td style="padding: 8px; font-size: 12px; border-bottom: 1px solid var(--border-color);">${item.detail}</td>
            <td style="padding: 8px; font-size: 12px; border-bottom: 1px solid var(--border-color); ${colorStyle} font-weight: bold;">${item.type === 'รายรับ' ? '+' : '-'}${item.amount.toLocaleString()} ฿</td>
            <td style="padding: 8px; font-size: 12px; border-bottom: 1px solid var(--border-color); text-align: center;">
                <button onclick="deleteEntry(${item.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px 6px; font-size: 12px; width: auto; margin: 0;">🗑️</button>
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
        expenseHistory = expenseHistory.filter(item => item.id !== id);
        localStorage.setItem('lamay_expenseHistory', JSON.stringify(expenseHistory));
        updateAccountingSummary();
        renderHistoryTable();
    }
}

function clearAllData() {
    if (confirm('⚠️ คำเตือน: คุณต้องการล้างประวัติบัญชีทั้งหมดจริงหรือ? ข้อมูลจะถูกลบออกทั้งหมด')) {
        expenseHistory = [];
        localStorage.removeItem('lamay_expenseHistory');
        updateAccountingSummary();
        renderHistoryTable();
        alert('ล้างประวัติเรียบร้อยแล้ว');
    }
}
