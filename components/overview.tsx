import { formatCurrency } from "@/utils/currency";
import { BadgeVariant } from "./badge";
import Card from "./card";

export default function Overview() {
  const CARDS = [
    {
      title: formatCurrency(8000000),
      description: "Tiền chi",
      badge: "3%",
      badgeVariant: "success",
    },
    {
      title: formatCurrency(8000000),
      description: "Tiền thu",
      badge: "3%",
      badgeVariant: "success",
    },
    {
      title: formatCurrency(8000000),
      description: "Tiền còn lại",
      badge: "3%",
      badgeVariant: "success",
    },
    {
      title: formatCurrency(8000000),
      description: "Tiền còn lại",
      badge: "3%",
      badgeVariant: "success",
    },
  ];
  return (
    <>
      <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        Tổng quan
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {CARDS.map((card) => (
          <Card
            key={card.title}
            title={card.title}
            description={card.description}
            badge={card.badge}
            badgeVariant={card.badgeVariant as BadgeVariant}
          />
        ))}
      </div>
    </>
  );
}
