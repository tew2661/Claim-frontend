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
        const IsJtekt = (process.env.NEXT_MODE == 'jtekt');
        const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : undefined
        if (!IsJtekt || !user || user.accessMasterManagement !== 'Y') {
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
