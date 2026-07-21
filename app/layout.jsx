import "./globals.css";

export const metadata = {
  title: "Fairway Dynasty",
  description: "Premium dynasty fantasy golf."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
