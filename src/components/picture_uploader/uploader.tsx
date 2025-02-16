import { useEffect, useState } from "react";
import generateRandomString from "../generate_string/random_string";
import { Button } from "primereact/button";

interface PictureUploaderProps {
    title: string;
    defualt: {
        imageUrl: string | null
        file: File | null
    },
    onImageChange: (imageUrl: string | null, file: File | null) => void; // Callback function
}

export default function PictureUploader({ title, defualt, onImageChange }: PictureUploaderProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const keyElement = generateRandomString(20);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl); // แสดงภาพที่เลือกไว้
            onImageChange(imageUrl, file); // ส่งค่ากลับไปยังพาเรนต์
        } else {
            // setSelectedImage(null);
            // onImageChange(null, null); // ส่งค่า null กลับเมื่อไม่มีไฟล์
        }
    };

    // อัปเดต selectedImage เมื่อ defualt.imageUrl เปลี่ยน
    useEffect(() => {
        setSelectedImage(defualt.imageUrl);
    }, [defualt.imageUrl]);

    return (
        <div className="grid">

            <div
                className="bg-blue-100 border border-gray-300 p-6 flex justify-center items-center cursor-pointer h-[500px] overflow-hidden"

            >

                {selectedImage ? (
                    <div className="flex items-center relative h-[500px]">
                        <img
                            src={selectedImage}
                            alt="Selected"
                            className="w-full h-full object-cover"
                            onClick={() => document.getElementById(keyElement)?.click()} // Trigger file input click
                        />
                        <Button
                            icon="pi pi-times"
                            rounded
                            aria-label="Filter"
                            severity="secondary"
                            tooltip={"Remove Image " + title}
                            tooltipOptions={{
                                position: 'top'
                            }}
                            style={{
                                margin: '10px',
                                padding: 0,
                                zIndex: 1,
                                position: 'absolute',
                                top: 0,
                                right: 0,
                            }}
                            onClick={() => {
                                setSelectedImage(null);
                                onImageChange(null, null); // ส่งค่า null กลับเมื่อไม่มีไฟล์
                            }}
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center"
                        onClick={() => document.getElementById(keyElement)?.click()} 
                    >
                        <span
                            className="text-gray-500"
                            // Trigger file input click
                        >{title}</span>
                    </div>
                )}
            </div>
            <input
                id={keyElement}
                type="file"
                accept="image/*"
                className="hidden" // ซ่อน input
                onChange={handleImageChange}
            />
            <button className="" disabled={!selectedImage} onClick={() => { window.open(`${selectedImage}`, "_blank") }}>View Image {title}</button>
        </div>
    );
}
