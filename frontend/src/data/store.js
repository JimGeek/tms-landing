export const storeProducts = [
    {
        id: 1,
        name: 'Premium Swing Mechanism',
        category: 'Hardware',
        price: '₹ 12,500',
        image: '/service-swing.png',
        type: 'product',
        description: 'Heavy duty bearing mechanism for smooth swing motion.',
        has3D: false,
        customizationOptions: []
    },
    {
        id: 2,
        name: 'Custom CNC Gate Design',
        category: 'Gates',
        price: 'Starting @ ₹ 450/sqft',
        image: '/service-gate.png',
        type: 'service',
        description: 'Bespoke gate designs tailored to your architectural style.',
        has3D: true,
        modelConfig: { type: 'gate', style: 'classic' },
        customizationOptions: [
            { name: 'Finish', type: 'color', values: ['Matte Black', 'Gold', 'Silver'] },
            { name: 'Material', type: 'select', values: ['Iron', 'Steel', 'Aluminum'] }
        ]
    },
    {
        id: 3,
        name: 'Modern Pergola Kit (10x10)',
        category: 'Gazebos',
        price: '₹ 1,50,000',
        image: '/hero-bg.png',
        type: 'product',
        description: 'DIY friendly pergola kit with all necessary fixtures.',
        has3D: false,
        customizationOptions: [
            { name: 'Roof Material', type: 'select', values: ['Polycarbonate', 'Glass', 'Louvered'] }
        ]
    },
    {
        id: 4,
        name: 'Staircase Railing Consultation',
        category: 'Staircase',
        price: 'Free',
        image: '/service-staircase.png',
        type: 'service',
        description: 'Expert consultation for your dream floating staircase.',
        has3D: false,
        customizationOptions: []
    },
    {
        id: 5,
        name: 'Decorative Laser Cut Panel',
        category: 'Grills',
        price: '₹ 3,200',
        image: '/service-grills.png',
        type: 'product',
        description: '2x4 ft MS panel with powder coating.',
        has3D: false,
        customizationOptions: [
            { name: 'Thickness', type: 'select', values: ['2mm', '3mm', '5mm'] },
            { name: 'Color', type: 'color', values: ['White', 'Black', 'Grey'] }
        ]
    },
    {
        id: 6,
        name: 'Modern Sliding Gate',
        category: 'Gates',
        price: '₹ 85,000',
        image: '/service-gate.png',
        type: 'product',
        description: 'Minimalist sliding gate with automated motor compatibility.',
        has3D: true,
        modelConfig: { type: 'gate', style: 'modern' },
        customizationOptions: [
            { name: 'Size', type: 'select', values: ['10x6 ft', '12x6 ft', '15x6 ft'] },
            { name: 'Finish', type: 'color', values: ['Matte Black', 'Silver', 'Wood Grain'] }
        ]
    }
];

export const storeCategories = ['All', 'Gates', 'Gazebos', 'Staircase', 'Grills', 'Hardware'];
