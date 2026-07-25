if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('Service Worker Registered'))
    .catch((err) => console.log('Service Worker Failed', err));
}

let isAdmin = false;
let showAllHistory = false;
let typingTimer;
const DEBOUNCE_DELAY = 800;
let currentSelectedUnit = "หน่วย";

let farmData = JSON.parse(localStorage.getItem('farmData')) || [];
let farmDataStorage = JSON.parse(localStorage.getItem('farmDataStorage')) || {
    "pets-group": [{name: "🐔 ไก่ไข่", marketPrice: 240, unit: "ตัว"}, {name: "🐟 ปลานิล", marketPrice: 8, unit: "ตัว"}],
    "plants-group": [{name: "🌿 มะกรูด", marketPrice: 20, unit: "ลูก"}, {name: "🍄 เห็ดนางฟ้าภูฐาน", marketPrice: 15, unit: "กก."}, {name: "🌿 ชะอม", marketPrice: 20, unit: "กำ"}],
    "consumable-group": [{name: "🛢️ ปั๊มน้ำอินเวอร์เตอร์ 2 แรงม้า", marketPrice: 2590, unit: "ตัว"}]
};

let groupTitles = JSON.parse(localStorage.getItem('groupTitles')) || {
    "pets-group": "สัตว์เลี้ยง",
    "plants-group": "พืชสวน",
    "consumable-group": "วัสดุสิ้นเปลือง"
};

const smartMarketData = {
    "มะกรูด": { marketPrice: 20, group: "plants-group", emoji: "🌿", unit: "ลูก" },
    "มะนาว": { marketPrice: 4, group: "plants-group", emoji: "🍋", unit: "ลูก" },
    "มะละกอ": { marketPrice: 25, group: "plants-group", emoji: "🥭", unit: "ลูก" },
    "ทุเรียน": { marketPrice: 180, group: "plants-group", emoji: "🌳", unit: "กก." },
    "เห็ด": { marketPrice: 15, group: "plants-group", emoji: "🍄", unit: "กก." },
    "ชะอม": { marketPrice: 20, group: "plants-group", emoji: "🌿", unit: "กำ" },
    "ไก่": { marketPrice: 240, group: "pets-group", emoji: "🐔", unit: "ตัว" },
    "ปลา": { marketPrice: 8, group: "pets-group", emoji: "🐟", unit: "ตัว" },
    "ไข่": { marketPrice: 130, group: "pets-group", emoji: "🥚", unit: "แผง" },
    "อาหาร": { marketPrice: 460, group: "consumable-group", emoji: "🌾", unit: "กระสอบ" },
    "น้ำมัน": { marketPrice: 33, group: "consumable-group", emoji: "🛢️", unit: "ถุง" },
    "สายไฟ": { marketPrice: 680, group: "consumable-group", emoji: "⚡", unit: "ม้วน" },
    "ปั๊มน้ำ": { marketPrice: 2590, group: "consumable-group", emoji: "⚙️", unit: "ตัว" },
    "มาม่า": { marketPrice: 7, group: "consumable-group", emoji: "🍜", unit: "ซอง" }
};

const smartAISummaries = {
    "ไก่ไข่": "การเลี้ยงไก่ไข่ประกอบด้วย 3 ส่วนหลัก ได้แก่ <strong>การจัดการโรงเรือนและอาหาร</strong>, <strong>การดูแลสุขภาพ</strong>, และ <strong>ต้นทุนราคาพันธุ์สัตว์</strong> โดยควรมีพื้นที่ให้ไก่เดินเพื่อลดความเครียด และให้แสงสว่าง 14-16 ชั่วโมง/วัน เพื่อกระตุ้นการออกไข่",
    "ปลานิล": "ปลานิลเป็นปลาที่โตไว เลี้ยงง่าย ทนทานต่อสภาพน้ำ แนะนำให้เลี้ยงในบ่อดินที่มีความลึก 1-1.5 เมตร อัตราการปล่อย 3-5 ตัว/ตร.ม. ใช้อาหารเม็ดลอยน้ำร่วมกับพืชน้ำเพื่อลดต้นทุน",
    "มะกรูด": "มะกรูดชอบแสงแดดจัดและน้ำปานกลาง ไม่ชอบน้ำขัง นิยมขยายพันธุ์ด้วยการตอนกิ่ง โรคที่ต้องระวังคือหนอนชอนใบ ควรตัดแต่งกิ่งสม่ำเสมอเพื่อให้แตกยอดใหม่และเก็บใบได้ง่าย",
    "เห็ด": "การเพาะเห็ดนางฟ้า/นางรม ควรทำในโรงเรือนที่รักษาความชื้นได้ 70-80% อากาศถ่ายเทสะดวก ไม่โดนแสงแดดโดยตรง รดน้ำเป็นละอองฝอยเช้า-เย็น สามารถเก็บผลผลิตได้ใน 7-10 วันหลังเปิดดอก"
};

window.onload = () => {
    document.getElementById("auth-wrapper").style.display = "block";
    document.getElementById("app-page").style.display = "none";
    checkAndUpdateDailyMarketPrices();
};

function checkAndUpdateDailyMarketPrices() {
    const todayStr = new Date().toDateString();
    const lastUpdateDate = localStorage.getItem('lastMarketUpdateDate');

    if (lastUpdateDate !== todayStr) {
        for (let groupId in farmDataStorage) {
            farmDataStorage[groupId].forEach(item => {
                for (let key in smartMarketData) {
                    if (item.name.includes(key)) {
                        item.marketPrice = smartMarketData[key].marketPrice;
                        item.unit = smartMarketData[key].unit;
                    }
                }
            });
        }
        localStorage.setItem('farmDataStorage', JSON.stringify(farmDataStorage));
        localStorage.setItem('lastMarketUpdateDate', todayStr);
    }
}

// แก้ไขฟังก์ชันนี้ให้ทำงานได้ถูกต้อง (สลับหน้าล็อกอิน/สมัครสมาชิก)
function switchAuthMode(mode) {
    const loginBox = document.getElementById("login-box") || document.querySelector(".login-box");
    const regBox = document.getElementById("reg-box") || document.querySelector(".reg-box");
    
    // หากมี ID ตรงตามที่ตั้งไว้ใน HTML ให้สลับการแสดงผล
    if (mode === 'login') {
        if(loginBox) loginBox.style.display = "block";
        if(regBox) regBox.style.display = "none";
    } else {
        if(loginBox) loginBox.style.display = "none";
        if(regBox) regBox.style.display = "block";
    }
}

function register() {
    const name = document.getElementById("regNameInput").value.trim();
    const pass = document.getElementById("regPassInput").value;
    const confirmPass = document.getElementById("regConfirmPassInput").value;

    if (!name || !pass) return alert("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านให้ครบถ้วน");
    if (pass !== confirmPass) return alert("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน!");

    localStorage.setItem('farmUser', JSON.stringify({ name, pass }));
    alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
    switchAuthMode('login');
}

// รวมฟังก์ชัน login ให้เหลืออันเดียว และตรวจสอบสิทธิ์ Admin อย่างเข้มงวด
function login() {
    const nameInput = document.getElementById("loginNameInput").value.trim();
    const passInput = document.getElementById("loginPassInput").value;
    const savedUser = JSON.parse(localStorage.getItem('farmUser'));

    const isValidRegisteredUser = savedUser && savedUser.name === nameInput && savedUser.pass === passInput;
    const isDefaultAdmin = (nameInput === "admin" && passInput === "Lamay@2026");

    if (isValidRegisteredUser || isDefaultAdmin) {
        isAdmin = true;
        document.getElementById("auth-wrapper").style.display = "none";
        document.getElementById("app-page").style.display = "block";
        document.getElementById("displayName").innerText = isValidRegisteredUser ? savedUser.name : "ผู้ดูแลระบบ (Admin)";
        initApp();
    } else {
        alert("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง!");
    }
}

function logout() { location.reload(); }

function initApp() {
    const expenseDateEl = document.getElementById('expenseDate');
    if (expenseDateEl) expenseDateEl.valueAsDate = new Date();
    
    removeEmptyGroups();
    renderGroupContainers();
    renderButtons();
    updateGroupSelectOptions();
    updateTable();
    fixPriceLabels();
    initCollapsibleAddItem();
}

function fixPriceLabels() {
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
        if (el.children.length === 0 && el.textContent.includes('ราคาซื้อ/ขาย')) {
            el.innerHTML = el.innerHTML.replace(/ราคาซื้อ\/ขายจริง.*?\b/g, 'ราคาซื้อ/ขาย(บาท/หน่วย)');
            el.innerHTML = el.innerHTML.replace('ราคาซื้อ/ขายจริง (บาท/หน่วย)', 'ราคาซื้อ/ขาย(บาท/หน่วย)');
            el.innerHTML = el.innerHTML.replace('ราคาซื้อ/ขายจริง', 'ราคาซื้อ/ขาย(บาท/หน่วย)');
        }
    });
}

function initCollapsibleAddItem() {
    const itemNameInput = document.getElementById('newItemName');
    if (!itemNameInput || document.getElementById('collapsible-add-box')) return;

    let container = itemNameInput.parentElement;
    while (container && !container.querySelector('button[onclick*="addNewButton"]')) {
        container = container.parentElement;
        if (!container || container === document.body) break;
    }
    if (!container) container = itemNameInput.parentElement.parentElement;

    const header = document.createElement('div');
    header.id = 'collapsible-add-header';
    header.style.cssText = "background: #1e293b; color: #f8fafc; padding: 12px 16px; border-radius: 10px; cursor: pointer; font-weight: bold; display: flex; justify-content: space-between; align-items: center; margin: 15px 0; border: 1px solid #475569; user-select: none;";
    header.innerHTML = `<span>➕ เพิ่มรายการสินค้าใหม่</span> <span id="add-collapse-arrow" style="color: #94a3b8;">▶</span>`;

    const contentBox = document.createElement('div');
    contentBox.id = 'collapsible-add-box';
    contentBox.style.cssText = "display: none; background: #0f172a; padding: 14px; border-radius: 10px; border: 1px solid #334155; margin-bottom: 15px;";

    while (container.firstChild) {
        contentBox.appendChild(container.firstChild);
    }

    header.onclick = () => {
        if (contentBox.style.display === "none") {
            contentBox.style.display = "block";
            document.getElementById('add-collapse-arrow').innerText = "▼";
        } else {
            contentBox.style.display = "none";
            document.getElementById('add-collapse-arrow').innerText = "▶";
        }
    };

    container.appendChild(header);
    container.appendChild(contentBox);
}

function removeEmptyGroups() {
    let modified = false;
    for (let groupId in farmDataStorage) {
        if (farmDataStorage[groupId].length === 0) {
            delete farmDataStorage[groupId];
            delete groupTitles[groupId];
            modified = true;
        }
    }
    if (modified) {
        localStorage.setItem('farmDataStorage', JSON.stringify(farmDataStorage));
        localStorage.setItem('groupTitles', JSON.stringify(groupTitles));
    }
}

function deleteGroup(groupId) {
    if (confirm(`คุณต้องการลบกลุ่ม "${groupTitles[groupId] || groupId}" และสินค้าทั้งหมดในกลุ่มนี้ใช่หรือไม่?`)) {
        delete farmDataStorage[groupId];
        if (groupTitles[groupId]) {
            delete groupTitles[groupId];
            localStorage.setItem('groupTitles', JSON.stringify(groupTitles));
        }
        localStorage.setItem('farmDataStorage', JSON.stringify(farmDataStorage));

        renderGroupContainers();
        renderButtons();
        updateGroupSelectOptions();
    }
}

function renderGroupContainers() {
    removeEmptyGroups(); 
    const container = document.getElementById("groups-container");
    if (!container) return;
    container.innerHTML = "";

    for (let groupId in farmDataStorage) {
        const title = groupTitles[groupId] || groupId.replace('-group', '');
        const deleteGroupBtn = `<button onclick="event.stopPropagation(); deleteGroup('${groupId}')" class="danger-btn" style="padding: 3px 6px; font-size: 10px; border-radius: 4px; border: none; background: #ef4444; color: white; cursor: pointer;">ลบกลุ่ม</button>`;

        const groupHtml = `
            <div style="margin-top: 15px; background: #0f172a; border-radius: 10px; border: 1px solid #334155; overflow: hidden;">
                <div onclick="toggleGroupCollapse('${groupId}')" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #1e293b; cursor: pointer; user-select: none;">
                    <span style="font-weight: bold; color: #f8fafc; font-size: 15px;">📁 ${title} <span id="arrow-${groupId}" style="font-size: 12px; color: #94a3b8;">▼</span></span>
                    ${deleteGroupBtn}
                </div>
                <div id="${groupId}" class="btn-group" style="display: flex; flex-wrap: wrap; gap: 8px; padding: 12px;"></div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', groupHtml);
    }
}

function toggleGroupCollapse(groupId) {
    const groupContent = document.getElementById(groupId);
    const arrow = document.getElementById(`arrow-${groupId}`);
    if (groupContent.style.display === "none") {
        groupContent.style.display = "flex";
        arrow.innerText = "▼";
    } else {
        groupContent.style.display = "none";
        arrow.innerText = "▶";
    }
}

function renderButtons(filter = "") {
    for (let groupId in farmDataStorage) {
        let container = document.getElementById(groupId);
        if (!container) continue;
        container.innerHTML = "";

        farmDataStorage[groupId].forEach((item, index) => {
            if (item.name.toLowerCase().includes(filter.toLowerCase())) {
                const btn = document.createElement("button");
                const isLongName = item.name.length > 15;
                
                btn.style.cssText = `display: flex; justify-content: space-between; align-items: center; background: #1e293b; color: #cbd5e1; border: 1px solid #475569; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; width: 100%; text-align: left; gap: 8px;`;
                btn.onmouseover = () => btn.style.borderColor = "#60a5fa";
                btn.onmouseout = () => btn.style.borderColor = "#475569";
                
                btn.innerHTML = `
                    <span class="btn-title-text" style="font-size: 13px; font-weight: bold; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${item.name}</span>
                    <span class="btn-price-badge" style="font-size: 11px; background: #334155; padding: 4px 8px; border-radius: 6px; color: #94a3b8; white-space: nowrap;" title="จิ้มค้างเพื่ออัปเดตราคากลางใหม่">${item.marketPrice || 0} ฿/${item.unit || 'หน่วย'}</span>
                `;
                
                btn.onclick = () => {
                    const itemUnit = item.unit || "หน่วย";
                    currentSelectedUnit = itemUnit;

                    document.getElementById("expenseDetail").value = item.name;
                    document.getElementById("unitPrice").value = ""; 
                    document.getElementById("unitQuantity").value = 1;
                    
                    displayPriceComparison(item.name, item.marketPrice || 0, itemUnit);
                    updateUnitLabels(itemUnit);
                    calculateTotal();
                    
                    const cleanName = item.name.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
                    fetchGoogleKnowledgeData(cleanName, item.name);
                    
                    const accountPanel = document.querySelector('.account-panel');
                    if (accountPanel) {
                        accountPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                };

                let pressTimer;
                const titleSpan = btn.querySelector('.btn-title-text');
                const priceBadge = btn.querySelector('.btn-price-badge');

                titleSpan.addEventListener('touchstart', (e) => {
                    pressTimer = setTimeout(() => openEditItemModal(groupId, index), 600);
                });
                titleSpan.addEventListener('touchend', () => clearTimeout(pressTimer));
                titleSpan.oncontextmenu = (e) => { e.preventDefault(); openEditItemModal(groupId, index); };

                priceBadge.addEventListener('touchstart', (e) => {
                    pressTimer = setTimeout(() => refreshSingleItemPrice(groupId, index), 600);
                });
                priceBadge.addEventListener('touchend', () => clearTimeout(pressTimer));
                priceBadge.oncontextmenu = (e) => { e.preventDefault(); refreshSingleItemPrice(groupId, index); };

                const wrapper = document.createElement("div");
                wrapper.style.flex = isLongName ? "1 1 100%" : "1 1 calc(50% - 4px)";
                wrapper.appendChild(btn);
                container.appendChild(wrapper);
            }
        });
    }
}

function refreshSingleItemPrice(groupId, index) {
    const item = farmDataStorage[groupId][index];
    let foundNewPrice = false;

    for (let key in smartMarketData) {
        if (item.name.includes(key)) {
            item.marketPrice = smartMarketData[key].marketPrice;
            item.unit = smartMarketData[key].unit;
            foundNewPrice = true;
            break;
        }
    }

    localStorage.setItem('farmDataStorage', JSON.stringify(farmDataStorage));
    renderButtons();
    
    if (foundNewPrice) {
        alert(`🔄 อัปเดตราคากลางของ "${item.name}" เป็น ${item.marketPrice} บาท เรียบร้อยแล้ว!`);
    } else {
        alert(`ℹ️ ไม่พบราคากลางออนไลน์ใหม่สำหรับรายการนี้ สามารถแก้ไขราคาเองได้โดยการจิ้มค้างที่ชื่อปุ่ม`);
    }
}

function openEditItemModal(groupId, index) {
    const item = farmDataStorage[groupId][index];
    const newName = prompt(`⚙️ แก้ไขข้อมูลรายการ:\n(สามารถเปลี่ยนชื่อ โมเดล หรือรายละเอียดได้)`, item.name);
    if (newName === null) return;

    const newPrice = prompt(`💰 แก้ไขราคากลาง (บาท):`, item.marketPrice || 0);
    if (newPrice === null) return;

    const newUnit = prompt(`📦 แก้ไขหน่วย (เช่น ตัว, กก., ลูก, อัน, กระสอบ):`, item.unit || "หน่วย");
    if (newUnit === null) return;

    item.name = getSmartEmoji(newName.trim());
    item.marketPrice = parseFloat(newPrice) || 0;
    item.unit = newUnit.trim() || "หน่วย";

    localStorage.setItem('farmDataStorage', JSON.stringify(farmDataStorage));
    renderButtons();
    updateGroupSelectOptions();
    alert("✨ บันทึกการแก้ไขเรียบร้อยแล้ว!");
}

function filterButtons(query) { renderButtons(query); }

function updateGroupSelectOptions() {
    const select = document.getElementById("groupSelect");
    if (!select) return;
    select.innerHTML = "";
    
    for (let groupId in farmDataStorage) {
        const title = groupTitles[groupId] || groupId.replace('-group', '');
        const option = document.createElement("option");
        option.value = groupId;
        option.innerText = `กลุ่ม: ${title}`;
        select.appendChild(option);
    }
    
    const newOpt = document.createElement("option");
    newOpt.value = "new";
    newOpt.innerText = "-- สร้างกลุ่มใหม่ --";
    select.appendChild(newOpt);
}

function toggleNewGroupInput(val) { 
    const groupNameEl = document.getElementById('newGroupName');
    if (groupNameEl) groupNameEl.style.display = (val === 'new') ? 'block' : 'none'; 
}

function toggleCustomUnitInput(val) {
    const customInput = document.getElementById("customUnitName");
    if (customInput) customInput.style.display = (val === 'custom') ? 'block' : 'none';
}

function addNewButton() {
    const rawName = document.getElementById("newItemName").value.trim();
    const marketPrice = parseFloat(document.getElementById("newItemMarketPrice").value) || 0;
    let unitVal = document.getElementById("newItemUnit").value;
    let groupVal = document.getElementById("groupSelect").value;

    if (unitVal === "custom") {
        unitVal = document.getElementById("customUnitName").value.trim() || "หน่วย";
    }

    if (!rawName) return alert("กรุณากรอกชื่อรายการ");

    const name = getSmartEmoji(rawName);

    if (groupVal === "new") {
        const customName = document.getElementById("newGroupName").value.trim();
        if (!customName) return alert("กรุณาตั้งชื่อกลุ่มใหม่");
        
        groupVal = "group-" + Date.now();
        groupTitles[groupVal] = customName;
        localStorage.setItem('groupTitles', JSON.stringify(groupTitles));
        farmDataStorage[groupVal] = [];
    }

    if(!farmDataStorage[groupVal]) farmDataStorage[groupVal] = [];
    farmDataStorage[groupVal].push({ name, marketPrice, unit: unitVal });
    localStorage.setItem('farmDataStorage', JSON.stringify(farmDataStorage));
    
    renderGroupContainers();
    renderButtons();
    updateGroupSelectOptions();
    
    document.getElementById("newItemName").value = "";
    document.getElementById("newItemMarketPrice").value = "";
    document.getElementById("customUnitName").value = "";
    document.getElementById("customUnitName").style.display = "none";
    document.getElementById("newGroupName").value = "";
    document.getElementById("newGroupName").style.display = "none";
}

// ลบ addEntry ที่ซ้ำกันออกทั้งหมด และรวมให้สมบูรณ์ในฟังก์ชันเดียว
function addEntry(type) {
    const dateInput = document.getElementById("expenseDate").value;
    const detail = document.getElementById("expenseDetail").value.trim();
    const qty = parseFloat(document.getElementById("unitQuantity").value) || 1;
    const price = parseFloat(document.getElementById("unitPrice").value) || 0;
    
    // คำนวณราคารวม
    let total = price * qty;
    if (total === 0) {
        total = parseFloat(document.getElementById("displayTotal").innerText.replace(/,/g, '')) || 0;
    }
    
    if (!dateInput || !detail || total <= 0) return alert("กรุณากรอกข้อมูลและราคาให้ครบถ้วน");

    // จัดรูปแบบวันที่เป็น ว/ด/ป (ถ้าผู้ใช้ป้อนจาก input type="date")
    let formattedDate = dateInput;
    if (dateInput.includes('-')) {
        const parts = dateInput.split('-');
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    const detailWithUnit = `${detail} (${qty} ${currentSelectedUnit})`;

    // ใช้ ID (Date.now()) เพื่อให้ลบประวัติได้อย่างแม่นยำ
    farmData.push({ 
        id: Date.now(), 
        date: formattedDate, 
        type: type, 
        detail: detailWithUnit, 
        amount: total 
    });
    
    localStorage.setItem('farmData', JSON.stringify(farmData));
    updateTable();
    
    document.getElementById("expenseDetail").value = "";
    document.getElementById("unitPrice").value = "";
    document.getElementById("unitQuantity").value = "1";
    document.getElementById("displayTotal").innerText = "0";
    
    const compareBox = document.getElementById("priceCompareBox");
    if (compareBox) compareBox.style.display = "none";
    updateUnitLabels("หน่วย");
}

function calculateTotal() { 
    const p = parseFloat(document.getElementById("unitPrice").value) || 0;
    const q = parseFloat(document.getElementById("unitQuantity").value) || 0;
    const displayTotal = document.getElementById("displayTotal");
    if (displayTotal) displayTotal.innerText = (p * q).toLocaleString(); 
}

// ซ่อมแซมและรวม updateTable เพื่อให้เรียงลำดับรายการและแสดง UI ได้สวยงาม
function updateTable() {
    const historyBody = document.getElementById("historyBody");
    if (!historyBody) return;
    
    // เติม ID ให้กับข้อมูลเก่าที่อาจจะยังไม่มี เพื่อกันข้อผิดพลาดตอนลบ
    farmData = farmData.map((item, index) => {
        if (!item.id) item.id = Date.now() + index;
        return item;
    });

    historyBody.innerHTML = "";
    let income = 0, expense = 0;

    farmData.forEach(item => {
        const amount = parseFloat(item.amount) || parseFloat(item.total) || 0;
        if (item.type === 'รายรับ') income += amount;
        else if (item.type === 'รายจ่าย') expense += amount;
    });

    if (document.getElementById("totalIncome")) document.getElementById("totalIncome").innerText = income.toLocaleString();
    if (document.getElementById("totalExpense")) document.getElementById("totalExpense").innerText = expense.toLocaleString();
    if (document.getElementById("netBalance")) document.getElementById("netBalance").innerText = (income - expense).toLocaleString();
    
    const netBalanceEl = document.getElementById("netBalance");
    if(netBalanceEl) netBalanceEl.style.color = (income - expense) >= 0 ? "#10b981" : "#ef4444";

    // เรียงประวัติจากล่าสุด (ID มากสุด) ไปหาเก่าสุด
    const sortedData = [...farmData].sort((a, b) => b.id - a.id);
    const displayData = showAllHistory ? sortedData : sortedData.slice(0, 5);
    
    const historyCountText = document.getElementById("historyCountText");
    if (historyCountText) historyCountText.innerText = showAllHistory ? `ทั้งหมด ${sortedData.length} รายการ` : `5 รายการล่าสุด`;

    displayData.forEach(item => {
        const tr = document.createElement("tr");
        const color = item.type === 'รายรับ' ? '#10b981' : '#ef4444';
        const sign = item.type === 'รายรับ' ? '+' : '-';
        const amt = parseFloat(item.amount) || parseFloat(item.total) || 0;
        
        tr.style.borderBottom = "1px solid #334155";
        tr.innerHTML = `
            <td style="color: #94a3b8; font-size: 13px; padding: 8px 4px;">${item.date}</td>
            <td style="text-align: left; padding: 8px 4px;">
                ${item.detail || item.name}<br>
                <span style="font-size: 11px; color: ${color}; font-weight: bold;">
                    ${item.type}
                </span>
            </td>
            <td style="font-weight: bold; color: ${color}; padding: 8px 4px;">
                ${sign}${amt.toLocaleString()}
            </td>
            <td style="text-align: center; padding: 8px 4px;">
                <button onclick="deleteEntry(${item.id})" style="padding: 3px 6px; font-size: 11px; border-radius: 4px; background: transparent; border: 1px solid #ef4444; color: #ef4444; cursor: pointer;">✖</button>
            </td>
        `;
        historyBody.appendChild(tr);
    });
}

function toggleHistoryLimit() {
    showAllHistory = !showAllHistory;
    const btn = document.getElementById("toggleHistoryBtn");
    if (btn) btn.innerText = showAllHistory ? "ดูแค่ 5 รายการล่าสุด 📝" : "ดูประวัติทั้งหมด 📝";
    updateTable();
}

function deleteEntry(id) { 
    if (confirm("ต้องการลบประวัติรายการนี้ใช่หรือไม่?")) {
        farmData = farmData.filter(item => item.id !== id);
        localStorage.setItem('farmData', JSON.stringify(farmData)); 
        updateTable(); 
    }
}

function clearAllData() { 
    if (confirm("⚠️ อันตราย: คุณแน่ใจหรือไม่ว่าต้องการล้างประวัติบัญชี 'ทั้งหมด'?\n(ข้อมูลที่ลบไปแล้วจะไม่สามารถกู้คืนได้)")) { 
        farmData = [];
        localStorage.removeItem('farmData');
        updateTable();
        alert("ล้างข้อมูลบัญชีเรียบร้อยแล้ว"); 
    } 
}

function onTypeDebounce(inputElement) {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        const query = inputElement.value.trim();
        if (query.length >= 1) handleRealtimeSearch(query);
    }, DEBOUNCE_DELAY);
}

function handleRealtimeSearch(query) {
    const cleanName = query.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
    
    let matchedData = null;
    for (let key in smartMarketData) {
        if (cleanName.includes(key)) {
            matchedData = smartMarketData[key];
            break;
        }
    }

    const currentMarketPrice = matchedData ? matchedData.marketPrice : 0;
    const matchedUnit = matchedData ? matchedData.unit : "หน่วย";
    
    currentSelectedUnit = matchedUnit;
    updateUnitLabels(matchedUnit);
    displayPriceComparison(query, currentMarketPrice, matchedUnit);
    fetchGoogleKnowledgeData(cleanName, query);
}

function displayPriceComparison(itemName, marketPrice, unit) {
    const compareBox = document.getElementById("priceCompareBox");
    if (!compareBox) return;

    if (document.getElementById("marketPriceDisplay")) document.getElementById("marketPriceDisplay").innerText = marketPrice || 0;
    const unitText = unit ? `฿/${unit}` : `฿`;
    if (document.getElementById("marketPriceUnit")) document.getElementById("marketPriceUnit").innerText = unitText;

    if (marketPrice > 0) {
        compareBox.style.display = "flex";
    } else {
        compareBox.style.display = "none";
    }
}

function updateUnitLabels(unit) {
    if (document.getElementById("unitPriceLabel")) document.getElementById("unitPriceLabel").innerText = `บาท/${unit}`;
    if (document.getElementById("unitQtyLabel")) document.getElementById("unitQtyLabel").innerText = unit;
}

function getSmartEmoji(text) {
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu.test(text); 
    if (hasEmoji) return text;
    for (let key in smartMarketData) {
        if (text.includes(key)) return smartMarketData[key].emoji + " " + text;
    }
    return text; // เอาอีโมจิ 🌱 เริ่มต้นออกตามโค้ดเวอร์ชันล่าสุดของคุณ
}

function fetchGoogleKnowledgeData(cleanItemName, rawItemName) {
    if (!rawItemName) return;

    const pureSearchName = rawItemName.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu, '').trim();

    let aiSummaryText = "ระบบกำลังรวบรวมข้อมูลแนวทางการดูแลและจัดการผลผลิตนี้ คุณสามารถค้นหาข้อมูลเชิงลึกเพิ่มเติมได้จากแหล่งข้อมูลภายนอก";
    let foundAI = false;
    
    for (let key in smartAISummaries) {
        if (pureSearchName.includes(key)) {
            aiSummaryText = smartAISummaries[key];
            foundAI = true;
            break;
        }
    }

    if(!foundAI) {
        aiSummaryText = "ไม่พบข้อมูล AI สรุปสำหรับรายการนี้ แต่สามารถระบุราคาและจำนวนเพื่อบันทึกบัญชีได้ปกติ";
    }

    const searchQuery = encodeURIComponent(`การดูแลรักษา การเลี้ยงดู การบำรุง หรือวิธีนำไปใช้งานที่ถูกต้อง ${pureSearchName}`);
    const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;

    const contentHtml = `
        <div style="background: #f8fafc; border-radius: 10px; padding: 12px; margin-bottom: 12px; border: 1px solid #e2e8f0;">
            <div style="display: flex; align-items: center; gap: 8px; color: #2563eb; font-weight: bold; margin-bottom: 8px; font-size: 14px;">
                <span style="font-size: 16px;">✨</span> ข้อมูลภาพรวมโดย AI
            </div>
            <div style="color: #334155; font-size: 12px; line-height: 1.5;">
                ${aiSummaryText}
            </div>
        </div>
        
        <a href="${googleSearchUrl}" target="_blank" style="display: block; text-align: center; text-decoration: none; padding: 8px; background: #ffffff; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 6px; font-weight: bold; transition: 0.3s; font-size: 13px;">
            🔍 ดูผลการค้นหาบน Google เพิ่มเติม
        </a>
    `;

    openKnowledgeDrawer(`💡 ข้อมูล: ${pureSearchName}`, contentHtml);
}

function openKnowledgeDrawer(title, htmlContent) {
    const drawer = document.getElementById('knowledge-drawer');
    if (!drawer) return;
    
    const titleElement = document.getElementById('knowledge-title');
    const infoElement = document.getElementById('knowledge-content');
    
    if (titleElement) titleElement.textContent = title;
    if (infoElement) infoElement.innerHTML = htmlContent;
    
    drawer.style.display = 'block';
}

function closeDrawer() {
    const drawer = document.getElementById('knowledge-drawer');
    if (drawer) drawer.style.display = 'none';
}
