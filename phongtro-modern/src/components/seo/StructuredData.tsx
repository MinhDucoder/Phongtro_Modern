interface StructuredDataProps {
  type: 'website' | 'organization' | 'breadcrumb' | 'property';
  data: Record<string, unknown> | null;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Phongtro123.com",
          "url": "https://phongtro123.com",
          "description": "Kênh thông tin Phòng Trọ số 1 Việt Nam",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://phongtro123.com/tim-kiem?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        };

      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Phongtro123.com",
          "url": "https://phongtro123.com",
          "logo": "https://phongtro123.com/logo.png",
          "description": "Kênh thông tin Phòng Trọ số 1 Việt Nam",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+84-xxx-xxx-xxx",
            "contactType": "customer service",
            "availableLanguage": "Vietnamese"
          },
          "sameAs": [
            "https://www.facebook.com/phongtro123",
            "https://www.youtube.com/phongtro123"
          ]
        };

      case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": (data as unknown as Array<{name: string, url: string}>).map((item, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        };

      case 'property':
        return {
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          "name": (data as Record<string, unknown>).title,
          "description": (data as Record<string, unknown>).description,
          "url": (data as Record<string, unknown>).url,
          "image": (data as Record<string, unknown>).images,
          "offers": {
            "@type": "Offer",
            "price": (data as Record<string, unknown>).price,
            "priceCurrency": "VND",
            "availability": "https://schema.org/InStock"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": (data as Record<string, unknown>).location,
            "addressCountry": "VN"
          },
          "floorSize": {
            "@type": "QuantitativeValue",
            "value": (data as Record<string, unknown>).area,
            "unitCode": "MTK"
          }
        };

      default:
        return {};
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData(), null, 2)
      }}
    />
  );
}
