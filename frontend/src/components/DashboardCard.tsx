interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
}

export default function DashboardCard({
  title,
  description,
  icon,
  action,
  onClick,
}: DashboardCardProps) {
  return (
    <div
      className={`card hover:shadow-md transition-shadow duration-200 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 p-2 bg-primary-100 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
