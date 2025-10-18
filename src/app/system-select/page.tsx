'use client'
import React from 'react';
import { useRouter } from 'next/navigation';

export default function SystemSelect() {
    const router = useRouter();

    const handleSystemSelect = (systemType: string) => {
        if (systemType === 'claim') {
            router.push('/pages-claim');
        } else if (systemType === 'sample') {
            router.push('/pages-sample');
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{ width: '100%', maxWidth: '1000px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ 
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '20px',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        Select System
                    </h1>
                    <div style={{
                        width: '100px',
                        height: '4px',
                        background: '#2563eb',
                        margin: '0 auto',
                        borderRadius: '2px'
                    }}></div>
                </div>

                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '40px',
                    maxWidth: '900px',
                    margin: '0 auto'
                }}>
                    <div 
                        onClick={() => handleSystemSelect('claim')}
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            border: '2px solid #e5e7eb',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            padding: '40px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                margin: '0 auto 30px',
                                background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '60px'
                            }}>
                                🤝
                            </div>
                            
                            <h2 style={{
                                fontSize: '1.8rem',
                                fontWeight: 'bold',
                                color: '#1f2937',
                                marginBottom: '15px'
                            }}>
                                System Claim Management
                            </h2>
                            
                            <p style={{
                                color: '#6b7280',
                                lineHeight: '1.6',
                                fontSize: '1rem'
                            }}>
                                จัดการระบบเคลม การอนุมัติ และรายงานสำหรับ Supplier Claim Management
                            </p>
                            
                            <div style={{
                                marginTop: '25px',
                                color: '#ea580c',
                                fontWeight: '600',
                                fontSize: '1rem'
                            }}>
                                เข้าสู่ระบบ →
                            </div>
                        </div>
                    </div>

                    <div 
                        onClick={() => handleSystemSelect('sample')}
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            border: '2px solid #e5e7eb',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            padding: '40px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                margin: '0 auto 30px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '60px'
                            }}>
                                📊
                            </div>
                            
                            <h2 style={{
                                fontSize: '1.8rem',
                                fontWeight: 'bold',
                                color: '#1f2937',
                                marginBottom: '15px'
                            }}>
                                System Sample Data Sheet
                            </h2>
                            
                            <p style={{
                                color: '#6b7280',
                                lineHeight: '1.6',
                                fontSize: '1rem'
                            }}>
                                จัดการข้อมูลตัวอย่าง การตรวจสอบ และการอนุมัติเอกสาร
                            </p>
                            
                            <div style={{
                                marginTop: '25px',
                                color: '#1d4ed8',
                                fontWeight: '600',
                                fontSize: '1rem'
                            }}>
                                เข้าสู่ระบบ →
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '60px', color: '#6b7280' }}>
                    <p>กรุณาเลือกระบบที่ต้องการใช้งาน</p>
                </div>
            </div>
        </div>
    );
}