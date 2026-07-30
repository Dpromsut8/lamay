import { NativeBiometric } from '@capacitor-community/biometric';

export async function authenticateBiometric() {
  try {
    // ตรวจสอบว่ารันอยู่บนแพลตฟอร์ม Native หรือไม่ (Capacitor)
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      // ตรวจสอบความพร้อมของฮาร์ดแวร์ไบโอเมตริกซ์ในอุปกรณ์
      const result = await NativeBiometric.isAvailable();
      
      if (!result.isAvailable) {
        alert("อุปกรณ์นี้ไม่รองรับการสแกนลายนิ้วมือ / Face ID หรือยังไม่ได้ตั้งค่าความปลอดภัย");
        return false;
      }

      // ดำเนินการตรวจสอบสิทธิ์ด้วยไบโอเมตริกซ์จริง
      const verified = await NativeBiometric.verify({
        reason: "กรุณายืนยันตัวตนเพื่อเข้าสู่ระบบ Lamay Smart Farm",
        title: "ยืนยันตัวตน",
        subtitle: "ใช้ลายนิ้วมือหรือใบหน้าของคุณ",
        description: "สแกนเพื่อเข้าใช้งานระบบ"
      });

      return verified ? true : false;
    } else {
      // สำหรับการรันบนเว็บเบราว์เซอร์ (Mock สำหรับทดสอบพัฒนา)
      const isMockSuccess = window.confirm("🖥️ [Web Mock] จำลองการสแกนลายนิ้วมือ/Face ID สำเร็จหรือไม่?");
      return isMockSuccess;
    }
  } 
  catch (error) {
    console.error("Biometric authentication error:", error);
    // กรณีผู้ใช้กดยกเลิกสแกน (User Cancel) ไม่ต้องแสดงแจ้งเตือนข้อผิดพลาด
    if (error.code !== 'user_cancelled' && error.message !== 'User cancelled') {
      alert("เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์: " + (error.message || error));
    }
    return false;
  }
}
