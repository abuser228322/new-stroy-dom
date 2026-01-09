import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Акции и скидки | Строй Дом - Астрахань",
  description: "Актуальные акции и специальные предложения в магазине строительных материалов Строй Дом. Скидки на сухие смеси, профнастил, бесплатная доставка.",
  openGraph: {
    title: "Акции и скидки | Строй Дом",
    description: "Выгодные предложения на строительные материалы в Астрахани",
    type: "website",
  },
  alternates: {
    canonical: "https://stroydom30.ru/sales",
  },
};

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
