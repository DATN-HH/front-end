import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';

export default function KitchenPrintersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/app/menu">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Menu
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Kitchen Printers
                    </h1>
                    <p className="text-muted-foreground">
                        Configure kitchen printing stations and order routing
                    </p>
                </div>
            </div>

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
