import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { CheckCircle, Home, MessageSquare } from 'lucide-react';

export default function FeedbackThankYouPage() {
    return (
        <div className="container mx-auto py-16 px-4">
            <div className="max-w-2xl mx-auto text-center">
                <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-16 w-16 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-800">
                            Thank You for Your Feedback!
                        </CardTitle>
                        <CardDescription className="text-green-700">
                            Your feedback has been successfully submitted and is
                            very important to us.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center space-y-4">
                            <p className="text-gray-700">
                                We appreciate you taking the time to share your
                                experience with us. Your insights help us
                                continuously improve our service and create
                                better dining experiences for all our guests.
                            </p>

                            <div className="bg-white p-4 rounded-lg border border-green-200">
                                <h3 className="font-semibold text-green-800 mb-2">
                                    What happens next?
                                </h3>
                                <ul className="text-sm text-gray-600 space-y-1 text-left">
                                    <li>
                                        • Our team will review your feedback
                                        within 24 hours
                                    </li>
                                    <li>
                                        • If you provided contact information,
                                        we may reach out to you
                                    </li>
                                    <li>
                                        • Your feedback will help us improve our
                                        services
                                    </li>
                                    <li>
                                        • You'll receive a confirmation email
                                        shortly
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild>
                                <Link
                                    href="/"
                                    className="flex items-center gap-2"
                                >
                                    <Home className="h-4 w-4" />
                                    Back to Home
                                </Link>
                            </Button>

                            <Button variant="outline" asChild>
                                <Link
                                    href="/feedback"
                                    className="flex items-center gap-2"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Submit Another Feedback
                                </Link>
                            </Button>
                        </div>

                        <div className="text-sm text-gray-500 pt-4 border-t border-green-200">
                            <p>
                                Have questions about your feedback? Contact us
                                at{' '}
                                <a
                                    href="mailto:feedback@menuplus.com"
                                    className="text-green-600 hover:underline"
                                >
                                    feedback@menuplus.com
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
