import { Product } from '@/types/product';

export function getLandingPagePayload(product: Product) {
  return {
    title: `${product.name} Landing Page`,
    slug: `landing-${product.slug}-${Date.now().toString().slice(-4)}`,
    status: 'published',
    sections: [
      {
        id: `section-banner`,
        type: 'banner',
        settings: {
          slides: [
            {
              id: `slide-1`,
              headline: product.name,
              subline: 'Premium quality you can trust. Limited time offer.',
              buttonText: 'Order Now',
              buttonLink: '#landing-checkout',
              image: product.images?.[0] || '',
              overlayOpacity: 40
            }
          ]
        },
        styles: {
          paddingTop: 0,
          paddingBottom: 0,
          textAlign: 'center',
          textColor: '#FFFFFF',
          headlineColor: '#FFFFFF',
          sublineColor: '#ECECEC',
          buttonColor: '#FFFFFF',
          buttonTextColor: '#000000',
          height: 500
        }
      },
      {
        id: `section-main-container`,
        type: 'section',
        settings: {},
        styles: {
          paddingTop: 80,
          paddingBottom: 100,
          backgroundColor: '#F9FAFB'
        },
        children: [
          {
            id: `row-inner`,
            type: 'row',
            settings: {},
            styles: {
              maxWidth: 1100,
              marginLeft: 'auto',
              marginRight: 'auto',
              gap: 40,
              alignItems: 'stretch',
              paddingLeft: 20,
              paddingRight: 20
            },
            children: [
              {
                id: `col-product-image`,
                type: 'column',
                settings: {},
                styles: {
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '32px',
                  padding: 40,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                  border: '1px solid #F1F5F9'
                },
                children: [
                  {
                    id: `img-block`,
                    type: 'image-block',
                    settings: { image: product.images?.[0] || '' },
                    styles: {
                      imageRadius: '24px',
                      imageShadow: '0 15px 35px rgba(0,0,0,0.08)'
                    }
                  }
                ]
              },
              {
                id: `col-product-info`,
                type: 'column',
                settings: {},
                styles: {
                  flex: 1.2,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '32px',
                  padding: 50,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                  border: '1px solid #F1F5F9',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                },
                children: [
                  {
                    id: `badge-text`,
                    type: 'text-block',
                    settings: { html: '<span style="background: #EEF2FF; color: #4F46E5; padding: 8px 16px; border-radius: 999px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Special Offer</span>' },
                    styles: { marginBottom: 24 }
                  },
                  {
                    id: `product-heading`,
                    type: 'heading',
                    settings: { text: product.name, level: 'h1' },
                    styles: { marginBottom: 20, textAlign: 'left', fontWeight: '900', fontSize: '46px', lineHeight: '1.2', color: '#111827' }
                  },
                  {
                    id: `product-desc`,
                    type: 'text-block',
                    settings: { html: `<div style="font-size: 18px; line-height: 1.8; color: #4B5563; margin-bottom: 32px;">${product.description || 'Elevate your daily experience with our premium product, crafted with precision and care.'}</div>` },
                    styles: { textAlign: 'left' }
                  },
                  {
                    id: `product-features`,
                    type: 'text-block',
                    settings: {
                      html: `
                        <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
                          <div style="display: flex; align-items: center; gap: 14px; font-weight: 600; color: #1F2937; font-size: 16px;"><div style="min-width: 26px; height: 26px; background: #10B981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px;">✓</div> Authentic Quality Assured</div>
                          <div style="display: flex; align-items: center; gap: 14px; font-weight: 600; color: #1F2937; font-size: 16px;"><div style="min-width: 26px; height: 26px; background: #10B981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px;">✓</div> Fast Doorstep Delivery</div>
                          <div style="display: flex; align-items: center; gap: 14px; font-weight: 600; color: #1F2937; font-size: 16px;"><div style="min-width: 26px; height: 26px; background: #10B981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px;">✓</div> Cash on Delivery Available</div>
                        </div>
                      `
                    },
                    styles: { textAlign: 'left' }
                  }
                ]
              }
            ]
          },
          {
            id: `checkout-container`,
            type: 'checkout',
            settings: {
              productId: product.id,
              title: 'Complete Your Order',
              buttonText: 'Order Now - Cash on Delivery',
              showProductSummary: true
            },
            styles: {
              paddingTop: 60,
              paddingBottom: 0,
              maxWidth: 950,
              marginLeft: 'auto',
              marginRight: 'auto'
            }
          }
        ]
      }
    ]
  };
}
