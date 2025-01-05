import sharp from 'sharp';

export default async function hashImage(imageBuffer: Buffer) {
  try {
    const previewBuffer = await sharp(imageBuffer, { limitInputPixels: Number.MAX_SAFE_INTEGER })
      .resize(32, 32)
      .blur(4)
      .toBuffer();
    
    return previewBuffer.toString('base64');
    
  } catch (error) {
    throw new Error(`Failed to create image preview: ${error}`);
  }
}