import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export async function takeSnapshot() {
  try {
    // เช็คว่าเป็นแพลตฟอร์มมือถือ (iOS / Android) หรือไม่
    if (Capacitor.isNativePlatform()) {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      return image.webPath;
    } else {
      // สำหรับ Browser / Windows ให้ใช้ระบบเลือกไฟล์ภาพจำลอง
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            resolve(URL.createObjectURL(file));
          } else {
            resolve(null);
          }
        };
        input.click();
      });
    }
  } catch (error) {
    console.error("Camera error:", error);
    return null;
  }
}
