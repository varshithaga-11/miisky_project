// This file is no longer used in React. Layout is handled by src/App.tsx
// Fonts are now loaded via CSS in index.html
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&family=Caveat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${roboto.variable} ${caveat.variable} { fontFamily: "'Source Sans Pro', sans-serif" }`}>
        <ClientWrapper>{children}</ClientWrapper>
        <ToggleBodyClass/>
        <SwitcherMenu />
      </body>
    </html>
  );
}
