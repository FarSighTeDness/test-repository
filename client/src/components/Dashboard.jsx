import { useState } from "react";
import TrainTable from "./TrainTable";

const trains = [
  { number: "12345", name: "Express A",          departure: "08:00 AM", arrival: "12:30 PM", status: "On Time" },
  { number: "54321", name: "Express B",          departure: "09:15 AM", arrival: "01:00 PM", status: "Delayed" },
  { number: "67890", name: "Local C",            departure: "10:00 AM", arrival: "11:45 AM", status: "On Time" },
  { number: "11111", name: "Rapid D",            departure: "11:30 AM", arrival: "03:45 PM", status: "On Time" },
  { number: "22222", name: "Express E",          departure: "02:00 PM", arrival: "06:15 PM", status: "Cancelled" },
  { number: "12423", name: "Rajdhani Express",   departure: "04:00 PM", arrival: "09:15 PM", status: "On Time" },
  { number: "33333", name: "Shatabdi Express",   departure: "05:30 AM", arrival: "10:00 AM", status: "On Time" },
  { number: "44444", name: "Duronto Express",    departure: "06:00 AM", arrival: "02:30 PM", status: "Delayed" },
  { number: "55555", name: "Garib Rath",         departure: "07:45 AM", arrival: "04:00 PM", status: "On Time" },
  { number: "66666", name: "Jan Shatabdi",       departure: "12:00 PM", arrival: "05:30 PM", status: "Cancelled" },
  { number: "77777", name: "Vande Bharat",       departure: "06:00 AM", arrival: "12:00 PM", status: "On Time" },
  { number: "88888", name: "Humsafar Express",   departure: "08:30 PM", arrival: "06:45 AM", status: "On Time" },
  { number: "99999", name: "Tejas Express",      departure: "03:15 PM", arrival: "08:00 PM", status: "Delayed" },
  { number: "10101", name: "Sampark Kranti",     departure: "06:45 PM", arrival: "11:30 PM", status: "Scheduled" },
  { number: "20202", name: "Intercity Express",  departure: "07:00 AM", arrival: "01:15 PM", status: "Scheduled" },
];

const stats = [
  { label: "Total Trains", value: trains.length,                                           color: "bg-blue-100 text-blue-800" },
  { label: "On Time",      value: trains.filter((t) => t.status === "On Time").length,     color: "bg-green-100 text-green-800" },
  { label: "Delayed",      value: trains.filter((t) => t.status === "Delayed").length,     color: "bg-yellow-100 text-yellow-800" },
  { label: "Cancelled",    value: trains.filter((t) => t.status === "Cancelled").length,   color: "bg-red-100 text-red-800" },
  { label: "Scheduled",    value: trains.filter((t) => t.status === "Scheduled").length,   color: "bg-purple-100 text-purple-800" },
];

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = trains.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.number.includes(search);
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gray-100 p-6">
      <div className="w-full max-w-5xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`rounded shadow p-4 text-center font-semibold ${s.color}`}>
              <div className="text-3xl">{s.value}</div>
              <div className="text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Train Timing Dashboard</h2>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search by name or number…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>All</option>
              <option>On Time</option>
              <option>Delayed</option>
              <option>Cancelled</option>
              <option>Scheduled</option>
            </select>
          </div>

          <TrainTable trains={filtered} />

          {filtered.length === 0 && (
            <p className="text-center text-gray-500 mt-4">No trains match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
