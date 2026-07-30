// ฐานข้อมูลจัดกลุ่มสินค้าทั้งหมด 142 รายการ
let farmDataStorage;

try {
    const savedData = localStorage.getItem('farmDataStorage');
    farmDataStorage = savedData ? JSON.parse(savedData) : null;
} catch (e) {
    console.warn("ไม่สามารถอ่านข้อมูลจาก localStorage ได้ กำลังใช้ข้อมูลเริ่มต้น", e);
    farmDataStorage = null;
}

if (!farmDataStorage) {
    farmDataStorage = {
        "spices-group": [
            {name: "🌶️ พริกยำขาว", marketPrice: 70, unit: "กก."},
            {name: "🌶️ พริกหยวก", marketPrice: 70, unit: "กก."},
            {name: "🌿 พริกไทยอ่อน", marketPrice: 400, unit: "กก."},
            {name: "🌿 พาสเล่ย์", marketPrice: 140, unit: "กก."},
            {name: "📦 พาสเล่ย์ (ยกลัง) 5 กก.", marketPrice: 550, unit: "ลัง"},
            {name: "🌿 อิตาเลี่ยนพาสลีย์", marketPrice: 260, unit: "กก."},
            {name: "🌿 เบซิล (Basil)", marketPrice: 200, unit: "กก."},
            {name: "🌿 สาระแหน่", marketPrice: 240, unit: "กก."},
            {name: "🌿 รากผักชี", marketPrice: 180, unit: "กก."},
            {name: "🍲 เครื่องต้มยำ 300 กรัม", marketPrice: 20, unit: "แพ็ค"}
        ],
        "roots-group": [
            {name: "🎃 ฟักทอง (ชั่งน้ำหนัก)", marketPrice: 40, unit: "กก."},
            {name: "📦 ฟักทอง (ยกถุง 10 กก.)", marketPrice: 390, unit: "ถุง"},
            {name: "🎃 ฟักทองญี่ปุ่น", marketPrice: 50, unit: "กก."},
            {name: "🎃 ฟักทองหั่น (ปอกเปลือก)", marketPrice: 65, unit: "กก."},
            {name: "📦 ฟักเขียว (ยกถุง 10 กก.)", marketPrice: 300, unit: "ถุง"},
            {name: "🥒 ฟักเขียว", marketPrice: 30, unit: "กก."},
            {name: "📦 ฟักแก่ (ยกถุง 10 กก.)", marketPrice: 140, unit: "ถุง"},
            {name: "🥒 ฟักแก่", marketPrice: 30, unit: "กก."},
            {name: "🥔 มันฝรั่ง", marketPrice: 40, unit: "กก."},
            {name: "📦 มันฝรั่งนอก (ยกลัง 10 กก.)", marketPrice: 280, unit: "ลัง"},
            {name: "🍠 มันม่วง", marketPrice: 40, unit: "กก."},
            {name: "🪷 รากบัว", marketPrice: 100, unit: "กก."},
            {name: "🥕 หัวไชเท้า", marketPrice: 24, unit: "กก."},
            {name: "📦 หัวไชเท้า (ยกลัง 10 กก.)", marketPrice: 210, unit: "ลัง"},
            {name: "📦 หัวไชเท้า หัวตัด (ยกถุง 10 กก.)", marketPrice: 150, unit: "ถุง"},
            {name: "🥕 หัวไชเท้า (หัวตัด)", marketPrice: 20, unit: "กก."},
            {name: "🥔 เผือก", marketPrice: 40, unit: "กก."},
            {name: "📦 เผือก (ยกถุง 10 กก.)", marketPrice: 350, unit: "ถุง"},
            {name: "🥕 แครอท", marketPrice: 20, unit: "กก."},
            {name: "📦 แครอท (ยกลัง 10 กก.)", marketPrice: 150, unit: "ลัง"},
            {name: "📦 เบบี้แครอท (ยกลัง 10 กก.)", marketPrice: 600, unit: "ลัง"}
        ],
        "fruits-veg-group": [
            {name: "🥒 มะระขี้นก", marketPrice: 64, unit: "กก."},
            {name: "🥒 มะระจีน", marketPrice: 40, unit: "กก."},
            {name: "📦 มะระจีน ไม่ตัดแต่ง (ยกถุง 5 กก.)", marketPrice: 199, unit: "ถุง"},
            {name: "🥭 มะละกอ (ดิบ)", marketPrice: 30, unit: "กก."},
            {name: "📦 มะละกอดิบ ไม่ตัดแต่ง (ยกถุง 2 แถว)", marketPrice: 290, unit: "ถุง"},
            {name: "🥭 มะละกอฮอลแลนด์", marketPrice: 65, unit: "กก."},
            {name: "🍆 มะเขือพวง", marketPrice: 60, unit: "กก."},
            {name: "📦 มะเขือพวง (ยกถุง 5 กก.)", marketPrice: 400, unit: "ถุง"},
            {name: "🍆 มะเขือม่วง (ก้านเขียว)", marketPrice: 40, unit: "กก."},
            {name: "🍆 มะเขือยาว", marketPrice: 40, unit: "กก."},
            {name: "📦 มะเขือยาว (ยกถุง 5 กก.)", marketPrice: 170, unit: "ถุง"},
            {name: "🍅 มะเขือเทศท้อ", marketPrice: 50, unit: "กก."},
            {name: "📦 มะเขือเทศท้อ (ยกถุง 5 กก.)", marketPrice: 250, unit: "ถุง"},
            {name: "🍅 มะเขือเทศราชินี", marketPrice: 120, unit: "กก."},
            {name: "📦 มะเขือเทศราชินี (ยกถุง 5 กก.)", marketPrice: 500, unit: "ถุง"},
            {name: "🍅 มะเขือเทศสีดา", marketPrice: 60, unit: "กก."},
            {name: "📦 มะเขือเทศสีดา (ยกถุง 5 กก.)", marketPrice: 250, unit: "ถุง"},
            {name: "🍆 มะเขือเปราะ", marketPrice: 30, unit: "กก."},
            {name: "📦 มะเขือเปราะ (ยกถุง 10 กก.)", marketPrice: 400, unit: "ถุง"},
            {name: "🍆 มะเขือเปราะขาว", marketPrice: 60, unit: "กก."},
            {name: "📦 มะเขือเปราะขาว (ยกถุง 5 กก.)", marketPrice: 400, unit: "ถุง"},
            {name: "🍆 มะเขือเปราะตอปิโด", marketPrice: 60, unit: "กก."},
            {name: "📦 มะเขือเปราะตอปิโด (ยกถุง 5 กก.)", marketPrice: 250, unit: "ถุง"},
            {name: "🍆 มะเขือเปราะม่วง", marketPrice: 45.98, unit: "กก."},
            {name: "🍅 มะเขือเปรี้ยว", marketPrice: 110, unit: "กก."},
            {name: "🍆 มะเขือเหลือง", marketPrice: 80, unit: "กก."},
            {name: "🥒 แตงกวา", marketPrice: 30, unit: "กก."},
            {name: "📦 แตงกวา (ยกถุง 10 กก.)", marketPrice: 300, unit: "ถุง"},
            {name: "🥒 แตงกวาญี่ปุ่น", marketPrice: 100, unit: "กก."},
            {name: "📦 แตงกวาญี่ปุ่น (ยกลัง 5 กก.)", marketPrice: 300, unit: "ลัง"},
            {name: "🥒 แตงร้าน", marketPrice: 30, unit: "กก."},
            {name: "📦 แตงร้าน ไม่ตัดแต่ง (ยกถุง 10 กก.)", marketPrice: 250, unit: "ถุง"},
            {name: "🐉 แก้วมังกร (เนื้อขาว) 300-400ก.", marketPrice: 99, unit: "กก."},
            {name: "🐉 แก้วมังกร (เนื้อแดง) 150-200ก.", marketPrice: 99, unit: "กก."},
            {name: "🍈 แคนตาลูปซันเลดี้ (1-1.5 กก./ลูก)", marketPrice: 39, unit: "ลูก"}
        ],
        "leaves-group": [
            {name: "🌿 ยอดกระถิน", marketPrice: 40, unit: "กก."},
            {name: "🥬 ยอดคะน้า", marketPrice: 40, unit: "กก."},
            {name: "📦 ยอดคะน้า (ยกถุง 5 กก.)", marketPrice: 199, unit: "ถุง"},
            {name: "🌿 ยอดฟักแม้ว", marketPrice: 100, unit: "กก."},
            {name: "🥥 ยอดมะพร้าว", marketPrice: 52, unit: "กก."},
            {name: "🥬 สลัดคอส", marketPrice: 100, unit: "กก."},
            {name: "🪷 สายบัว", marketPrice: 160, unit: "กก."},
            {name: "🎋 หน่อไม้ (สำหรับทำซุป)", marketPrice: 70, unit: "กก."},
            {name: "🎋 หน่อไม้ฝรั่ง", marketPrice: 140, unit: "กก."},
            {name: "🎋 หน่อไม้หวาน", marketPrice: 100, unit: "กก."},
            {name: "🍌 หยวกกล้วย", marketPrice: 60, unit: "กก."},
            {name: "🍌 หัวปลี", marketPrice: 18, unit: "กก."},
            {name: "🥬 เรดโอ๊ค", marketPrice: 100, unit: "กก."},
            {name: "🥬 เบบี้คอส", marketPrice: 110, unit: "กก."},
            {name: "📦 เบบี้หางหงส์ (ยกถุง 5 กก.)", marketPrice: 5000, unit: "ถุง"},
            {name: "🥬 แขนง", marketPrice: 100, unit: "กก."},
            {name: "📦 แขนง (ยกถุง 5 กก.)", marketPrice: 350, unit: "ถุง"},
            {name: "🌿 เซเลอรี่", marketPrice: 90, unit: "กก."}
        ],
        "fruits-group": [
            {name: "🍋 มะกรูด", marketPrice: 60, unit: "กก."},
            {name: "🤎 มะขามเปียก (ฝัก)", marketPrice: 115, unit: "กก."},
            {name: "🍋 มะนาว (เกรดบ้านแพ้ว)", marketPrice: 30, unit: "กก."},
            {name: "🍋 มะนาว (เกรดบ้านแพ้ว)", marketPrice: 8, unit: "ลูก"},
            {name: "📦 มะนาว เบอร์ 4 (ยกถุง 10 กก.)", marketPrice: 300, unit: "ถุง"},
            {name: "🍋 มะนาวเหลือง", marketPrice: 20, unit: "กก."},
            {name: "🥥 มะพร้าวน้ำหอม", marketPrice: 189, unit: "ลูก"},
            {name: "🥭 มะม่วงน้ำดอกไม้ (สุก) 200-300", marketPrice: 290, unit: "กก."},
            {name: "🥭 มะม่วงน้ำดอกไม้ (เปรี้ยว)", marketPrice: 90, unit: "กก."},
            {name: "🥭 มะม่วงมันเดือนเก้า (ยำ) 3 รส", marketPrice: 60, unit: "กก."},
            {name: "🥭 มะม่วงแก้วขมิ้น (ดิบ)", marketPrice: 50, unit: "กก."},
            {name: "🥭 มะม่วงโชคอนันต์ (สุก)", marketPrice: 195, unit: "กก."},
            {name: "🍒 ลำไย", marketPrice: 55, unit: "กก."},
            {name: "🍓 สตรอว์เบอร์รี", marketPrice: 160, unit: "กก."},
            {name: "🍊 ส้มจุก", marketPrice: 659, unit: "กก."},
            {name: "🍊 ส้มสายน้ำผึ้ง", marketPrice: 60, unit: "กก."},
            {name: "🍊 ส้มสายน้ำผึ้ง (เหมาะคั้นน้ำ)", marketPrice: 250, unit: "ถุง"},
            {name: "🍊 ส้มเขียวหวาน", marketPrice: 80, unit: "กก."},
            {name: "🍈 ส้มโอ (ปอกเปลือก) 500 กรัม", marketPrice: 60, unit: "แพ็ค"},
            {name: "🍈 ส้มโอขาวน้ำผึ้ง (1.5 - 1.7 กก)", marketPrice: 60, unit: "กก."},
            {name: "📦 ส้มไต้หวัน (ยกลัง)", marketPrice: 380, unit: "ลัง"},
            {name: "🍍 สับปะรดนางแล", marketPrice: 159, unit: "กก."},
            {name: "🍍 สับปะรดภูเก็ตปัตตาเวีย", marketPrice: 55, unit: "ลูก"},
            {name: "🍍 สับปะรดศรีราชา", marketPrice: 35, unit: "กก."},
            {name: "🍐 สาลี่น้ำผึ้ง", marketPrice: 189, unit: "กก."},
            {name: "🍐 สาลี่หิมะ", marketPrice: 350, unit: "กก."},
            {name: "📦 องุ่นไข่ปลา 3 กก. (ยกลัง)", marketPrice: 300, unit: "ลัง"},
            {name: "📦 องุ่นไซมัสคัส 2 ช่อ 4-5 กก. (ยกลัง)", marketPrice: 350, unit: "ลัง"},
            {name: "🥑 อโวคาโดแช่แข็ง (1 กก/ถุง)", marketPrice: 190, unit: "ถุง"},
            {name: "🥑 อโวคาโดพันธุ์ไทย บูท 7 (3 กก)", marketPrice: 100, unit: "กก."},
            {name: "🍒 เงาะโรงเรียน", marketPrice: 80, unit: "กก."},
            {name: "🟡 เนื้อเสาวรสแช่แข็ง (1 กก/ถุง)", marketPrice: 189, unit: "ถุง"},
            {name: "🍈 เมล่อนเนื้อส้ม", marketPrice: 79, unit: "กก."},
            {name: "🍈 เมล่อนเนื้อเขียว", marketPrice: 79, unit: "กก."},
            {name: "🍋 เลม่อน", marketPrice: 120, unit: "กก."},
            {name: "📦 เลม่อน (ยกลัง) 10 กก.", marketPrice: 1100, unit: "ลัง"},
            {name: "🟡 เสาวรสม่วง (5 กก/ถุง)", marketPrice: 300, unit: "ถุง"}
        ],
        "mushrooms-group": [
            {name: "🍄 เห็ดจืดขาว", marketPrice: 99, unit: "กก."},
            {name: "🍄 เห็ดจืดขาว 125 กรัม", marketPrice: 18, unit: "แพ็ค"},
            {name: "🍄 เห็ดจืดดำ", marketPrice: 99, unit: "กก."},
            {name: "🍄 เห็ดนางฟ้า", marketPrice: 90, unit: "กก."},
            {name: "🍄 เห็ดฟาง", marketPrice: 220, unit: "กก."},
            {name: "🍄 เห็ดหอมสด", marketPrice: 120, unit: "กก."},
            {name: "📦 เห็ดหูหนู (ยกลัง) 5 กก.", marketPrice: 490, unit: "ลัง"},
            {name: "🍄 เห็ดหูหนูดำ", marketPrice: 90, unit: "กก."},
            {name: "🍄 เห็ดเข็มทอง (ขนาด 1 กก)", marketPrice: 56, unit: "แพ็ค"},
            {name: "🍄 เห็ดเข็มทอง ขนาด 300 กรัม", marketPrice: 17, unit: "แพ็ค"},
            {name: "🍄 เห็ดโอเลจิ เล็ก", marketPrice: 90, unit: "กก."},
            {name: "🍄 เห็ดโอเลจิ ใหญ่", marketPrice: 70, unit: "กก."}
        ],
        "onions-group": [
            {name: "🧅 หอมแขก", marketPrice: 40, unit: "กก."},
            {name: "📦 หอมแขก (ยกถุง 10 กก.)", marketPrice: 300, unit: "ถุง"},
            {name: "🧅 หอมแขกจิ๋ว (อินโด)", marketPrice: 45, unit: "กก."},
            {name: "📦 หอมแขกจิ๋ว (อินโด) ยกถุง 10 กก.", marketPrice: 280, unit: "ถุง"},
            {name: "🧅 หอมแดง", marketPrice: 90, unit: "กก."},
            {name: "🧅 หอมใหญ่", marketPrice: 35, unit: "กก."},
            {name: "📦 หอมใหญ่ (ยกถุง 10 กก.)", marketPrice: 280, unit: "ถุง"},
            {name: "🥩 เซี่ยงจี้หมู", marketPrice: 60, unit: "กก."},
            {name: "🫘 เมล็ดกระถิน (แบบแกะแล้ว) 500 กรัม", marketPrice: 130, unit: "แพ็ค"}
        ]
    };
    try {
        localStorage.setItem('farmDataStorage', JSON.stringify(farmDataStorage));
    } catch (e) {
        console.warn("ไม่สามารถบันทึกข้อมูลลง localStorage ได้", e);
    }
}

// ข้อมูล AI อ้างอิงเพื่อการค้นหาและการอัปเดตราคา
const smartMarketData = {};

for (let group in farmDataStorage) {
    if (Array.isArray(farmDataStorage[group])) {
        farmDataStorage[group].forEach(item => {
            if (item && item.name) {
                // ใช้ Regular Expression ที่ปลอดภัยและครอบคลุมในการตัด Emoji ออก
                let cleanName = item.name.replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}]/gu, '').trim();
                let emojiMatch = item.name.match(/^[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}]/u);
                
                smartMarketData[cleanName] = { 
                    marketPrice: item.marketPrice, 
                    group: group,
                    emoji: emojiMatch ? emojiMatch[0] : '', 
                    unit: item.unit 
                };
            }
        });
    }
}

// ฟังก์ชันสำหรับบันทึกและซิงค์ข้อมูลลง LocalStorage ป้องกันข้อมูลสูญหาย
function saveFarmDataStorage() {
    try {
        localStorage.setItem('farmDataStorage', JSON.stringify(farmDataStorage));
        return true;
    } catch (e) {
        console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล:", e);
        return false;
    }
}

export { farmDataStorage, smartMarketData, saveFarmDataStorage };
        {name: "🍍 สับปะรดศรีราชา", marketPrice: 35, unit: "กก."},
        {name: "🍐 สาลี่น้ำผึ้ง", marketPrice: 189, unit: "กก."},
        {name: "🍐 สาลี่หิมะ", marketPrice: 350, unit: "กก."},
        {name: "📦 องุ่นไข่ปลา 3 กก. (ยกลัง)", marketPrice: 300, unit: "ลัง"},
        {name: "📦 องุ่นไซมัสคัส 2 ช่อ 4-5 กก. (ยกลัง)", marketPrice: 350, unit: "ลัง"},
        {name: "🥑 อโวคาโดแช่แข็ง (1 กก/ถุง)", marketPrice: 190, unit: "ถุง"},
        {name: "🥑 อโวคาโดพันธุ์ไทย บูท 7 (3 กก)", marketPrice: 100, unit: "กก."},
        {name: "🍒 เงาะโรงเรียน", marketPrice: 80, unit: "กก."},
        {name: "🟡 เนื้อเสาวรสแช่แข็ง (1 กก/ถุง)", marketPrice: 189, unit: "ถุง"},
        {name: "🍈 เมล่อนเนื้อส้ม", marketPrice: 79, unit: "กก."},
        {name: "🍈 เมล่อนเนื้อเขียว", marketPrice: 79, unit: "กก."},
        {name: "🍋 เลม่อน", marketPrice: 120, unit: "กก."},
        {name: "📦 เลม่อน (ยกลัง) 10 กก.", marketPrice: 1100, unit: "ลัง"},
        {name: "🟡 เสาวรสม่วง (5 กก/ถุง)", marketPrice: 300, unit: "ถุง"}
    ],
    "mushrooms-group": [
        {name: "🍄 เห็ดจืดขาว", marketPrice: 99, unit: "กก."},
        {name: "🍄 เห็ดจืดขาว 125 กรัม", marketPrice: 18, unit: "แพ็ค"},
        {name: "🍄 เห็ดจืดดำ", marketPrice: 99, unit: "กก."},
        {name: "🍄 เห็ดนางฟ้า", marketPrice: 90, unit: "กก."},
        {name: "🍄 เห็ดฟาง", marketPrice: 220, unit: "กก."},
        {name: "🍄 เห็ดหอมสด", marketPrice: 120, unit: "กก."},
        {name: "📦 เห็ดหูหนู (ยกลัง) 5 กก.", marketPrice: 490, unit: "ลัง"},
        {name: "🍄 เห็ดหูหนูดำ", marketPrice: 90, unit: "กก."},
        {name: "🍄 เห็ดเข็มทอง (ขนาด 1 กก)", marketPrice: 56, unit: "แพ็ค"},
        {name: "🍄 เห็ดเข็มทอง ขนาด 300 กรัม", marketPrice: 17, unit: "แพ็ค"},
        {name: "🍄 เห็ดโอเลจิ เล็ก", marketPrice: 90, unit: "กก."},
        {name: "🍄 เห็ดโอเลจิ ใหญ่", marketPrice: 70, unit: "กก."}
    ],
    "onions-group": [
        {name: "🧅 หอมแขก", marketPrice: 40, unit: "กก."},
        {name: "📦 หอมแขก (ยกถุง 10 กก.)", marketPrice: 300, unit: "ถุง"},
        {name: "🧅 หอมแขกจิ๋ว (อินโด)", marketPrice: 45, unit: "กก."},
        {name: "📦 หอมแขกจิ๋ว (อินโด) ยกถุง 10 กก.", marketPrice: 280, unit: "ถุง"},
        {name: "🧅 หอมแดง", marketPrice: 90, unit: "กก."},
        {name: "🧅 หอมใหญ่", marketPrice: 35, unit: "กก."},
        {name: "📦 หอมใหญ่ (ยกถุง 10 กก.)", marketPrice: 280, unit: "ถุง"},
        {name: "🥩 เซี่ยงจี้หมู", marketPrice: 60, unit: "กก."},
        {name: "🫘 เมล็ดกระถิน (แบบแกะแล้ว) 500 กรัม", marketPrice: 130, unit: "แพ็ค"}
    ]
;

// ข้อมูล AI อ้างอิงเพื่อการค้นหาและการอัปเดตราคา
const smartMarketData = {};
for (let group in farmDataStorage) {
    farmDataStorage[group].forEach(item => {
        // ดึง Emoji ออกเพื่อใช้เป็น Key ให้ระบบ Search ทำงานได้ง่าย
        let cleanName = item.name.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEF8]/gu, '').trim();
        smartMarketData[cleanName] = { 
            marketPrice: item.marketPrice, 
            group: group,
            emoji: item.name.split(' ')[0], 
            unit: item.unit 
        };
    });
}
