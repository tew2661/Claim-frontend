import { io, Socket } from "socket.io-client";

let socket: Socket | null = null; // ✅ ใช้ตัวแปร Global เพื่อเก็บ Socket

const getSocket = (): Socket => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3000", {
            transports: ["websocket"], // ✅ ใช้ WebSocket แทน Polling
            reconnectionAttempts: 5, // ✅ ลอง reconnect 5 ครั้งก่อนล้มเหลว
            reconnectionDelay: 3000, // ✅ เวลาหน่วงระหว่างการลองเชื่อมต่อใหม่ (3 วิ)
        });

        socket.on("connect", () => {
            console.log("✅ Socket connected:", socket?.id);
        });

        socket.on("disconnect", () => {
            console.warn("⚠️ Socket disconnected, trying to reconnect...");
        });
    }
    return socket;
};

export { getSocket };
