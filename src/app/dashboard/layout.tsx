'use client';
import bgImage from "@/assets/icon/IMG_2932.jpg";
import { CSSProperties } from "react";

function LayoutPages({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const style: CSSProperties | undefined = {
        backgroundImage: `url(${bgImage.src})`,
        height: '100vh',
        width: '100vw',
        display: 'flex',
        position: 'fixed'
    }
    return <>
        <div className="body" style={style}></div>
        <div className="body" style={{ ...style, zIndex: 1 }}>{children}</div>
    </>;
}

export default LayoutPages;
