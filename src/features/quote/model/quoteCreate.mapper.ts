import { CreateQuoteRequestDto, CreateQuoteResponseDto } from './quoteCreate.dto';
import { CreateQuoteInput, CreateQuoteResult, QuoteSourceType } from './quoteCreate.types';

function resolveSourceType(hasOcrSource: boolean): QuoteSourceType {
  if (hasOcrSource) {
    return 'IMAGE_OCR';
  }

  return 'MANUAL';
}

export function toCreateQuoteRequestDto(input: CreateQuoteInput): CreateQuoteRequestDto {
  const sourceType = resolveSourceType(Boolean(input.ocrSource));

  return {
    book: {
      title: input.bookTitle,
      author: input.author,
      ...(input.coverImageUrl ? { coverImageUrl: input.coverImageUrl } : {}),
    },
    pageNumber: input.pageNumber,
    quoteText: input.quoteText,
    memo: input.memo,
    folderId: input.folderId,
    source:
      sourceType === 'IMAGE_OCR' && input.ocrSource
        ? {
            type: sourceType,
            imageId: input.ocrSource.imageId,
            ocrId: input.ocrSource.ocrId,
            blockIds: input.ocrSource.blockIds,
          }
        : {
            type: 'MANUAL',
          },
  };
}

export function toCreateQuoteResult(dto: CreateQuoteResponseDto): CreateQuoteResult {
  return {
    quoteId: dto.quoteId,
    book: {
      bookId: dto.book.bookId,
      title: dto.book.title,
      author: dto.book.author,
    },
    pageNumber: dto.pageNumber,
    quoteText: dto.quoteText,
    memo: dto.memo,
    folder: dto.folder,
    source: {
      type: dto.source.type,
      imageId: dto.source.imageId,
      ocrId: dto.source.ocrId,
    },
    createdAt: dto.createdAt,
  };
}
