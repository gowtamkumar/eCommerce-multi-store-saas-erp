import { Injectable } from '@nestjs/common';
import { FaqService } from '../faq/faq.service';
import { PageService } from '../page/page.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class HomeService {
    constructor(
        private readonly productService: ProductService,
        private readonly faqService: FaqService,
        private readonly pageService: PageService,
    ) { }

    async getHomeData(tenantId: string) {
        const [latestProducts, faqs, homePage] = await Promise.all([
            this.productService.findLatest(tenantId, 8),
            this.faqService.findAll({ status: 'active', page: 1, limit: 100 }, tenantId),
            this.pageService.findHomePage(tenantId).catch(() => null),
        ]);

        return {
            products: latestProducts,
            faqs,
            page: homePage,
        };
    }
}
