import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { SeoService } from './seo.service';
import { RequestContext } from '@/common/decorators/request-context.decorator';
import { RequestContextDto } from '@/common/dto/request-context.dto';

@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain')
  async getRobotsTxt(@RequestContext() ctx: RequestContextDto) {
    return await this.seoService.getRobotsTxt(ctx.tenantId);
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  async getSitemap(@RequestContext() ctx: RequestContextDto, @Res() res: Response) {
    const { categories, products } = await this.seoService.getSitemapData(ctx.tenantId);
    
    // In a real multi-tenant app, you'd get the base URL from settings or request
    const baseUrl = `https://${ctx.tenantId}.example.com`; // Placeholder logical URL

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${categories.map(cat => `
  <url>
    <loc>${baseUrl}/category/${cat.slug}</loc>
    <lastmod>${cat.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${products.map(prod => `
  <url>
    <loc>${baseUrl}/product/${prod.slug}</loc>
    <lastmod>${prod.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

    res.send(sitemap);
  }
}
