export const metadata = {
  title: 'InvestFlow',
  description: 'Sistema de gestão de investimentos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}