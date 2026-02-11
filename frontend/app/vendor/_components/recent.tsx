import { activities } from "../_data/recentActivities";

export const RecentActivity = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm h-full overflow-auto max-h-[420px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        <button className="text-gray-400 hover:text-gray-600">⋮</button>
      </div>

      {/* Timeline */}
      <div className="space-y-6 relative">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex gap-4">
            {/* Timeline line */}
            <div className="relative flex flex-col items-center">
              <span className="w-3 h-3 rounded-full bg-blue-600 mt-1" />
              {index !== activities.length - 1 && (
                <span className="w-px h-full bg-gray-200 mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex items-start gap-3">
              <img
                src={activity.avatar}
                alt={activity.user}
                className="w-10 h-10 rounded-full object-cover"
              />

              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  <span className="font-medium">{activity.user}</span>{" "}
                  {activity.action}
                </p>
                <p className="text-xs text-gray-500">{activity.detail}</p>
              </div>

              <span className="text-xs text-gray-400 whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
