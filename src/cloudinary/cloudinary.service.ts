import { HttpException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary/cloudinary-response';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  uploadFile(
    file: Express.Multer.File,
    onlyImage: boolean,
  ): Promise<CloudinaryResponse> {
    if (!file) throw new HttpException('File not found!', 404);

    const fileSizeLimit = 10 * 1024 * 1024;
    if (file.size > fileSizeLimit)
      throw new HttpException('File size exceeds 10 MB limit.', 400);

    const allowedExtensions = ['jpeg', 'jpg', 'png', 'JPEG', 'JPG', 'PNG'];
    const [fileType, fileExtension] = file.mimetype.split('/');

    if (onlyImage === true)
      if (!allowedExtensions.includes(fileExtension))
        throw new HttpException(
          'File type not supported. Only JPEG, JPG, and PNG files are allowed.',
          400,
        );

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'ACADEMEASE' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
