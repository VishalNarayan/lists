import './globals.css'

export const metadata = {
  title: "Lists",
  description: "For making lists",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
