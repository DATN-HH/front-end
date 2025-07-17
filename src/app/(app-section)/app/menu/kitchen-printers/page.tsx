'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Printer } from 'lucide-react';
import { PageTitle } from '@/components/layouts/app-section/page-title';

export default function KitchenPrintersPage() {
    return (
        <div className="space-y-6">
            <PageTitle
                icon={Printer}
                title="Kitchen Printers"
            />

            <Card>
                <CardHeader className="text-center py-12">
                    <Printer className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <CardTitle className="text-2xl">
                        Kitchen Printer Configuration
                    </CardTitle>
                    <CardDescription className="text-lg">
                        This section will allow you to configure kitchen
                        printers and order routing for different stations.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-12">
                    <p className="text-muted-foreground mb-6">
                        Coming soon - Kitchen printer configuration will be
                        available in the next update.
                    </p>
                    <Button disabled>Add Printer</Button>
                </CardContent>
            </Card>
        </div>
    );
}
