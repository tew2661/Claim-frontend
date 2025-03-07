'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Loading from '@/components/loading/index';
import LoadingSpinner from '@/components/loading/index';

function LayoutPages({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const pathname = usePathname();
    const [pageContent, setPageContent] = useState(<Loading />);

    useEffect(() => {
        const isJtektMode = process.env.NEXT_MODE === 'jtekt';
        
        if (isJtektMode) {
            router.push('/pages'); 
        } else {
            setPageContent(<>{children}</>);
        }
    }, [pathname]);

    return (
        <>
            <div id="loadingSpinner" style={{ display: 'none' }}><LoadingSpinner/></div>
            {pageContent}
        </>
    );
}

export default LayoutPages;
