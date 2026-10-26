import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

// Revision Control type system: an engineering sans for the register,
// a drafting mono for sheet numbers, revisions, and timestamps.
export const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-face",
  weight: ["400", "500", "600", "700"],
});

export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-face",
  weight: ["400", "500", "600"],
});
