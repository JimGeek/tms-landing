export const projects = [
    {
        id: 'luxury-poolside-gazebo',
        title: 'Luxury Poolside Gazebo',
        category: 'Gazebo',
        summary: 'A modern black metal pergola with automated louvers and integrated lighting.',
        location: 'Beverly Hills of India, Pune',
        date: 'November 2025',
        image: '/hero-bg.png', // Using existing asset for now
        description: 'This project involved designing and fabricating a high-end metal gazebo for a luxury villa. The structure features a motorized louvered roof, allowing the client to control sunlight and ventilation. The integrated LED lighting creates a warm ambiance for evening gatherings.',
        features: ['Automated Louvered Roof', 'Integrated LED Lighting', 'Weather-resistant Coating', 'Custom Concrete Seating'],
        materials: 'Galvanized Steel, Aluminum Louvers, Polycarbonate',
    },
    {
        id: 'grand-entrance-gate',
        title: 'Grand Palace Entrance Gate',
        category: 'Gates',
        summary: 'A majestic 12ft high wrought iron main gate with gold leaf detailing.',
        location: 'Jubilee Hills, Hyderabad',
        date: 'October 2025',
        image: '/service-gate.png',
        description: 'For this immense estate, we crafted a gate that signifies power and elegance. Using traditional wrought iron techniques combined with modern automation, this gate serves as both a security barrier and a work of art.',
        features: ['Gold Leaf Accents', 'Automated Swing Mechanism', 'Video Door Phone Integration', 'rust-proof epoxy primer'],
        materials: 'Wrought Iron, Cast Iron Ornaments',
    },
    {
        id: 'floating-staircase',
        title: 'Minimalist Floating Staircase',
        category: 'Staircase',
        summary: 'A spine-beam structure with solid teak wood steps.',
        location: 'Penthouse, Mumbai',
        date: 'December 2025',
        image: '/service-staircase.png',
        description: 'A structural marvel, this staircase appears to float in mid-air. The central steel spine supports heavy teak wood treads, with a glass railing that maintains the visual openness of the space.',
        features: ['Hidden Structural Supports', 'Teak Wood Treads', 'toughened Glass Railing', 'Vibration Damping'],
        materials: 'Mild Steel Spine, Teak Wood, 12mm Toughened Glass',
    }
];

export const getProject = (id) => projects.find(p => p.id === id);
