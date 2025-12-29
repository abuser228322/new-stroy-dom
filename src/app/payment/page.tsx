import { Metadata } from "next";
import { FaTruck, FaCreditCard, FaMoneyBillWave, FaHandshake, FaFileInvoice, FaPercent } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Доставка и оплата | Строй Дом - Астрахань",
  description: "Информация о доставке и способах оплаты в магазине строительных материалов Строй Дом. Доставка по Астрахани и области, наличный и безналичный расчёт.",
};

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Доставка и оплата</h1>
          <p className="text-sm sm:text-lg opacity-90">
            Удобные способы оплаты и доставка по всей Астраханской области
          </p>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        {/* Delivery Section */}
        <section className="mb-8 sm:mb-16">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-8 text-gray-800 flex items-center gap-2 sm:gap-3">
            <FaTruck className="text-primary text-lg sm:text-2xl" />
            Доставка
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {/* Self Pickup */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">Самовывоз</h3>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                Заберите заказ самостоятельно с нашего склада по адресу:
              </p>
              <p className="font-medium text-gray-800 text-sm sm:text-base">г. Астрахань, ул. Рыбинская 25Н</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Пн-Сб: 08:00-16:00, Вск: 08:00-14:00</p>
              <div className="mt-4 pt-4 border-t">
                <span className="inline-block bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
                  Бесплатно
                </span>
              </div>
            </div>

            {/* City Delivery */}
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Доставка по городу</h3>
              <p className="text-gray-600 mb-4">
                Доставляем строительные материалы по всему городу Астрахань.
              </p>
              <ul className="text-gray-700 space-y-2">
                <li>• Грузовой транспорт</li>
                <li>• Подъём на этаж</li>
                <li>• Разгрузка краном</li>
              </ul>
              <div className="mt-4 pt-4 border-t">
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  от 500 ₽
                </span>
              </div>
            </div>

            {/* Region Delivery */}
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Доставка по области</h3>
              <p className="text-gray-600 mb-4">
                Осуществляем доставку в любой населённый пункт Астраханской области.
              </p>
              <ul className="text-gray-700 space-y-2">
                <li>• Ахтубинск, Харабали</li>
                <li>• Камызяк, Красный Яр</li>
                <li>• Другие районы</li>
              </ul>
              <div className="mt-4 pt-4 border-t">
                <span className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
                  Рассчитывается индивидуально
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Notes */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="font-semibold text-gray-800 mb-3">Обратите внимание:</h4>
            <ul className="text-gray-700 space-y-2">
              <li>• Стоимость доставки зависит от веса, объёма и дальности</li>
              <li>• При заказе от 30 000 ₽ — скидка на доставку 50%</li>
              <li>• При заказе от 50 000 ₽ — бесплатная доставка по городу</li>
              <li>• Точную стоимость уточняйте у менеджера</li>
            </ul>
          </div>
        </section>

        {/* Payment Section */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-3">
            <FaCreditCard className="text-primary" />
            Способы оплаты
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cash */}
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMoneyBillWave className="text-success text-2xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Наличные</h3>
              <p className="text-gray-600 text-sm">
                Оплата наличными при получении товара в магазине или при доставке
              </p>
            </div>

            {/* Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCreditCard className="text-primary text-2xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Банковская карта</h3>
              <p className="text-gray-600 text-sm">
                Оплата картой Visa, MasterCard, МИР через терминал в магазине
              </p>
            </div>

            {/* Bank Transfer */}
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFileInvoice className="text-accent text-2xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Безналичный расчёт</h3>
              <p className="text-gray-600 text-sm">
                Оплата по счёту для юридических лиц и ИП
              </p>
            </div>

            {/* Credit */}
            <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPercent className="text-purple-600 text-2xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Рассрочка</h3>
              <p className="text-gray-600 text-sm">
                Возможность рассрочки на крупные заказы — уточняйте у менеджера
              </p>
            </div>
          </div>

          {/* For Business */}
          <div className="mt-12 p-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl text-white">
            <div className="flex items-center gap-4 mb-4">
              <FaHandshake className="text-4xl text-accent" />
              <h3 className="text-xl font-bold">Работаем с юридическими лицами</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Предоставляем полный пакет документов для бухгалтерии: счёт-фактура, товарная накладная, акт выполненных работ.
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>✓ Индивидуальные условия для постоянных клиентов</li>
              <li>✓ Отсрочка платежа для проверенных контрагентов</li>
              <li>✓ Скидки на оптовые заказы</li>
            </ul>
            <a
              href="tel:+79371333366"
              className="inline-block mt-6 bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Связаться с менеджером
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
