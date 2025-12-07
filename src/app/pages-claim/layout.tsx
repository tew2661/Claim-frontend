'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Loading from '@/components/loading/index';
import Header from '@/components/header';
import LoadingSpinner from '@/components/loading/index';
import bgImage from "@/assets/icon/IMG_2932.jpg";

function LayoutPages({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const pathname = usePathname();
    const [pages, setPages] = useState(<Loading />);

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('access_token')!;
        const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : undefined;
        const IsJtekt = (process.env.NEXT_MODE == 'jtekt');
        // ตรวจสอบสถานะล็อกอิน
        if (!isAuthenticated && pathname !== '/login') {
            router.push('/login'); // หากไม่ได้ล็อกอินและไม่ใช่หน้าล็อกอิน เปลี่ยนเส้นทางไปที่ /login
        } else {
            // แสดงผลตามหน้า
            if (pathname === '/login') {
                setPages(<>{children}</>); // หน้า login ไม่แสดง Header
            } else {
                
                if (!user.expiresPassword || (new Date(user.expiresPassword) < new Date())) {
                    router.push('/pages-claim/reset-password?redirect=' + encodeURIComponent(pathname))
                }

                setPages(<>
                    <Header IsJtekt={IsJtekt} menu='claim' />
                    <div className='body' style={{ backgroundImage: `url(${bgImage.src})` }}>
                        <div className="body">{children}</div>
                    </div>
                </>); // หน้าอื่น ๆ แสดง Header
            }
        }
    }, [pathname]); // useEffect จะทำงานเมื่อ pathname หรือ router เปลี่ยน

    return <>
        <div id="loadingSpinner" style={{ display: 'none' }}><LoadingSpinner/></div>{pages}
    </>;
}

export default LayoutPages;
