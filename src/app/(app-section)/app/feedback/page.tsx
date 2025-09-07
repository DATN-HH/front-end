'use client';

import React, { useEffect, useState } from 'react';
import { FeedbackDashboard } from '@/features/feedback/components/FeedbackDashboard';

export default function ManagerFeedbackPage() {
    const [branches, setBranches] = useState<
        Array<{ id: number; name: string }>
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBranches = async () => {
            try {
                // Mock branches for now since we don't have the API implemented
                setBranches([
                    { id: 1, name: 'Branch 1' },
                    { id: 2, name: 'Branch 2' },
                    { id: 3, name: 'Branch 3' },
                ]);
            } catch (error) {
                console.error('Failed to load branches:', error);
                // Fallback to mock data
                setBranches([
                    { id: 1, name: 'Branch 1' },
                    { id: 2, name: 'Branch 2' },
                    { id: 3, name: 'Branch 3' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadBranches();
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-64"></div>
                    <div className="h-4 bg-gray-200 rounded w-96"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-24 bg-gray-200 rounded"
                            ></div>
                        ))}
                    </div>
                    <div className="h-96 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <FeedbackDashboard branches={branches} />
        </div>
    );
}

