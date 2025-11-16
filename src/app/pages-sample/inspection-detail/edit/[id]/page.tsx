'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import InspectionDetailForm from '../../form';
import { Get } from '@/components/fetch';

export default function EditInspectionDetailPage() {
    const params = useParams();
    const id = params?.id;

    const [initialData, setInitialData] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setInitialData(null);
            return;
        }

        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await Get({ url: `/inspection-detail/detail/${id}` });
                if (!res.ok) {
                    const err: any = await res.json().catch(() => ({}));
                    throw new Error(err.message || 'Failed to load inspection detail');
                }
                const json: any = await res.json();
                const data = json.data;
                setInitialData({
                    ...data,
                    aisFile: data?.aisFile || null,
                    sdrFile: data?.sdrFile || null,
                });
            } catch (err: any) {
                console.error('Load inspection detail failed', err);
                setError(err.message || 'Unable to load data');
                setInitialData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    if (!id) {
        return <div className="flex justify-center pt-6 px-6"><div className="container">Missing inspection detail ID</div></div>;
    }

    return (
        <div className="flex justify-center pt-6 px-6">
            <div className="container">
                <h1 className="text-2xl font-bold mb-4">Edit Inspection Detail - {id}</h1>
                {loading && (
                    <p className="text-gray-500">Loading inspection detail...</p>
                )}
                {error && (
                    <p className="text-red-500">{error}</p>
                )}
                {initialData && (
                    <InspectionDetailForm mode="edit" data={initialData} />
                )}
                {!loading && !error && !initialData && (
                    <p className="text-gray-500">No inspection detail data available.</p>
                )}
            </div>
        </div>
    );
}
