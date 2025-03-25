import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TodoSummaryChart({ stats }) {
    const chartData = {
        labels: ['Completed', 'Pending', 'In Progress', 'Urgent'],
        datasets: [{
            data: [
                stats.completed,
                stats.details.pending,
                stats.details.inProgress,
                stats.urgent
            ],
            backgroundColor: [
                'rgba(34, 197, 94, 0.85)',  // green
                'rgba(234, 179, 8, 0.85)',  // yellow
                'rgba(255, 165, 0, 0.85)', // orange
                'rgba(239, 68, 68, 0.85)',  // red
            ],
            hoverBackgroundColor: [
                'rgba(34, 197, 94, 1)',
                'rgba(234, 179, 8, 1)',
                'rgba(255, 165, 0, 1)',
                'rgba(239, 68, 68, 1)',
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverBorderColor: '#ffffff',
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                bodySpacing: 4,
                boxPadding: 4
            }
        },
        cutout: '75%',
        animation: {
            animateRotate: true,
            animateScale: true
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2">
                    <div className="h-64 relative">
                        <Doughnut data={chartData} options={options} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
                                <div className="text-sm font-medium text-gray-500">Total Tasks</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {/* <div className="space-y-4">
                    {stats_details.map((stat, index) => (
                        <div
                            key={index}
                            className={`${stat.bgColor} rounded-lg p-4 transition-all hover:scale-105`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {stat.icon}
                                    <span className="text-sm font-medium text-gray-600">
                                        {stat.label}
                                    </span>
                                </div>
                                <span className={`text-lg font-semibold ${stat.color}`}>
                                    {stat.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div> */}
            </div>
        </div>
    );
}
