'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const inter = Inter({ subsets: ["latin"] });

export const MainContext = createContext<any>({})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(()=>{
    const fsocket = io("http://localhost:3732")
    setSocket(fsocket)
    fsocket.on("connect", ()=>{
      setLoaded(true)
    })
  }, [])
  return (
    <html lang="en">
      <body className={inter.className}>
        <MainContext.Provider value={{socket, setSocket}}>
          {loaded ? children : <div>Loading...</div>}
        </MainContext.Provider>
      </body>
    </html>
  );
}
