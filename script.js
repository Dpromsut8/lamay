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
    "ไก่ไข่": "การเลี้ยงไก่ไข่ประกอบด้วย 3 ส่วนหลัก ได้แก่ <strong>การจัดการโรงเรือนและอาหาร</strong>, <strong>การดูแลสุขภาพ</strong>, และ <strong>ต้นทุนราคาพันธุ์สัตว์</strong> ควรมีพื้นที่ให้ไก่เดินเพื่อลดความเครียด และให้แสงสว่าง 14-16 ชั่วโมง/วัน",
    "ปลานิล": "ปลานิลเป็นปลาที่โตไว เลี้ยงง่าย ทนทานต่อสภาพน้ำ แนะนำให้เลี้ยงในบ่อดินลึก 1-1.5 เมตร อัตราปล่อย 3-5 ตัว/ตร.ม.",
    "มะกรูด": "มะกรูดชอบแสงแดดจัดและน้ำปานกลาง ไม่ชอบน้ำขัง ขยายพันธุ์ด้วยการตอนกิ่ง ระวังหนอนชอนใบ",
    "เห็ด": "การเพาะเห็ดนางฟ้า/นางรม ควรทำในโรงเรือนรักษาความชื้น 70-80% อากาศถ่ายเทสะดวก รดน้ำเช้า-เย็น เก็บผลผลิตได้ใน 7-10 วัน"
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

function switchAuthMode(mode) {
    const loginPage = document.getElementById("login-page");
    const regPage = document.getElementById("register-page");
    
    if (mode === 'login') {
        if(loginPage) loginPage.style.display = "block";
        if(regPage) regPage.style.display = "none";
    } else {
        if(loginPage) loginPage.style.display = "none";
        if(regPage) regPage.style.display = "block";
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

function login() {
    const nameInput = document.getElementById("loginNameInput").value.trim();
    const passInput = document.getElementById("loginPassInput").value;
    const savedUser = JSON.parse(localStorage.getItem('farmUser'));

    const isValidRegisteredUser = savedUser && savedUser.name === nameInput && savedUser.pass === passInput;
    const isDefaultAdmin = (nameInput === "admin" && passInput === "1234");

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
    initCollapsibleAddItem();
}

function onManualUnitChange(selectedUnit) {
    currentSelectedUnit = selectedUnit;
}

function updateUnitLabels(unit) {
    currentSelectedUnit = unit || "หน่วย";
    const unitSelect = document.getElementById("dynamicUnitSelect");
    if (unitSelect) {
        let found = false;
        for (let i = 0; i < unitSelect.options.length; i++) {
            if (unitSelect.options[i].value === currentSelectedUnit) {
                unitSelect.selectedIndex = i;
                found = true;
                break;
            }
        }
        if (!found) {
            const opt = document.createElement("option");
            opt.value = currentSelectedUnit;
            opt.innerText = currentSelectedUnit;
            unitSelect.appendChild(opt);
            unitSelect.value = currentSelectedUnit;
        }
    }
}

function initCollapsibleAddItem() {
    const itemNameInput = document.getElementById('newItemName');
    if (!itemNameInput || document.getElementById('collapsible-add-header')) return;

    let container = itemNameInput.parentElement;
    while (container && !container.querySelector('button[onclick*="addNewButton"]')) {
        container = container.parentElement;
        if (!container || container === document.body) break;
    }
    if (!container) container = itemNameInput.parentElement.parentElement;

    const header = document.createElement('div');
    header.id = 'collapsible-add-header';
    header.style.cssText = "background: #1e293b; color: #f8fafc; padding: 12px 16px; border-radius: 12px; cursor: pointer; font-weight: bold; display: flex; justify-content: space-between; align-items: center; margin: 12px 0; border: 1px solid #475569; user-select: none; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); transition: all 0.2s;";
    header.innerHTML = `<span>➕ เพิ่มรายการสินค้าใหม่</span> <span id="add-collapse-arrow" style="color: #94a3b8; font-size: 12px;">▼</span>`;

    const contentBox = document.createElement('div');
    contentBox.id = 'collapsible-add-box';
    contentBox.style.cssText = "display: none; background: #0f172a; padding: 14px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 12px;";

    while (container.firstChild) {
        contentBox.appendChild(container.firstChild);
    }

    const parent = container.parentNode;
    parent.insertBefore(header, container);
    parent.insertBefore(contentBox, container);
    container.remove();

    header.onclick = () => {
        if (contentBox.style.display === "none") {
            contentBox.style.display = "block";
            document.getElementById('add-collapse-arrow').innerText = "▲";
        } else {
            contentBox.style.display = "none";
            document.getElementById('add-collapse-arrow').innerText = "▼";
        }
    };
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

        const groupHtml = `
            <div style="margin-top: 12px; background: #0f172a; border-radius: 10px; border: 1px solid #334155; overflow: hidden;">
                <div id="group-header-${groupId}" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #1e293b; cursor: pointer; user-select: none;">
                    <span style="font-weight: bold; color: #f8fafc; font-size: 14px;">📁 ${title} <span id="arrow-${groupId}" style="font-size: 11px; color: #94a3b8;">▼</span></span>
                    <span style="font-size: 10px; color: #64748b;">(จิ้มค้าง 4 วิ เพื่อลบกลุ่ม)</span>
                </div>
                <div id="${groupId}" class="btn-group" style="display: flex; flex-wrap: wrap; gap: 6px; padding: 10px;"></div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', groupHtml);
        
        setTimeout(() => {
            const headerEl = document.getElementById(`group-header-${groupId}`);
            if (!headerEl) return;
            
            let groupPressTimer;
            let isLongPress = false;

            const startPress = () => {
                isLongPress = false;
                groupPressTimer = setTimeout(() => {
                    isLongPress = true;
                    deleteGroup(groupId);
                }, 4000);
            };

            const cancelPress = () => { clearTimeout(groupPressTimer); };

            headerEl.addEventListener('mousedown', startPress);
            headerEl.addEventListener('mouseup', cancelPress);
            headerEl.addEventListener('touchstart', startPress);
            headerEl.addEventListener('touchend', cancelPress);
            headerEl.addEventListener('touchmove', cancelPress);

            headerEl.addEventListener('click', (e) => {
                if (isLongPress) {
                    e.stopImmediatePropagation();
                    return;
                }
                toggleGroupCollapse(groupId);
            });
        }, 0);
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
                
                btn.style.cssText = `display: flex; justify-content: space-between; align-items: center; background: #1e293b; color: #cbd5e1; border: 1px solid #475569; padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: 0.2s; width: 100%; text-align: left; gap: 6px;`;
                btn.onmouseover = () => btn.style.borderColor = "#60a5fa";
                btn.onmouseout = () => btn.style.borderColor = "#475569";
                
                btn.innerHTML = `
                    <span class="btn-title-text" style="font-size: 12px; font-weight: bold; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${item.name}</span>
                    <span class="btn-price-badge" style="font-size: 10px; background: #334155; padding: 3px 6px; border-radius: 6px; color: #94a3b8; white-space: nowrap;" title="จิ้มค้างเพื่ออัปเดตราคากลาง">${item.marketPrice || 0} ฿/${item.unit || 'หน่วย'}</span>
                `;
                
                // เมื่อคลิกปุ่มสินค้า -> กรอกข้อมูลอัตโนมัติ + เลื่อนหน้าจอไปที่บัญชีฟาร์ม
                btn.onclick = () => {
                    const itemUnit = item.unit || "หน่วย";
                    currentSelectedUnit = itemUnit;

                    document.getElementById("expenseDetail").value = item.name;
                    document.getElementById("unitPrice").value = item.marketPrice || ""; 
                    document.getElementById("unitQuantity").value = 1;
                    
                    displayPriceComparison(item.name, item.marketPrice || 0, itemUnit);
                    updateUnitLabels(itemUnit);
                    calculateTotal();
                    
                    const cleanName = item.name.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
                    fetchGoogleKnowledgeData(cleanName, item.name);
                    
                    // สั่งเลื่อนหน้าจออัตโนมัติไปยังส่วนบัญชีฟาร์มด้านขวา
                    const accountPanel = document.querySelector('.account-panel');
                    if (accountPanel) {
                        accountPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                };

                let pressTimer;
                const titleSpan = btn.querySelector('.btn-title-text');
                const priceBadge = btn.querySelector('.btn-price-badge');

                titleSpan.addEventListener('touchstart', () => {
                    pressTimer = setTimeout(() => openEditItemModal(groupId, index), 600);
                });
                titleSpan.addEventListener('touchend', () => clearTimeout(pressTimer));
                titleSpan.oncontextmenu = (e) => { e.preventDefault(); openEditItemModal(groupId, index); };

                priceBadge.addEventListener('touchstart', () => {
                    pressTimer = setTimeout(() => refreshSingleItemPrice(groupId, index), 600);
                });
                priceBadge.addEventListener('touchend', () => clearTimeout(pressTimer));
                priceBadge.oncontextmenu = (e) => { e.preventDefault(); refreshSingleItemPrice(groupId, index); };

                const wrapper = document.createElement("div");
                wrapper.style.cssText = `flex: ${isLongName ? "1 1 100%" : "1 1 calc(50% - 4px)"}; cursor: grab;`;
                wrapper.setAttribute("data-index", index);
                wrapper.appendChild(btn);
                container.appendChild(wrapper);
            }
        });

        if (typeof Sortable !== 'undefined') {
            Sortable.create(container, {
                animation: 150,
                delay: 400,
                delayOnTouchOnly: true,
                touchStartThreshold: 5,
                onEnd: function (evt) {
                    const newOrder = [];
                    container.querySelectorAll('[data-index]').forEach(el => {
                        const originalIndex = parseInt(el.getAttribute('data-index'));
                        newOrder.push(farmDataStorage[groupId][originalIndex]);
                    });
                    farmDataStorage[groupId] = newOrder;
                    localStorage.setItem('farmDataStorage', JSON.stringify(farmDataStorage));
                    renderButtons(filter);
                }
            });
        }
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
        alert(`ℹ️ ไม่พบราคากลางออนไลน์ใหม่ สามารถแก้ไขราคาเองได้โดยจิ้มค้างที่ชื่อปุ่ม`);
    }
}

function openEditItemModal(groupId, index) {
    const item = farmDataStorage[groupId][index];
    const newName = prompt(`⚙️ แก้ไขข้อมูลรายการ:`, item.name);
    if (newName === null) return;

    const newPrice = prompt(`💰 แก้ไขราคากลาง (บาท):`, item.marketPrice || 0);
    if (newPrice === null) return;

    const newUnit = prompt(`📦 แก้ไขหน่วย (เช่น ตัว, กก., ลูก, อัน):`, item.unit || "หน่วย");
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

function addEntry(type) {
    const dateInput = document.getElementById("expenseDate").value;
    const detail = document.getElementById("expenseDetail").value.trim();
    const qty = parseFloat(document.getElementById("unitQuantity").value) || 1;
    const price = parseFloat(document.getElementById("unitPrice").value) || 0;
    
    let total = price * qty;
    if (total === 0) {
        total = parseFloat(document.getElementById("displayTotal").innerText.replace(/,/g, '')) || 0;
    }
    
    if (!dateInput || !detail || total <= 0) return alert("กรุณากรอกข้อมูลและราคาให้ครบถ้วน");

    let formattedDate = dateInput;
    if (dateInput.includes('-')) {
        const parts = dateInput.split('-');
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    const detailWithUnit = `${detail} (${qty} ${currentSelectedUnit})`;

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

function updateTable() {
    const historyBody = document.getElementById("historyBody");
    if (!historyBody) return;
    
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

    const sortedData = [...farmData].sort((a, b) => b.id - a.id);
    const displayData = showAllHistory ? sortedData : sortedData.slice(0, 5);
    
    const historyCountText = document.getElementById("historyCountText");
    if (historyCountText) historyCountText.innerText = showAllHistory ? `ทั้งหมด ${sortedData.length} รายการ` : `รายการใหม่`;

    displayData.forEach(item => {
        const tr = document.createElement("tr");
        const color = item.type === 'รายรับ' ? '#10b981' : '#ef4444';
        const sign = item.type === 'รายรับ' ? '+' : '-';
        const amt = parseFloat(item.amount) || parseFloat(item.total) || 0;
        
        tr.style.borderBottom = "1px solid #334155";
        tr.innerHTML = `
            <td style="color: #94a3b8; font-size: 12px; padding: 6px 4px;">${item.date}</td>
            <td style="text-align: left; padding: 6px 4px;">
                ${item.detail || item.name}<br>
                <span style="font-size: 10px; color: ${color}; font-weight: bold;">${item.type}</span>
            </td>
            <td style="font-weight: bold; color: ${color}; padding: 6px 4px;">${sign}${amt.toLocaleString()}</td>
            <td style="text-align: center; padding: 6px 4px;">
                <button onclick="deleteEntry(${item.id})" style="padding: 2px 5px; font-size: 10px; border-radius: 4px; background: transparent; border: 1px solid #ef4444; color: #ef4444; cursor: pointer;">✖</button>
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
    if (confirm("⚠️ อันตราย: คุณแน่ใจหรือไม่ว่าต้องการล้างประวัติบัญชีทั้งหมด?")) { 
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

function getSmartEmoji(text) {
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu.test(text); 
    if (hasEmoji) return text;
    for (let key in smartMarketData) {
        if (text.includes(key)) return smartMarketData[key].emoji + " " + text;
    }
    return text;
}

async function fetchGoogleKnowledgeData(cleanItemName, rawItemName) {
    if (!rawItemName) return;
    const pureSearchName = rawItemName.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();

    let aiSummaryText = "";
    let foundAI = false;
    
    for (let key in smartAISummaries) {
        if (pureSearchName.includes(key)) {
            aiSummaryText = smartAISummaries[key];
            foundAI = true;
            break;
        }
    }

    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`การดูแลรักษา วิธีนำไปใช้งาน ${pureSearchName}`)}`;

    openKnowledgeDrawer(`💡 ข้อมูล: ${pureSearchName}`, `
        <div style="background: #1e293b; border-radius: 10px; padding: 10px; margin-bottom: 10px; border: 1px solid #334155; color: #f8fafc;">
            <div style="color: #60a5fa; font-weight: bold; margin-bottom: 6px; font-size: 13px;">✨ ข้อมูลภาพรวมโดย AI</div>
            <div id="wiki-summary-content" style="color: #cbd5e1; font-size: 11px; line-height: 1.4;">
                ${foundAI ? aiSummaryText : 'กำลังดึงข้อมูล...'}
            </div>
        </div>
        <a href="${googleSearchUrl}" target="_blank" style="display: block; text-align: center; text-decoration: none; padding: 8px; background: #1e293b; color: #60a5fa; border: 1px solid #475569; border-radius: 8px; font-weight: bold; font-size: 12px;">
            🔍 ค้นหาบน Google เพิ่มเติม
        </a>
    `);
}

function openKnowledgeDrawer(title, htmlContent) {
    const drawer = document.getElementById('knowledge-drawer');
    if (!drawer) return;
    document.getElementById('knowledge-title').textContent = title;
    document.getElementById('knowledge-content').innerHTML = htmlContent;
    drawer.style.display = 'block';
}

function closeDrawer() {
    const drawer = document.getElementById('knowledge-drawer');
    if (drawer) drawer.style.display = 'none';
}
