import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const SAVING_ITEMS = [
  { name: 'Yearly Saving', percentage: 40, color: 'rgba(99, 102, 241, 0.8)' },
  { name: 'Public Event', percentage: 15, color: 'rgba(239, 68, 68, 0.8)' },
  { name: 'Healthy', percentage: 20, color: 'rgba(34, 197, 94, 0.8)' },
  { name: 'Travel', percentage: 10, color: 'rgba(249, 115, 22, 0.8)' },
  { name: 'Accessory', percentage: 15, color: 'rgba(236, 72, 153, 0.8)' },
];

export default function SavingsBreakdown({ netBalance }) {
  const savingsData = SAVING_ITEMS.map(item => ({
    ...item,
    amount: (netBalance * (item.percentage / 100)).toFixed(2)
  }));

  const chartData = {
    labels: savingsData.map(item => `${item.name} (${item.percentage}%)`),
    datasets: [{
      data: savingsData.map(item => item.amount),
      backgroundColor: savingsData.map(item => item.color),
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = savingsData[context.dataIndex];
            return `${item.name}: $${item.amount} (${item.percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Savings Breakdown</h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-full sm:w-1/2 h-[300px] sm:h-[350px]">
          <Doughnut 
            data={chartData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  ...chartOptions.plugins.legend,
                  position: window.innerWidth < 640 ? 'bottom' : 'right',
                }
              }
            }} 
          />
        </div>
        <div className="w-full sm:w-1/2 space-y-3">
          {savingsData.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold">${item.amount}</span>
                <span className="text-sm text-gray-500">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
