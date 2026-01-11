import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Layers, CheckCircle2 } from 'lucide-react';
import { getProject } from '../data/projects';
import SEO from '../components/SEO';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const project = getProject(id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Project Not Found</h2>
                    <button
                        onClick={() => navigate('/work')}
                        className="text-blue-600 hover:underline"
                    >
                        Back to Portfolio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen bg-white">
            <SEO
                title={project.title}
                description={project.summary}
                image={project.image}
            />
            {/* Hero Image */}
            <div className="h-[50vh] md:h-[70vh] w-full relative">
                <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-0 left-0 p-8 md:p-16 text-white w-full max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 bg-white text-black text-sm font-bold uppercase tracking-wider mb-4 rounded-full">
                            {project.category}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight">
                            {project.title}
                        </h1>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-6 py-16">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Sidebar / Meta Info */}
                    <motion.aside
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/3 space-y-8"
                    >
                        <Link to="/work" className="inline-flex items-center text-metallic-600 hover:text-black mb-4">
                            <ArrowLeft size={20} className="mr-2" /> Back to All Projects
                        </Link>

                        <div className="bg-metallic-50 p-8 rounded-2xl border border-metallic-100">
                            <h3 className="text-xl font-bold mb-6 font-display">Project Details</h3>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <MapPin className="w-5 h-5 text-metallic-500 mr-4 mt-1" />
                                    <div>
                                        <p className="text-sm text-metallic-500 uppercase tracking-wide">Location</p>
                                        <p className="font-semibold">{project.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Calendar className="w-5 h-5 text-metallic-500 mr-4 mt-1" />
                                    <div>
                                        <p className="text-sm text-metallic-500 uppercase tracking-wide">Completed</p>
                                        <p className="font-semibold">{project.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <Layers className="w-5 h-5 text-metallic-500 mr-4 mt-1" />
                                    <div>
                                        <p className="text-sm text-metallic-500 uppercase tracking-wide">Materials Used</p>
                                        <p className="font-semibold italic text-metallic-700">{project.materials}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.aside>

                    {/* Main Description */}
                    <div className="lg:w-2/3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold mb-6 font-display">About the Project</h2>
                            <p className="text-lg text-metallic-700 leading-relaxed mb-10">
                                {project.description}
                            </p>

                            <h3 className="text-2xl font-bold mb-6 font-display">Key Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {project.features.map((feature, i) => (
                                    <div key={i} className="flex items-center p-4 bg-metallic-50 rounded-lg border border-metallic-100">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mr-3" />
                                        <span className="font-medium text-metallic-800">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
