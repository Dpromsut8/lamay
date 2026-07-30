import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export async function takeSnapshot() {
  try {
    // ตรวจสอบว่ารันอยู่บนแพลตฟอร์ม Native หรือบนเว็บเบราว์เซอร์
    const isNative = window.Capacitor && window.Capacitor.isNativePlatform();

    if (isNative) {
      // เรียกใช้งานกล้องถ่ายรูปจริงผ่าน Capacitor Camera Plugin
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri, // ส่งคืนมาเป็น URL (ไฟล์ภาพชั่วคราวในเครื่อง) หรือ DataUrl ตามต้องการ
        source: CameraSource.Camera      // บังคับเปิดกล้อง (สามารถเปลี่ยนเป็น Prompt ให้เลือกถ่ายรูปหรือเลือกจากอัลบั้มได้)
      });

      // คืนค่าเส้นทางภาพ (webPath) เพื่อนำไปแสดงผลบนแอปหรืออัปโหลด
      return image.webPath || image.path;
    } else {
      // สำหรับการทดสอบบนเว็บเบราว์เซอร์ (Mock หรือใช้รูปตัวอย่างสำรอง)
      console.log("🖥️ [Web Mock] เปิดกล้องจำลองสำเร็จ");
      return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80";
    }
  } catch (error) {
    // จัดการกรณีผู้ใช้กดยกเลิกการถ่ายรูป (User Cancelled)
    if (error.message && error.message.includes('User cancelled')) {
      console.log("ผู้ใช้ยกเลิกการถ่ายภาพ");
      return null;
    }
    
    console.error("Camera error:", error);
    alert("ไม่สามารถเปิดใช้งานกล้องได้: " + (error.message || error));
    return null;
  }
}
