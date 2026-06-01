import { CreatePresignedUrlRequestDto, CreatePresignedUrlResponseDto } from './quoteImage.dto';
import { PresignedUrlInput, PresignedUrlResult } from './quoteImage.types';

export function toCreatePresignedUrlRequestDto(input: PresignedUrlInput): CreatePresignedUrlRequestDto {
  return {
    fileName: input.fileName,
    contentType: input.contentType,
    fileSize: input.fileSize,
    purpose: input.purpose,
  };
}

export function toPresignedUrlResult(dto: CreatePresignedUrlResponseDto): PresignedUrlResult {
  return {
    imageId: dto.imageId,
    objectKey: dto.objectKey,
    uploadUrl: dto.uploadUrl,
    method: dto.method,
    headers: dto.headers,
    expiresIn: dto.expiresIn,
    publicUrl: dto.publicUrl,
  };
}
