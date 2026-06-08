import { CreateQuoteOcrRequestDto, CreateQuoteOcrResponseDto } from './quoteOcr.dto';
import { QuoteOcrInput, QuoteOcrResult } from './quoteOcr.types';

export function toCreateQuoteOcrRequestDto(input: QuoteOcrInput): CreateQuoteOcrRequestDto {
  const dto: CreateQuoteOcrRequestDto = {
    imageId: input.imageId,
    imageUrl: input.imageUrl.trim(),
  };

  return dto;
}

export function toQuoteOcrResult(dto: CreateQuoteOcrResponseDto): QuoteOcrResult {
  return {
    ocrId: dto.ocrId,
    imageId: dto.imageId,
    status: dto.status,
    fullText: dto.fullText,
    blocks: dto.blocks.map((block) => ({
      blockId: block.blockId,
      text: block.text,
      selected: block.selected ?? false,
      bbox: {
        x: block.bbox.x,
        y: block.bbox.y,
        width: block.bbox.width,
        height: block.bbox.height,
      },
    })),
    detectedLanguage: dto.detectedLanguage,
    confidence: dto.confidence,
  };
}
