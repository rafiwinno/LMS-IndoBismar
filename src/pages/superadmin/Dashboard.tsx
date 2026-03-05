import { Users, Building2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const activityData = [
  { name: "Mon", active: 850 },
  { name: "Tue", active: 920 },
  { name: "Wed", active: 900 },
  { name: "Thu", active: 100 },
  { name: "Fri", active: 980 },
  { name: "Sat", active: 450 },
  { name: "Sun", active: 380 }
];

export default function Dashboard() {

  const stats = [
    {
      name: "Total Active Users",
      value: "1,248",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      name: "Total Branches",
      value: "27",
      change: "0%",
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-100"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          National Dashboard
        </h2>
        <p className="text-slate-500 mt-1">
          Overview of Bismar Education across all branches.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.name}
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(500px,1fr))] gap-6">

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm w-full">

          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            National Active Users (Weekly)
          </h3>

          <div className="h-[300px] sm:h-[350px] lg:h-[400px] w-full">

            <ResponsiveContainer width="100%" height="100%">

              <AreaChart
                data={activityData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >

                <defs>
                  <linearGradient
                    id="colorActive"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#4f46e5"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#4f46e5"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#60a5fa"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorActive)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>
        </div>

      </div>

    </div>
  );
}