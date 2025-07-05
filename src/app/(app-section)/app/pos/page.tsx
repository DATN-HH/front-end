'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Monitor, 
    ExternalLink, 
    ShoppingCart, 
    Users, 
    CreditCard,
    BarChart3,
    Settings,
    HelpCircle
} from 'lucide-react';

export default function PosRedirectPage() {
    const router = useRouter();

    const openPosSystem = () => {
        // Open POS in same tab
        router.push('/pos/login');
    };

    const openPosNewTab = () => {
        // Open POS in new tab/window
        window.open('/pos/login', '_blank');
    };

    const features = [
        {
            icon: ShoppingCart,
            title: 'Order Management',
            description: 'Process orders quickly with an intuitive interface'
        },
        {
            icon: CreditCard,
            title: 'Payment Processing',
            description: 'Accept cash, card, and digital payments'
        },
        {
            icon: Users,
            title: 'Multi-User Support',
            description: 'Employee login with PIN authentication'
        },
        {
            icon: BarChart3,
            title: 'Real-time Reporting',
            description: 'Track sales and performance metrics'
        }
    ];

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                    <Monitor className="h-12 w-12 text-orange-600 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-900">Point of Sale System</h1>
                </div>
                <p className="text-gray-600 text-lg">
                    Launch the dedicated POS interface for order processing and payment management
                </p>
            </div>

            {/* Main Action Card */}
            <Card className="border-2 border-orange-200 shadow-lg mb-8">
                <CardHeader className="text-center bg-gradient-to-r from-orange-50 to-orange-100">
                    <CardTitle className="text-2xl text-gray-800">
                        Ready to start serving customers?
                    </CardTitle>
                    <p className="text-gray-600 mt-2">
                        The POS system opens in a dedicated interface optimized for touch screens and fast service
                    </p>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={openPosSystem}
                            size="lg"
                            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-medium"
                        >
                            <Monitor className="mr-3 h-5 w-5" />
                            Launch POS System
                        </Button>
                        <Button
                            onClick={openPosNewTab}
                            variant="outline"
                            size="lg"
                            className="border-orange-300 text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-medium"
                        >
                            <ExternalLink className="mr-3 h-5 w-5" />
                            Open in New Window
                        </Button>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start">
                            <HelpCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Best Practice:</p>
                                <p>For dedicated POS stations, open in a new window and use fullscreen mode for the best experience.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {features.map((feature, index) => (
                    <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start">
                                <feature.icon className="h-8 w-8 text-orange-600 mr-4 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 text-sm">{feature.description}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Additional Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border border-gray-200">
                    <CardContent className="p-6 text-center">
                        <Settings className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">POS Settings</h3>
                        <p className="text-gray-600 text-sm mb-4">Configure payment methods, tax rates, and receipts</p>
                        <Button variant="outline" size="sm" disabled>
                            Configure Settings
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardContent className="p-6 text-center">
                        <BarChart3 className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Sales Reports</h3>
                        <p className="text-gray-600 text-sm mb-4">View daily sales, transaction history, and analytics</p>
                        <Button variant="outline" size="sm" disabled>
                            View Reports
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Help Section */}
            <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                    Need help with the POS system? Check our documentation or contact support.
                </p>
            </div>
        </div>
    );
}