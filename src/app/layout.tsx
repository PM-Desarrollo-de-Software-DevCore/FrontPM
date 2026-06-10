import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "../styles/globals.css";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { NotificationProvider } from "@/components/ui/notifications/NotificationProvider";
import { ConfirmProvider } from "@/components/ui/confirm/ConfirmProvider";
import ThemeProvider from "@/components/ui/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans', preload: false});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "DevCore — Project Management",
  description: "Gestión de proyectos, sprints y tareas de DevCore.",
};

/* Aplica la clase `dark` antes del primer paint para evitar el flash de tema
 * claro al recargar con tema oscuro guardado. Debe ser un script inline en
 * <head>: cualquier efecto de React corre después del primer render. */
const themeInitScript = `
try {
  var stored = localStorage.getItem("theme");
  var dark = stored === "dark" || (!stored && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", figtree.variable)}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <NotificationProvider>
                <ConfirmProvider>{children}</ConfirmProvider>
              </NotificationProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}