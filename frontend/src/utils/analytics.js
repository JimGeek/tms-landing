// Google Analytics 4 & Meta Pixel Integration

export const GA_MEASUREMENT_ID = 'G-C0KMX8J720'; // From user provided ID
export const PIXEL_ID = 'YOUR_PIXEL_ID'; // Placeholder until user provides

export const initAnalytics = () => {
    // GA4 Initialization
    if (!window.gtag) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID);
    }

    // Meta Pixel Initialization
    if (!window.fbq) {
        !function (f, b, e, v, n, t, s) {
            if (f.fbq) return; n = f.fbq = function () {
                n.callMethod ?
                n.callMethod.apply(n, arguments) : n.queue.push(arguments)
            };
            if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
            n.queue = []; t = b.createElement(e); t.async = !0;
            t.src = v; s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s)
        }(window, document, 'script',
            'https://connect.facebook.net/en_US/fbevents.js');
        // fbq('init', PIXEL_ID); // Commented out until ID provided
        // fbq('track', 'PageView');
    }
};

export const trackPageView = (path) => {
    if (window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, { page_path: path });
    }
    if (window.fbq) {
        window.fbq('track', 'PageView');
    }
    console.log(`[Analytics] PageView: ${path}`);
};

export const trackEvent = (eventName, params = {}) => {
    if (window.gtag) {
        window.gtag('event', eventName, params);
    }
    if (window.fbq) {
        // Map common GA4 events to Pixel events
        const pixelMap = {
            'add_to_cart': 'AddToCart',
            'purchase': 'Purchase',
            'view_item': 'ViewContent',
            'begin_checkout': 'InitiateCheckout'
        };
        const pixelEvent = pixelMap[eventName] || 'CustomEvent';
        window.fbq('track', pixelEvent, params);
    }
    console.log(`[Analytics] Event: ${eventName}`, params);
};
