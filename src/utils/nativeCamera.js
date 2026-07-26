export async function takeSnapshot() {
  try {
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      // โค้ดเรียกใช้ Capacitor Camera Plugin
      return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80";
    } else {
      return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80";
    }
  } catch (error) {
    console.error("Camera error:", error);
    return null;
  }
}
