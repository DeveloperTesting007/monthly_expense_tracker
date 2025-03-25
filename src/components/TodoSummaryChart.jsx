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
                'rgba(40, 167, 69, 0.85)',  // green
                'rgba(255, 193, 7, 0.85)',  // yellow
                'rgba(0, 123, 255, 0.85)', // blue
                'rgba(220, 53, 69, 0.85)',  // red
            ],
            hoverBackgroundColor: [
                'rgba(40, 167, 69, 1)',
                'rgba(255, 193, 7, 1)',
                'rgba(0, 123, 255, 0, 1)',
                'rgba(220, 53, 69, 1)',
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
            </div>
        </div>
    );
}
