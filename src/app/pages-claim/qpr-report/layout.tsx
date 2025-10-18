'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Loading from '@/components/loading/index';
import Header from '@/components/header';
import LoadingSpinner from '@/components/loading/index';

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
        const IsJtekt = (process.env.NEXT_MODE == 'jtekt');
        
        if (IsJtekt) {
            router.push('/pages-claim'); 
        } else {
            setPages(<>{children}</>)
        }
    }, [pathname]); // useEffect จะทำงานเมื่อ pathname หรือ router เปลี่ยน

    return <>
        <div id="loadingSpinner" style={{ display: 'none' }}><LoadingSpinner/></div>{pages}
    </>;
}

export default LayoutPages;
