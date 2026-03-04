import React from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';

const reportData = [
  { name: 'Jan', participants: 40, completions: 24 },
  { name: 'Feb', participants: 60, completions: 38 },
  { name: 'Mar', participants: 85, completions: 55 },
  { name: 'Apr', participants: 100, completions: 78 },
  { name: 'May', participants: 124, completions: 95 },
];

export function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Branch Analytics & Reports</h2>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Export Excel</span>
          </button>
          <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Export PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Enrollment vs Completion</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="participants" name="Enrolled" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completions" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Growth Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="participants" name="Total Participants" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Available Reports</h3>
        </div>
        <div className="divide-y divide-gray-200">
          <ReportRow title="Participant Progress Report" description="Detailed view of all participants' progress across enrolled courses." date="Generated Today" />
          <ReportRow title="Course Completion Report" description="Analytics on course completion rates, drop-offs, and average time to complete." date="Generated Yesterday" />
          <ReportRow title="Assignment Submissions Report" description="Overview of assignment submission rates and average grades." date="Generated Oct 15, 2023" />
          <ReportRow title="Trainer Activity Report" description="Summary of trainer engagement, courses taught, and student feedback." date="Generated Oct 01, 2023" />
        </div>
      </div>
    </div>
  );
}

function ReportRow({ title, description, date }: { title: string, description: string, date: string }) {
  return (
    <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors">
      <div className="mb-4 sm:mb-0">
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
        <p className="text-xs text-gray-400 mt-2">{date}</p>
      </div>
      <button className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-900 font-medium text-sm">
        <Download className="w-4 h-4" />
        <span>Download</span>
      </button>
    </div>
  );
}
