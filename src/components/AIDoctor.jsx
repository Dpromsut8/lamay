import React, { useRef, useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export default function AIDoctor() {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // ฟังก์ชันหลักสำหรับการถ่ายภาพหรือเลือกรูปภาพ รองรับทั้งเว็บและ Capacitor (Android/iOS)
  const handleCapture = async () => {
    try {
      setLoading(true);
      
      // ตรวจสอบว่ารันบน Capacitor หรือไม่ (เปิดกล้องเครื่องจริง)
      // หรือหากรันบนเว็บเบราว์เซอร์ทั่วไป จะใช้ input file แทน
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Prompt // ให้ผู้ใช้เลือก ถ่ายรูป หรือ เลือกจากอัลบั้ม
        });

        if (image.webPath) {
          setImagePreview(image.webPath);
          processImage(image.webPath);
        }
      } catch (capacitorError) {
        // กรณีรันบน Browser ทั่วไปที่ Capacitor Camera อาจไม่รองรับ ให้ fallback มาใช้ input file
        if (fileInputRef.current) {
          fileInputRef.current.click();
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      alert('ไม่สามารถเปิดใช้งานกล้องได้ กรุณาลองใหม่อีกครั้ง');
      setLoading(false);
    }
  };

  // จัดการกรณีเลือกรูปผ่านเว็บอินพุต (Fallback)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      processImage(imageUrl);
    } else {
      setLoading(false);
    }
  };

  // จำลองการส่งรูปไปวิเคราะห์กับ AI (สามารถเปลี่ยนเป็นเรียก API จริงได้ที่นี่)
  const processImage = (imageUrl) => {
    setTimeout(() => {
      setAnalysisResult({
        disease: 'ใบจุดสีน้ำตาล (Brown Spot)',
        confidence: '92%',
        recommendation: 'ควรลดความชื้นในแปลง ใส่ปุ๋ยโพแทสเซียม และพ่นสารป้องกันกำจัดเชื้อราที่จำเป็น'
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="glass-card" style={{ padding: '16px', borderRadius: '12px' }}>
      <h3 style={{ color: '#34d399', fontSize: '15px', marginTop: 0 }}>
        🤖 ผู้ช่วย AI อัจฉริยะ
      </h3>
      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 10px 0' }}>
        วิเคราะห์โรคพืชและคำแนะนำการดูแลแปลงเกษตรแบบเรียลไทม์
      </p>

      {/* ซ่อน Input file ไว้สำหรับกรณีรันบนเว็บบราวเซอร์ */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      <button 
        className="btn-primary-custom" 
        style={{ width: '100%', fontSize: '12px', padding: '10px', cursor: 'pointer' }}
        onClick={handleCapture}
        disabled={loading}
      >
        {loading ? 'กำลังวิเคราะห์ภาพ...' : '📸 ถ่ายภาพวิเคราะห์โรคพืช'}
      </button>

      {/* ส่วนแสดงผลรูปภาพและผลการวิเคราะห์ */}
      {imagePreview && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <img 
            src={imagePreview} 
            alt="Plant Preview" 
            style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px' }} 
          />
        </div>
      )}

      {analysisResult && (
        <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '8px', border: '1px solid #34d399' }}>
          <p style={{ fontSize: '13px', color: '#34d399', fontWeight: 'bold', margin: '0 0 4px 0' }}>
            ผลการวิเคราะห์: {analysisResult.disease} ({analysisResult.confidence})
          </p>
          <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>
            {analysisResult.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
