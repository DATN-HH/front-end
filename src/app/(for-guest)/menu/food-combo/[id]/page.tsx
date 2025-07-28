import { Metadata } from 'next';

import FoodComboDetail from '@/features/pre-order/components/FoodComboDetail';

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params }: Props) {
    const { id } = await params;
    return <FoodComboDetail id={id} />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    return {
        title: `Food Combo ${id}`,
        description: 'Food Combo Details',
    };
}
