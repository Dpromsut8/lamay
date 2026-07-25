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
    "plants-group": [{name: "🌿 มะกรูด", marketPrice: 20, unit: "ลูก"}, {name: "🍄 เห็ด", marketPrice: 15, unit: "กก."}, {name: "🌿 ชะอม", marketPrice: 20, unit: "กำ"}],
    "consumable-group": [{name: "🛢️ ปั๊มน้ำ 2 แรง", marketPrice: 2590, unit: "ตัว"}]
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

const knowledgeBase = {
    "มะกรูด": {
        title: "🌿 การพัฒนาต่อยอด: การปลูกและดูแลมะกรูด",
        info: "มะกรูดชอบดินร่วนซุย ระบายน้ำได้ดี การตลาดสามารถแปรรูปเป็นน้ำมันหอมระเหยหรือใบมะกรูดอบแห้งเพื่อเพิ่มมูลค่าได้"
    },
    "ไก่ไข่": {
        title: "🐔 การพัฒนาต่อยอด: การจัดการฟาร์มไก่ไข่",
        info: "ควบคุมอุณหภูมิโรงเรือนและให้แสงสว่าง 16 ชั่วโมงต่อวันเพื่อกระตุ้นการออกไข่ รวมถึงการทำปุ๋ยอินทรีย์จากมูลไก่"
    },
    "ปลานิล": {
        title: "🐟 การพัฒนาต่อยอด: เทคนิคเลี้ยงปลานิลเศรษฐกิจ",
        info: "ควบคุมคุณภาพน้ำ pH 6.5-8.5 และใช้ระบบหมุนเวียนน้ำเพื่อลดต้นทุนค่าอาหารและเพิ่มความหนาแน่นในการเลี้ยง"
    }
};

window.onload = () => {
    document.getElementById("auth-wrapper").style.display = "block";
    document.getElementById("app-page").style.display = "none";
};

function switchAuthMode(mode) {
    const loginPage = document.getElementById("login-page");
    const registerPage = document.getElementById("register-page");
    if (mode === 'register') {
        loginPage.style.display = "none";
        registerPage.style.display = "flex";
    } else {
        registerPage.style.display = "none";
        loginPage.style.display = "flex";
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
    const isDefaultAdmin = passInput === "1234";

    if (isValidRegisteredUser || isDefaultAdmin) {
        isAdmin = true;
        document.getElementById("auth-wrapper").style.display = "none";
        document.getElementById("app-page").style.display = "block";
        document.getElementById("displayName").innerText = isValidRegisteredUser ? savedUser.name : (nameInput || "ผู้ดูแลระบบ");
        initApp();
    } else {
        alert("ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง!");
    }
}

function logout() { location.reload(); }

function initApp() {
    const expenseDateEl = document.getElementById('expenseDate');
    if (expenseDateEl) expenseDateEl.valueAsDate = new Date();
    
    // ตรวจสอบและเคลียร์กลุ่มที่ไม่มีสินค้าตั้งแต่เริ่มเปิดแอป
    removeEmptyGroups();
    
    renderGroupContainers();
    renderButtons();
    updateGroupSelectOptions();
    updateTable();
}

// ฟังก์ชันตรวจสอบและลบกลุ่มที่ไม่มีรายการสินค้า
function removeEmptyGroups() {
    let modified = false;
    for (let groupId in farmDataStorage) {
        // หากกลุ่มไม่มีสินค้าเหลืออยู่ และไม่ใช่กลุ่มตั้งต้น (หรือลบได้ทุกกลุ่มที่ว่าง)
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
    removeEmptyGroups(); // ตรวจสอบความเรียบร้อยก่อนเรนเดอร์
    const container = document.getElementById("groups-container");
    if (!container) return;
    container.innerHTML = "";

    for (let groupId in farmDataStorage) {
        const title = groupTitles[groupId] || groupId.replace('-group', '');
        const deleteGroupBtn = `<button onclick="deleteGroup('${groupId}')" class="danger-btn" style="padding: 2px 6px; font-size: 11px; border-radius: 4px;">ลบกลุ่ม</button>`;

        const groupHtml = `
            <div style="margin-top: 20px;">
                <h4 class="group-title" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${title}</span>
                    ${deleteGroupBtn}
                </h4>
                <div id="${groupId}" class="btn-group"></div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', groupHtml);
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
                btn.innerText = item.name;
                
                btn.onclick = () => {
                    const itemUnit = item.unit || "หน่วย";
                    currentSelectedUnit = itemUnit;

                    document.getElementById("expenseDetail").value = item.name;
                    document.getElementById("unitPrice").value = item.marketPrice || 0;
                    document.getElementById("unitQuantity").value = 1;
                    
                    displayPriceComparison(item.name, item.marketPrice || 0, itemUnit);
                    updateUnitLabels(itemUnit);
                    calculateTotal();
                    fetchKnowledgeData(item.name.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim(), item.name);
                    
                    document.querySelector('.account-panel').scrollIntoView({ behavior: 'smooth' });
                };
                
                btn.oncontextmenu = (e) => {
                    e.preventDefault();
                    if (confirm(`คุณต้องการลบ "${item.name}" ใช่หรือไม่?`)) {
                        farmDataStorage[groupId].splice(index, 1);
                        
                        // ตรวจสอบทันทีหลังลบสินค้า หากกลุ่มว่างเปล่า ให้ลบกลุ่มนั้นทิ้งอัตโนมัติ
                        if (farmDataStorage[groupId].length === 0) {
                            delete farmDataStorage[groupId];
                            delete groupTitles[groupId];
                            localStorage.setItem('groupTitles', JSON.stringify(groupTitles));
                        }

                        localStorage.setItem('farmDataStorage', JSON.stringify(farmDataStorage));
                        renderGroupContainers();
                        renderButtons(filter);
                        updateGroupSelectOptions();
                    }
                };
                container.appendChild(btn);
            }
        });
    }
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
    const total = parseFloat(document.getElementById("displayTotal").innerText.replace(/,/g, '')) || 0;
    
    if (!dateInput || !detail || total === 0) return alert("กรุณากรอกข้อมูลและราคาให้ครบถ้วน");
    
    const parts = dateInput.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    const detailWithUnit = `${detail} (${qty} ${currentSelectedUnit})`;

    farmData.push({ date: formattedDate, type, detail: detailWithUnit, total });
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

function updateTable() {
    const historyBody = document.getElementById("historyBody");
    if (!historyBody) return;
    
    let reversedData = farmData.map((item, index) => ({ ...item, originalIndex: index })).reverse();
    const displayData = showAllHistory ? reversedData : reversedData.slice(0, 5);
    const historyCountText = document.getElementById("historyCountText");
    if (historyCountText) historyCountText.innerText = showAllHistory ? `ทั้งหมด ${reversedData.length} รายการ` : `5 รายการ`;

    historyBody.innerHTML = displayData.map((obj) => `
        <tr>
            <td style="color: #94a3b8; font-size: 13px;">${obj.date}</td>
            <td style="text-align: left;">
                ${obj.detail}<br>
                <span style="font-size: 11px; color: ${obj.type === 'รายรับ' ? '#10b981' : '#ef4444'}; font-weight: bold;">
                    ${obj.type}
                </span>
            </td>
            <td style="font-weight: bold; color: ${obj.type === 'รายรับ' ? '#10b981' : '#ef4444'};">
                ${obj.total.toLocaleString()}
            </td>
            <td><button onclick="deleteRecord(${obj.originalIndex})" class="danger-btn" style="padding: 4px 8px; font-size: 12px; border-radius: 4px;">✖</button></td>
        </tr>
    `).join('');

    let totalIncome = 0;
    let totalExpense = 0;

    farmData.forEach(item => {
        const amount = parseFloat(item.total) || 0;
        if (item.type === 'รายรับ') totalIncome += amount;
        else if (item.type === 'รายจ่าย') totalExpense += amount;
    });

    if (document.getElementById("totalIncome")) document.getElementById("totalIncome").innerText = totalIncome.toLocaleString();
    if (document.getElementById("totalExpense")) document.getElementById("totalExpense").innerText = totalExpense.toLocaleString();
    if (document.getElementById("netBalance")) document.getElementById("netBalance").innerText = (totalIncome - totalExpense).toLocaleString();
}

function toggleHistoryLimit() {
    showAllHistory = !showAllHistory;
    const btn = document.getElementById("toggleHistoryBtn");
    if (btn) btn.innerText = showAllHistory ? "ย่อประวัติ 📝" : "ดูประวัติทั้งหมด 📝";
    updateTable();
}

function deleteRecord(index) { 
    if (confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) {
        farmData.splice(index, 1); 
        localStorage.setItem('farmData', JSON.stringify(farmData)); 
        updateTable(); 
    }
}

function calculateTotal() { 
    const p = parseFloat(document.getElementById("unitPrice").value) || 0;
    const q = parseFloat(document.getElementById("unitQuantity").value) || 0;
    const displayTotal = document.getElementById("displayTotal");
    if (displayTotal) displayTotal.innerText = (p * q).toLocaleString(); 
}

function clearAllData() { 
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูล 'ทั้งหมด' ?")) { 
        localStorage.removeItem('farmData');
        localStorage.removeItem('farmDataStorage');
        localStorage.removeItem('groupTitles');
        location.reload(); 
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

    const unitPriceInput = document.getElementById("unitPrice");
    const currentMarketPrice = matchedData ? matchedData.marketPrice : 0;

    if (matchedData && unitPriceInput && !unitPriceInput.value) {
        unitPriceInput.value = currentMarketPrice;
        calculateTotal();
    }

    displayPriceComparison(query, currentMarketPrice, currentSelectedUnit);
    fetchKnowledgeData(cleanName, query);
}

function displayPriceComparison(itemName, marketPrice, unit) {
    const compareBox = document.getElementById("priceCompareBox");
    if (!compareBox) return;

    if (document.getElementById("marketPriceDisplay")) document.getElementById("marketPriceDisplay").innerText = marketPrice || 0;
    const unitText = unit ? `฿/${unit}` : `฿`;
    if (document.getElementById("marketPriceUnit")) document.getElementById("marketPriceUnit").innerText = unitText;

    compareBox.style.display = "flex";
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
    return text;
}

async function fetchKnowledgeData(cleanItemName, rawItemName) {
    for (let key in knowledgeBase) {
        if (cleanItemName.includes(key)) {
            openKnowledgeDrawer(knowledgeBase[key].title, knowledgeBase[key].info);
            return;
        }
    }

    try {
        const response = `https://th.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanItemName)}`;
        const res = await fetch(response);
        const data = await res.json();

        if (data.type === "standard" && data.extract) {
            openKnowledgeDrawer(`🌐 AI แนวทางพัฒนา: ${rawItemName}`, data.extract);
        }
    } catch (e) {
        // หากไม่พบข้อมูล ข้ามการแสดงผล
    }
}

function openKnowledgeDrawer(title, info) {
    const drawer = document.getElementById('knowledge-drawer');
    if (!drawer) return;
    
    const titleElement = document.getElementById('knowledge-title');
    const infoElement = document.getElementById('knowledge-content');
    
    if (titleElement) titleElement.textContent = title;
    if (infoElement) infoElement.textContent = info;
    
    drawer.style.display = 'block';
}

function closeDrawer() {
    const drawer = document.getElementById('knowledge-drawer');
    if (drawer) drawer.style.display = 'none';
}
