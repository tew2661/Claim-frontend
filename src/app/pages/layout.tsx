'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Loading from '@/components/loading/index';
import Header from '@/components/header';

function LayoutPages({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const pathname = usePathname();
    const [pages, setPages] = useState(<Loading />);

    useEffect(() => {
        const isAuthenticated = true;
        
        // ตรวจสอบสถานะล็อกอิน
        if (!isAuthenticated && pathname !== '/login') {
            router.push('/login'); // หากไม่ได้ล็อกอินและไม่ใช่หน้าล็อกอิน เปลี่ยนเส้นทางไปที่ /login
        } else {
            // แสดงผลตามหน้า
            if (pathname === '/login') {
                setPages(<>{children}</>); // หน้า login ไม่แสดง Header
            } else {
                setPages(<>
                    <Header />
                    <div className="body">{children}</div>
                </>); // หน้าอื่น ๆ แสดง Header
            }
        }
    }, [pathname]); // useEffect จะทำงานเมื่อ pathname หรือ router เปลี่ยน

    return <>{pages}</>;
}

export default LayoutPages;
