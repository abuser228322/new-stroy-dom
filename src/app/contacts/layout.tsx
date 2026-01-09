import { Metadata } from "next";
import { LocalBusinessSchema } from "../components/SchemaOrg";

export const metadata: Metadata = {
  title: "Контакты | Строй Дом - Астрахань",
  description: "Контакты магазина строительных материалов Строй Дом в Астрахани. Адрес: ул. Рыбинская 25Н. Телефон: 8-937-133-33-66. Режим работы: Пн-Сб 08:00-16:00, Вск 08:00-14:00.",
  openGraph: {
    title: "Контакты | Строй Дом",
    description: "Магазин строительных материалов в Астрахани. Широкий ассортимент, доставка, консультации специалистов.",
    type: "website",
  },
  alternates: {
    canonical: "https://stroydom30.ru/contacts",
  },
};

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LocalBusinessSchema />
      {children}
    </>
  );
}
