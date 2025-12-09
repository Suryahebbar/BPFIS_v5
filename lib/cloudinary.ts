import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const uploadFile = async (file: Buffer, folder: string, publicId?: string) => {
  try {
    // Convert buffer to base64 string
    const base64String = `data:application/octet-stream;base64,${file.toString('base64')}`;
    
    const result = await cloudinary.uploader.upload(base64String, {
      folder: `bpfis/${folder}`,
      public_id: publicId,
      resource_type: 'auto',
      overwrite: true,
    });

    return {
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
      },
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file to Cloudinary',
    };
  }
};

export const deleteFile = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete file from Cloudinary',
    };
  }
};

export default cloudinary;
