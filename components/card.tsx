import Badge, { BadgeVariant } from "./badge";

export default function Card({
  title,
  description,
  badge = "Brand",
  badgeVariant = "brand",
}: {
  title: string;
  description: string;
  badge?: string;
  badgeVariant?: BadgeVariant;
}) {
  return (
    <div className="block w-full rounded-lg border border-gray-200 bg-white p-4 shadow-xs transition-colors hover:bg-gray-50 sm:p-6 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
      <div className="mb-2 sm:mb-3">
        <Badge value={badge} variant={badgeVariant} />
      </div>
      <h5 className="mb-2 text-xl leading-7 font-semibold tracking-tight text-gray-900 sm:mb-3 sm:text-2xl sm:leading-8 dark:text-white">
        {title}
      </h5>
      <p className="text-sm text-gray-600 sm:text-base dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
