'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Loading from '@/components/loading';

function LayoutPages({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const router = useRouter();
    const pathname = usePathname(); 
    const [pages , setPages] = useState(<Loading/>)
    useEffect(() => {
        const isAuthenticated = localStorage.getItem('access_token');
        // ถ้าไม่ได้ล็อกอิน
        if (!isAuthenticated) {
            localStorage.clear()
            setPages(<>{children}</>);
        } else {
            router.push('/pages-claim/main')
        }
        
    }, [pathname]);

    return pages;
}

export default LayoutPages;
