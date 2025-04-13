import Navbar from "@/components/Navbar";
import { PlayerController } from "@/components/playerController";
import { PlayerProvider } from "@/providers/PlayerProvider";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <PlayerProvider>
            <Navbar />
            <article className="flex-1 overflow-y-auto mb-16">{children}</article>
            <PlayerController />
        </PlayerProvider>
    );
}
