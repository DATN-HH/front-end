'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
    const { logout } = useAuth();
    const router = useRouter();
    useEffect(() => {
        const performLogout = async () => {
            await logout();
            router.push('/login');
        };

        performLogout();
    }, [logout, router]);

    return <></>;
}
