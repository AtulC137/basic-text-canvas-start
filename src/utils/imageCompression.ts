
import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,              // Target max file size in MB
    maxWidthOrHeight: 1920,    // Resize if image is too large
    useWebWorker: true,        // Use Web Workers for faster processing
    quality: 0.8,              // Image quality (0.1 to 1.0)
    initialQuality: 0.8,       // Initial quality for optimization
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(`✅ Image compression complete:`);
    console.log(`  Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Reduction: ${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`);
    return compressedFile;
  } catch (error) {
    console.error('❌ Image compression error:', error);
    throw error;
  }
}
