export type BadgeVariant =
  | "brand"
  | "alternative"
  | "gray"
  | "danger"
  | "success"
  | "warning";

interface BadgeProps {
  value: string;
  variant?: BadgeVariant;
}

export default function Badge({ value, variant = "brand" }: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    brand: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    alternative:
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  };

  return (
    <span
      className={`${variantClasses[variant]} rounded px-1.5 py-0.5 text-xs font-medium`}
    >
      {value}
    </span>
  );
}
