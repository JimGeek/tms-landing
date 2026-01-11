export const inspirationCategories = [
    {
        id: 'gazebos',
        title: 'Gazebos & Pergolas',
        image: '/hero-bg.png',
        count: 12,
        description: 'Luxury outdoor living structures.'
    },
    {
        id: 'gates',
        title: 'Main Gates',
        image: '/service-gate.png',
        count: 24,
        description: 'Statement entrances for your property.'
    },
    {
        id: 'staircases',
        title: 'Staircases',
        image: '/service-staircase.png',
        count: 8,
        description: 'Architectural spinal and spiral staircases.'
    },
    {
        id: 'grills',
        title: 'Window Grills',
        image: '/service-grills.png',
        count: 45,
        description: 'Security meets aesthetics.'
    },
    {
        id: 'swings',
        title: 'Swings',
        image: '/service-swing.png',
        count: 15,
        description: 'Relaxation spots for indoor and outdoor.'
    }
];

// Helper to generate mock images for the masonry grid since we don't have 100 real files yet.
// In a real app, this would fetch from an API or a long list of file paths.
export const getCategoryImages = (categoryId) => {
    // Return an array of objects imitating different aspect ratios
    const category = inspirationCategories.find(c => c.id === categoryId);
    const baseImage = category ? category.image : '/logo.png';

    return Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        src: baseImage, // Reusing the category cover for now, in reality these would be different
        title: `${category?.title} Design ${i + 1}`,
        height: Math.floor(Math.random() * (400 - 200 + 1) + 200) // Mock height for masonry effect
    }));
};
