import { Expose } from 'class-transformer'
import { IsDate } from 'class-validator'
import { PageStatus } from '@/common/enums/page-status.enum'
import { PageSectionType } from '@/common/enums/page/page-sections-type.enum'

export class PageResponseDto {
  @Expose()
  id: string

  @Expose()
  title: string

  @Expose()
  slug: string

  @Expose()
  isHomePage: boolean

  @Expose()
  order: number

  @Expose()
  sections: Array<{
    id: string
    type: PageSectionType
    settings?: any
    styles?: any
    hidden?: boolean
    locked?: boolean
    visibility?: { desktop?: boolean; tablet?: boolean; mobile?: boolean }
    children?: any[]
  }>

  @Expose()
  metaTitle: string

  @Expose()
  metaDescription: string

  @Expose()
  ogImage: string

  @Expose()
  typography: {
    fontFamily?: string
    headingFont?: string
    baseFontSize?: number
    headingFontFamily?: string
    headingFontWeight?: string
    headingFontSize?: string
    headingLineHeight?: string
    paragraphFontFamily?: string
    paragraphFontWeight?: string
    paragraphFontSize?: string
    paragraphLineHeight?: string
  }

  @Expose()
  status: PageStatus

  @Expose()
  publishAt: Date | null

  @Expose()
  @IsDate()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
