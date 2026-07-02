import { Injectable } from '@nestjs/common'
import {
  CatalogContentResultDto,
  GenerateCatalogContentDto,
} from '../../dto/generate-catalog-content.dto'
import {
  DemandForecastResultDto,
  GenerateDemandForecastDto,
} from '../../dto/generate-demand-forecast.dto'
import { GenerateMediaAssistDto, MediaAssistResultDto } from '../../dto/generate-media-assist.dto'
import {
  GeneratePriceBookRationaleDto,
  PriceBookRationaleResultDto,
} from '../../dto/generate-price-book-rationale.dto'
import {
  GenerateProductContentDto,
  ProductContentResultDto,
} from '../../dto/generate-product-content.dto'
import { AiAssistantBaseService } from '../ai-assistant-base.service'

@Injectable()
export class AiCatalogAssistantService {
  constructor(private readonly base: AiAssistantBaseService) {}

  async generateProductContent(
    storeId: string,
    dto: GenerateProductContentDto,
  ): Promise<ProductContentResultDto> {
    const prompt = `Generate product listing content as JSON only (no markdown fences).
Product name: ${dto.productName}
${dto.category ? `Category: ${dto.category}` : ''}
${dto.keywords ? `Keywords: ${dto.keywords}` : ''}
${dto.existingDescription ? `Existing description to improve: ${dto.existingDescription}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional'}

Return exactly this JSON shape:
{
  "title": "string",
  "shortDescription": "string (max 160 chars)",
  "description": "string (2-4 paragraphs, HTML allowed with p/ul/li tags only)",
  "seoTitle": "string (max 60 chars)",
  "seoDescription": "string (max 155 chars)",
  "tags": ["tag1", "tag2", "tag3"]
}`

    const result = await this.base.complete(
      storeId,
      [
        {
          role: 'system',
          content:
            'You are an expert e-commerce copywriter. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/product-content',
      { temperature: 0.6 },
    )

    return this.base.parseJsonResponse<ProductContentResultDto>(result.content, {
      title: dto.productName,
      shortDescription: '',
      description: result.content,
      seoTitle: dto.productName,
      seoDescription: '',
      tags: [],
    })
  }

  async generateCatalogContent(
    storeId: string,
    dto: GenerateCatalogContentDto,
  ): Promise<CatalogContentResultDto> {
    const entityLabel = dto.entityType === 'category' ? 'product category' : 'brand'
    const prompt = `Generate ${entityLabel} page content as JSON only (no markdown fences).
${entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)} name: ${dto.name}
${dto.context ? `Context: ${dto.context}` : ''}
${dto.keywords ? `Keywords: ${dto.keywords}` : ''}
${dto.existingDescription ? `Existing description to improve: ${dto.existingDescription}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: professional'}

Return exactly this JSON shape:
{
  "description": "string (2-3 sentences, plain text, customer-facing)",
  "seoTitle": "string (max 60 chars)",
  "seoDescription": "string (max 155 chars)"
}`

    const result = await this.base.complete(
      storeId,
      [
        {
          role: 'system',
          content:
            'You are an expert e-commerce SEO copywriter. Respond with valid JSON only, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/catalog-content',
      { temperature: 0.6 },
    )

    return this.base.parseJsonResponse<CatalogContentResultDto>(result.content, {
      description: result.content,
      seoTitle: dto.name,
      seoDescription: '',
    })
  }

  async generateMediaAssist(
    storeId: string,
    dto: GenerateMediaAssistDto,
  ): Promise<MediaAssistResultDto> {
    const isImage = dto.mimetype?.startsWith('image/') ?? false
    const useVision = Boolean(dto.useVision && dto.imageUrl && isImage)

    const prompt = `Suggest accessibility alt text and an SEO-friendly filename for a media library asset as JSON only (no markdown fences).
Current filename: ${dto.filename}
${dto.mimetype ? `MIME type: ${dto.mimetype}` : ''}
${dto.contextHint ? `Usage context: ${dto.contextHint}` : ''}
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: descriptive and concise'}

File details:
${dto.mediaSummary}

${useVision ? 'Analyze the attached image when describing visible content.' : 'No vision analysis — infer from filename and metadata only.'}

Return exactly this JSON shape:
{
  "altText": "string (max 125 chars, accessibility-focused, describes the image content)",
  "suggestedFilename": "string (lowercase kebab-case with extension, SEO-friendly, no timestamp prefix, e.g. blue-cotton-tshirt-front.jpg)",
  "visionUsed": ${useVision ? 'true' : 'false'}
}`

    const result = await this.base.complete(
      storeId,
      [
        {
          role: 'system',
          content:
            'You write image alt text and SEO filenames for e-commerce media libraries. Respond with valid JSON only, no extra text. Do not invent brand names or products not visible or implied.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/media-assist',
      {
        temperature: 0.4,
        imageUrl: useVision ? dto.imageUrl : undefined,
      },
    )

    return this.base.parseJsonResponse<MediaAssistResultDto>(result.content, {
      altText: '',
      suggestedFilename: dto.filename,
      visionUsed: useVision,
    })
  }

  async generatePriceBookRationale(
    storeId: string,
    dto: GeneratePriceBookRationaleDto,
  ): Promise<PriceBookRationaleResultDto> {
    const prompt = `Write internal pricing rationale notes for a commerce team as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: clear, practical, and finance-friendly'}

Price book:
${dto.priceBookSummary}

${dto.catalogSummary ? `Other price books in catalog:\n${dto.catalogSummary}` : 'No other price book context provided.'}

Return exactly this JSON shape:
{
  "rationaleNotes": "string (3-5 bullet points as plain text with line breaks — why this price book exists, intended audience, pricing strategy, and validity implications; internal only)",
  "usageGuidance": "string (1-2 sentences on when sales/ops should apply this book vs others; do not invent product prices)"
}`

    const result = await this.base.complete(
      storeId,
      [
        {
          role: 'system',
          content:
            'You document B2B and retail price book strategy for ERP teams. Respond with valid JSON only, no extra text. Notes are internal — not customer-facing.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/price-book-rationale',
      { temperature: 0.45 },
    )

    return this.base.parseJsonResponse<PriceBookRationaleResultDto>(result.content, {
      rationaleNotes: result.content,
      usageGuidance: '',
    })
  }

  async generateDemandForecast(
    storeId: string,
    dto: GenerateDemandForecastDto,
  ): Promise<DemandForecastResultDto> {
    const prompt = `Analyze product sales velocity and stock levels. Return read-only reorder suggestions as JSON only (no markdown fences).
${dto.tone ? `Tone: ${dto.tone}` : 'Tone: practical and conservative'}

Context:
${dto.salesSummary}

Return exactly this JSON shape:
{
  "summary": "string (2-3 sentences on overall demand patterns — heuristic only, not ML)",
  "suggestions": [
    {
      "productName": "string",
      "sku": "string or null",
      "currentStock": 0,
      "recentSoldQty": 0,
      "suggestedReorderQty": 0,
      "rationale": "string (1-2 sentences)"
    }
  ],
  "disclaimer": "string (remind buyer these are draft suggestions requiring human approval before PO)"
}

Rules: Use only products listed in context. suggestedReorderQty should be a reasonable heuristic (e.g. cover ~2-4 weeks of recent velocity minus on-hand stock). Never recommend automatic PO creation.`

    const result = await this.base.complete(
      storeId,
      [
        {
          role: 'system',
          content:
            'You provide read-only inventory reorder heuristics for e-commerce buyers. Respond with valid JSON only, no extra text. Never auto-create purchase orders.',
        },
        { role: 'user', content: prompt },
      ],
      'ai/generate/demand-forecast',
      { temperature: 0.35 },
    )

    return this.base.parseJsonResponse<DemandForecastResultDto>(result.content, {
      summary: result.content,
      suggestions: [],
      disclaimer: 'Draft suggestions only — verify stock and lead times before creating a PO.',
    })
  }
}
