import { Injectable } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { TestimonialService } from '../testimonial/testimonial.service';
import { FaqService } from '../faq/faq.service';
import { PageService } from '../page/page.service';

@Injectable()
export class HomeService {
    constructor(
        private readonly productService: ProductService,
        private readonly testimonialService: TestimonialService,
        private readonly faqService: FaqService,
        private readonly pageService: PageService,
    ) { }

    async getHomeData(tenantId: string) {
        const [latestProducts, testimonials, faqs, homePage] = await Promise.all([
            this.productService.findLatest(tenantId, 8),
            this.testimonialService.findAll({ status: 'active', page: 1, limit: 12 }, tenantId),
            this.faqService.findAll({ status: 'active', page: 1, limit: 100 }, tenantId),
            this.pageService.findHomePage(tenantId).catch(() => null),
        ]);

        return {
            products: latestProducts,
            testimonials,
            faqs,
            page: homePage,
        };
    }
}
