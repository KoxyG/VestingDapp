import { Inter } from "next/font/google";
import "./globals.css";
import { DAppContextProvider } from "@/context";



const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vesting DApp",
  description: "Decentralized Vesting DApp",
};



export default function RootLayout({ children }) {



  return (
    <html lang="en">
      <body className={inter.className}>
        <DAppContextProvider>
        {children}
        </DAppContextProvider>
      </body>
    </html>
  );
}
