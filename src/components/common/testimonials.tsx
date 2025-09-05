'use client';

import { Star, Quote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { managerFeedbackAPI } from '@/api/v1/feedback';

interface Testimonial {
    id: number;
    customerName: string;
    rating: number;
    reviewText: string;
    branchName: string;
    date: string;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${
                        star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                    }`}
                />
            ))}
        </div>
    );
}

export function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                // Fetch recent positive feedback (rating >= 4) to use as testimonials
                const response = await managerFeedbackAPI.getAllFeedback({
                    page: 0,
                    size: 6,
                    minRating: 4,
                    status: 'RESPONDED' // Only show feedback that has been responded to
                });

                const feedbackData = response.data || [];
                const formattedTestimonials: Testimonial[] = feedbackData.map((feedback: any) => ({
                    id: feedback.id,
                    customerName: feedback.customerName,
                    rating: feedback.overallRating,
                    reviewText: feedback.reviewText,
                    branchName: feedback.branch?.name || 'Main Branch',
                    date: feedback.createdAt
                }));

                setTestimonials(formattedTestimonials);
            } catch (error) {
                console.error('Failed to fetch testimonials:', error);
                // Fallback to empty array - component will show a message
                setTestimonials([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    if (loading) {
        return (
            <section className="py-20 px-4 bg-gray-50">
                <div className="container mx-auto text-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg p-6 shadow">
                                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                                    <div className="h-20 bg-gray-300 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 px-4 bg-gray-50">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-serif font-bold mb-4 text-gray-900">
                        What Our Guests Say
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Discover why our customers love dining with us through their authentic experiences and reviews
                    </p>
                </div>

                {testimonials.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg mb-4">
                            Be the first to share your experience with us!
                        </p>
                        <a
                            href="/feedback/restaurant"
                            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
                        >
                            Leave Your Feedback
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.slice(0, 3).map((testimonial) => (
                            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <Quote className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {testimonial.customerName}
                                                </h3>
                                                <StarRating rating={testimonial.rating} />
                                            </div>
                                            <p className="text-sm text-gray-500 mb-3">
                                                {testimonial.branchName} • {new Date(testimonial.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-700 leading-relaxed">
                                        {testimonial.reviewText}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="text-center mt-12">
                    <p className="text-gray-600 mb-4">
                        Share your experience with us
                    </p>
                    <a
                        href="/feedback"
                        className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
                    >
                        Leave Your Feedback
                    </a>
                </div>
            </div>
        </section>
    );
}
