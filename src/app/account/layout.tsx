import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Личный кабинет — Строй Дом',
  description: 'Управление профилем, заказами и настройками аккаунта',
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
