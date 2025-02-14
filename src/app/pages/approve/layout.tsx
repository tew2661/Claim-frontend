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
    
    const getCheckerLevel = (pathname: string): "checker1" | "checker2" | "checker3" | null => {
        const match = pathname.match(/\/checker(1|2|3)(\/|$)/);
        return match ? (`checker${match[1]}` as "checker1" | "checker2" | "checker3") : null;
    };

    useEffect(() => {
        const IsJtekt = (process.env.NEXT_MODE == 'jtekt');
        const role = localStorage.getItem('role')!; 
        if (!IsJtekt) {
            router.push('/pages'); 
        } else {
            if (getCheckerLevel(pathname) == 'checker1' && role == 'Leader / Engineer') {
                setPages(<>{children}</>)
            } else if (getCheckerLevel(pathname) == 'checker2' && role == 'Supervision / Asistant Manager') {
                setPages(<>{children}</>)
            } else if (getCheckerLevel(pathname) == 'checker3' && (role == 'Manager' || role == 'GM / DGM' || role == 'Plant Manager')) {
                setPages(<>{children}</>)
            } else {
                router.back()
            }  
        }
    }, [pathname]); // useEffect จะทำงานเมื่อ pathname หรือ router เปลี่ยน

    return <>
        <div id="loadingSpinner" style={{ display: 'none' }}><LoadingSpinner/></div>{pages}
    </>;
}

export default LayoutPages;
