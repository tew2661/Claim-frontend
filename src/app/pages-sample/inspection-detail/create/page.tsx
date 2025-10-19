'use client';

import React from 'react';
import InspectionDetailForm from '../form';

export default function CreateInspectionDetailPage() {
    return (
        <div className="flex justify-center pt-6 px-6">
            <div className="container">
                <h1 className="text-2xl font-bold mb-4">Create Inspection Detail</h1>
                <InspectionDetailForm mode="create" />
            </div>
        </div>
    )
}
