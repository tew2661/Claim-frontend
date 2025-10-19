'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import InspectionDetailForm from '../../form';

export default function EditInspectionDetailPage() {
    const params = useParams();
    const id = params?.id;

    // In real app fetch data by id. Here mock a record
    // Mock different data based on ID - ID 1 is Locked, others are Unlocked for testing
    const isLocked = id === '1';
    
    const mockData = {
        supplierCode: 'AAA',
        supplierName: 'AAA CO., LTD.',
        partNo: '90151-06811',
        partName: 'SCREW,FLATHEAD',
        model: 'XXX',
        aisFile: { name: 'ais.pdf' },
        sdrFile: { name: 'sdr.pdf' },
        inspectionItems: [
            { 
                no: 1, 
                measuringItem: 'Length', 
                specification: '10.0000',
                tolerancePlus: '0.2000', 
                toleranceMinus: '0.2000', 
                inspectionInstrument: 'Caliper', 
                rank: 'A' 
            }
        ],
        partStatus: 'Active',
        supplierEditStatus: isLocked ? 'Locked' : 'Unlocked'
    }

    return (
        <div className="flex justify-center pt-6 px-6">
            <div className="container">
                <h1 className="text-2xl font-bold mb-4">Edit Inspection Detail - {id}</h1>
                <InspectionDetailForm mode="edit" data={mockData} />
            </div>
        </div>
    )
}
