import Link from "next/link";
import { activities } from "../_data/recentActivities";

export const RecentActivity = () => {
  return (
    <div className="flex h-full max-h-[512px] flex-col rounded-xl border border-border bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold">Recent activity</h2>
        <Link
          href="/vendor/orders/pending"
          className="text-sm text-accent hover:text-accent-strong"
        >
          View all
        </Link>
      </div>

      <ul className="-mr-2 flex-1 space-y-5 overflow-y-auto pr-2">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-start gap-3">
            <img
              src={activity.avatar}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">
                <span className="font-medium">{activity.user}</span>{" "}
                <span className="text-muted">{activity.action}</span>
              </p>
              <p className="truncate text-xs text-muted">{activity.detail}</p>
            </div>
            <span className="shrink-0 whitespace-nowrap text-xs text-muted">
              {activity.time}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
