import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Регистрация — Строй Дом',
  description: 'Создайте аккаунт для покупок со скидками и управления заказами',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
