/* eslint-disable react/prop-types */
export default function TrainTable({ trains }) {
  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="py-2 px-4 border">Train No</th>
            <th className="py-2 px-4 border">Train Name</th>
            <th className="py-2 px-4 border">Departure</th>
            <th className="py-2 px-4 border">Arrival</th>
            <th className="py-2 px-4 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {trains.map((train, idx) => (
            <tr key={idx} className="text-center hover:bg-gray-50">
              <td className="py-2 px-4 border">{train.number}</td>
              <td className="py-2 px-4 border">{train.name}</td>
              <td className="py-2 px-4 border">{train.departure}</td>
              <td className="py-2 px-4 border">{train.arrival}</td>
              <td className="py-2 px-4 border">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  train.status === "On Time"  ? "bg-green-100 text-green-800" :
                  train.status === "Delayed"  ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>{train.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
