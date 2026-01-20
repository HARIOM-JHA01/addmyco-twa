import { useState } from "react";

interface ViewsByCountry {
  [key: string]: number;
}

interface ViewsByDate {
  [key: string]: number;
}

interface ViewsByTime {
  [key: string]: number;
}

interface DetailedView {
  displayId: string;
  country: string;
  date: string;
  time: string;
  hour: string;
  position: string;
  userClicked: boolean;
  clickedAt: string | null;
  displayedAt: string;
}

interface AdStatisticsPanelProps {
  stats: {
    advertisementId: string;
    position: string;
    country: string;
    status: string;
    totalViews: number;
    totalClicks: number;
    ctrPercentage: number;
    summary: {
      viewsByCountry: ViewsByCountry;
      viewsByDate: ViewsByDate;
      viewsByTime: ViewsByTime;
    };
    detailedViews: DetailedView[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function AdStatisticsPanel({
  stats,
  isOpen,
  onClose,
}: AdStatisticsPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "country" | "date" | "time" | "details"
  >("overview");

  if (!isOpen || !stats) return null;

  // Safely get top entries with fallback to empty arrays
  const topCountries = stats.summary?.viewsByCountry
    ? Object.entries(stats.summary.viewsByCountry)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    : [];

  const topDates = stats.summary?.viewsByDate
    ? Object.entries(stats.summary.viewsByDate)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    : [];

  const topTimes = stats.summary?.viewsByTime
    ? Object.entries(stats.summary.viewsByTime)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    : [];

  const maxViewCount = Math.max(
    ...(stats.summary?.viewsByCountry
      ? Object.values(stats.summary.viewsByCountry)
      : [1]),
    ...(stats.summary?.viewsByDate
      ? Object.values(stats.summary.viewsByDate)
      : [1]),
    ...(stats.summary?.viewsByTime
      ? Object.values(stats.summary.viewsByTime)
      : [1]),
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">
            Advertisement Statistics
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-gray-200 p-4 bg-gray-50">
          {["overview", "country", "date", "time", "details"].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(
                  tab as "overview" | "country" | "date" | "time" | "details",
                )
              }
              className={`whitespace-nowrap px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? "bg-[#007cb6] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab === "overview" && "📊 Overview"}
              {tab === "country" && "🌍 Country"}
              {tab === "date" && "📅 Date"}
              {tab === "time" && "⏰ Time"}
              {tab === "details" && "📋 Details"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Total Views</p>
                  <p className="font-bold text-2xl text-blue-600">
                    {stats.totalViews.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Total Clicks</p>
                  <p className="font-bold text-2xl text-green-600">
                    {stats.totalClicks.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <p className="text-xs text-gray-600 mb-1">
                  CTR (Click-Through Rate)
                </p>
                <p className="font-bold text-2xl text-purple-600">
                  {stats.ctrPercentage.toFixed(2)}%
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Key Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Position</span>
                    <span className="font-semibold text-gray-800">
                      {stats.position}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target Country</span>
                    <span className="font-semibold text-gray-800">
                      {stats.country}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`font-semibold ${
                        stats.status === "ACTIVE"
                          ? "text-green-600"
                          : stats.status === "PAUSED"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {stats.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Country Tab */}
          {activeTab === "country" && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">
                Views by Country (Top 10)
              </h3>
              {topCountries.length === 0 ? (
                <p className="text-gray-500 text-sm">No data available</p>
              ) : (
                topCountries.map(([country, views]) => (
                  <div key={country} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {country}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {views.toLocaleString()} views
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#007cb6] h-2 rounded-full transition-all"
                        style={{
                          width: `${(views / maxViewCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Date Tab */}
          {activeTab === "date" && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">
                Views by Date (Top 10)
              </h3>
              {topDates.length === 0 ? (
                <p className="text-gray-500 text-sm">No data available</p>
              ) : (
                topDates.map(([date, views]) => (
                  <div key={date} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{date}</span>
                      <span className="font-semibold text-gray-800">
                        {views.toLocaleString()} views
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#007cb6] h-2 rounded-full transition-all"
                        style={{
                          width: `${(views / maxViewCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Time Tab */}
          {activeTab === "time" && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">
                Views by Hour (Top 10)
              </h3>
              {topTimes.length === 0 ? (
                <p className="text-gray-500 text-sm">No data available</p>
              ) : (
                topTimes.map(([time, views]) => (
                  <div key={time} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{time}</span>
                      <span className="font-semibold text-gray-800">
                        {views.toLocaleString()} views
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#007cb6] h-2 rounded-full transition-all"
                        style={{
                          width: `${(views / maxViewCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">
                Detailed Views ({stats.detailedViews.length})
              </h3>
              {stats.detailedViews.length === 0 ? (
                <p className="text-gray-500 text-sm">No detailed views</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {stats.detailedViews.slice(0, 50).map((view) => (
                    <div
                      key={view.displayId}
                      className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-semibold text-gray-600">
                            {view.country}
                          </span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-xs font-semibold text-gray-600">
                            {view.date}
                          </span>
                        </div>
                        {view.userClicked && (
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                            ✓ Clicked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">Time: {view.time}</p>
                      {view.userClicked && view.clickedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Clicked at:{" "}
                          {new Date(view.clickedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                  {stats.detailedViews.length > 50 && (
                    <p className="text-xs text-gray-500 text-center py-2">
                      Showing first 50 of {stats.detailedViews.length} views
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
