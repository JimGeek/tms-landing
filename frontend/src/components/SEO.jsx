import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, type = 'website' }) => {
    const siteTitle = 'The Metal Store | Custom Fabrication & Design';
    const finalTitle = title ? `${title} | The Metal Store` : siteTitle;
    const finalDesc = description || "India's premier managed marketplace for custom gates, gazebos, railings, and metal structures.";
    const finalImage = image ? `https://themetal.store${image}` : 'https://themetal.store/og-image.jpg'; // Pending domain

    return (
        <Helmet>
            {/* Standard Metrics */}
            <title>{finalTitle}</title>
            <meta name="description" content={finalDesc} />

            {/* Facebook / Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDesc} />
            <meta property="og:image" content={finalImage} />
            <meta property="og:url" content={url || window.location.href} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDesc} />
            <meta name="twitter:image" content={finalImage} />

            {/* Schema.org JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    "name": "The Metal Store",
                    "image": finalImage,
                    "description": finalDesc,
                    "url": "https://themetal.store",
                    "telephone": "+919316723563",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Plot 42, Industrial Area",
                        "addressLocality": "Pune",
                        "addressRegion": "MH",
                        "postalCode": "411001",
                        "addressCountry": "IN"
                    }
                })}
            </script>
        </Helmet>
    );
};

export default SEO;
