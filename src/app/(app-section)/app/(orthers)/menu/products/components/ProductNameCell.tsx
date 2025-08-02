'use client';

import { ImageIcon as ImageLucide } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductNameCellProps {
    id: number;
    name: string;
    image?: string;
    internalReference?: string;
}

export function ProductNameCell({
    id,
    name,
    image,
    internalReference,
}: ProductNameCellProps) {
    return (
        <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
                {image ? (
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                        <Image
                            src={image}
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="40px"
                        />
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                        <ImageLucide className="h-5 w-5 text-gray-400" />
                    </div>
                )}
            </div>
            <div>
                <Link
                    href={`/app/menu/products/${id}/detail`}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                    {name}
                </Link>
                <div className="text-sm text-gray-500">
                    {internalReference || '-'}
                </div>
            </div>
        </div>
    );
}
