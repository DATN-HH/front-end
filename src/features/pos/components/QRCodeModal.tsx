import { Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
}

export function QRCodeModal({ isOpen, onClose, orderId }: QRCodeModalProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_FRONTEND;
    const qrUrl = `${apiUrl}/self-order/${orderId}?t=${Date.now()}`;

    const handlePrint = () => {
        if (printRef.current) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Self-Order QR Code</title>
                            <style>
                                body { 
                                    font-family: Arial, sans-serif; 
                                    margin: 20px; 
                                }
                                .receipt { 
                                    max-width: 400px; 
                                    margin: 0 auto; 
                                }
                                .header { 
                                    text-align: center; 
                                    margin-bottom: 20px; 
                                }
                                .qr-section { 
                                    text-align: center; 
                                    margin: 20px 0; 
                                }
                                .info { 
                                    text-align: center; 
                                    margin: 20px 0;
                                    font-size: 14px;
                                }
                                .url {
                                    text-align: center;
                                    margin: 10px 0;
                                    font-size: 12px;
                                    color: #666;
                                    word-break: break-all;
                                }
                                .footer { 
                                    text-align: center; 
                                    margin-top: 20px; 
                                    font-size: 12px; 
                                    color: #666; 
                                }
                            </style>
                        </head>
                        <body>
                            <div class="receipt">
                                <div class="header">
                                    <h2>Self-Order QR Code</h2>
                                    <p>Order #${orderId}</p>
                                </div>
                                <div class="qr-section">
                                    ${printRef.current.innerHTML}
                                </div>
                                <div class="info">
                                    Scan QR code to view and manage your order
                                </div>
                                <div class="url">
                                    ${qrUrl}
                                </div>
                                <div class="footer">
                                    Thank you for using our service!
                                </div>
                            </div>
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Self-Order QR Code</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4">
                    <div ref={printRef} className="bg-white p-4 rounded-lg">
                        <QRCodeSVG
                            value={qrUrl}
                            size={200}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                    <p className="text-sm text-gray-500">
                        Scan this QR code to view and manage your order
                    </p>
                    <p className="text-xs text-gray-400 break-all text-center">
                        {qrUrl}
                    </p>
                    <Button onClick={handlePrint} className="w-full">
                        <Printer className="w-4 h-4 mr-2" />
                        Print QR Code
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
