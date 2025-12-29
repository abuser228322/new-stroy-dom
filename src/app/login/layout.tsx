import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вход в аккаунт — Строй Дом',
  description: 'Войдите в личный кабинет для управления заказами и скидками',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
