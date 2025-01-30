import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getAllTransactions } from '../services/transactionService';
import { format } from 'date-fns';
import SavingsBreakdown from '../components/SavingsBreakdown';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Reports() {
  const { currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);  // Initialize as empty array
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchTransactions();
  }, [currentUser, selectedYear]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const fetchTransactions = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const result = await getAllTransactions(currentUser.uid);
      // Ensure we're working with an array of transactions
      setTransactions(Array.isArray(result.transactions) ? result.transactions : []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Process monthly data with improved structure
  const processMonthlyData = (transactions) => {
    if (!Array.isArray(transactions)) return { months: [], monthlyIncomes: [], monthlyExpenses: [] };

    const monthlyDataMap = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === selectedYear) {
        const monthKey = format(date, 'MMM yyyy');
        if (!acc[monthKey]) {
          acc[monthKey] = { income: 0, expenses: 0 };
        }

        const amount = Number(transaction.amount) || 0;
        if (transaction.type === 'income') {
          acc[monthKey].income += amount;
        } else {
          acc[monthKey].expenses += amount;
        }
      }
      return acc;
    }, {});

    // Sort by date and separate into arrays
    const sortedData = Object.entries(monthlyDataMap)
      .sort(([aKey], [bKey]) => {
        return new Date(aKey) - new Date(bKey);
      });

    return {
      months: sortedData.map(([month]) => month),
      monthlyIncomes: sortedData.map(([, data]) => data.income),
      monthlyExpenses: sortedData.map(([, data]) => data.expenses)
    };
  };

  // Memoize processed data
  const {
    months,
    monthlyIncomes,
    monthlyExpenses
  } = React.useMemo(() => processMonthlyData(transactions), [transactions, selectedYear]);

  // Update category data processing with proper category names
  const categoryData = React.useMemo(() => {
    if (!Array.isArray(transactions)) return [];

    const expensesByCategory = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'expense' &&
        new Date(transaction.date).getFullYear() === selectedYear) {
        const categoryName = transaction.categoryName || 'Other'; // Use categoryName instead of category
        acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount || 0);
      }
      return acc;
    }, {});

    const totalExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);

    return Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses ? (amount / totalExpenses * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6); // Top 6 categories
  }, [transactions, selectedYear]);

  // Update income category data processing
  const incomeData = React.useMemo(() => {
    if (!Array.isArray(transactions)) return [];

    const incomeByCategory = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'income' &&
        new Date(transaction.date).getFullYear() === selectedYear) {
        const categoryName = transaction.categoryName || 'Other'; // Use categoryName instead of category
        acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount || 0);
      }
      return acc;
    }, {});

    const totalIncome = Object.values(incomeByCategory).reduce((a, b) => a + b, 0);

    return Object.entries(incomeByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalIncome ? (amount / totalIncome * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [transactions, selectedYear]);

  // Chart configurations with dynamic data
  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: 'Income',
        data: monthlyIncomes,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: monthlyExpenses,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.4,
      },
    ],
  };

  // Update chart configurations to use categoryData directly
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: window.innerWidth < 640 ? 'bottom' : 'right',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => ({
                text: `${label} ($${data.datasets[0].data[i].toFixed(2)})`,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].backgroundColor[i],
                pointStyle: 'circle',
                index: i
              }));
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = context.dataset.data[context.dataIndex];
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Update doughnut chart data configurations with percentage labels
  const expenseDoughnutChartData = {
    labels: categoryData.map(item => `${item.category} (${item.percentage}%)`),
    datasets: [{
      data: categoryData.map(item => item.amount),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',  // Red
        'rgba(249, 115, 22, 0.8)', // Orange
        'rgba(234, 179, 8, 0.8)',  // Yellow
        'rgba(16, 185, 129, 0.8)', // Green
        'rgba(59, 130, 246, 0.8)', // Blue
        'rgba(139, 92, 246, 0.8)',  // Purple
      ],
    }]
  };

  // Add income chart data with percentage labels
  const incomeDoughnutChartData = {
    labels: incomeData.map(item => `${item.category} (${item.percentage}%)`),
    datasets: [{
      data: incomeData.map(item => item.amount),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',  // Green
        'rgba(59, 130, 246, 0.8)', // Blue
        'rgba(139, 92, 246, 0.8)', // Purple
        'rgba(236, 72, 153, 0.8)', // Pink
        'rgba(245, 158, 11, 0.8)', // Orange
        'rgba(99, 102, 241, 0.8)',  // Indigo
      ],
    }]
  };

  // Calculate summary totals for the selected year
  const yearSummary = React.useMemo(() => {
    const filteredTransactions = transactions.filter(t =>
      new Date(t.date).getFullYear() === selectedYear
    );

    return filteredTransactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount) || 0;
      if (transaction.type === 'income') {
        acc.totalIncome += amount;
      } else {
        acc.totalExpenses += amount;
      }
      acc.netBalance = acc.totalIncome - acc.totalExpenses;
      return acc;
    }, { totalIncome: 0, totalExpenses: 0, netBalance: 0 });
  }, [transactions, selectedYear]);

  // Update the cash balance calculation to handle ISO date strings
  const calculateCashBalance = React.useMemo(() => {
    if (!Array.isArray(transactions)) return {
      incomeByMonth: Array(12).fill(0),
      expensesByMonth: Array(12).fill(0),
      balanceByMonth: Array(12).fill(0)
    };

    const incomeByMonth = Array(12).fill(0);
    const expensesByMonth = Array(12).fill(0);
    const balanceByMonth = Array(12).fill(0);

    transactions.forEach(transaction => {
      const date = new Date(transaction.date); // Parse ISO date string
      if (date.getFullYear() === selectedYear) {
        const month = date.getMonth();
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === 'income') {
          incomeByMonth[month] += amount;
        } else if (transaction.type === 'expense') {
          expensesByMonth[month] += amount;
        }
      }
    });

    // Calculate running balance
    let runningBalance = 0;
    for (let i = 0; i < 12; i++) {
      runningBalance += incomeByMonth[i] - expensesByMonth[i];
      balanceByMonth[i] = runningBalance;
    }

    return { incomeByMonth, expensesByMonth, balanceByMonth };
  }, [transactions, selectedYear]);

  // Update balance chart data
  const balanceChartData = {
    labels: Array.from({ length: 12 }, (_, i) => format(new Date(selectedYear, i), 'MMM')),
    datasets: [
      {
        label: 'Cash Balance',
        data: calculateCashBalance.balanceByMonth,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Monthly Income',
        data: calculateCashBalance.incomeByMonth,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Monthly Expenses',
        data: calculateCashBalance.expensesByMonth,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ],
  };

  // Update chart options for better visualization
  const balanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toFixed(2)}`
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // Update the chart data configuration for bar chart
  const barChartData = {
    labels: months,
    datasets: [
      {
        label: 'Income',
        data: monthlyIncomes,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Expenses',
        data: monthlyExpenses,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Add bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toFixed(0)}`
        },
        grid: {
          borderDash: [2, 4]
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    barPercentage: 0.8,
    categoryPercentage: 0.9
  };

  // Improve monthly data processing
  const monthlyData = React.useMemo(() => {
    if (!Array.isArray(transactions)) return {
      labels: [],
      incomeData: [],
      expenseData: [],
      netData: []
    };

    const monthlyMap = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === selectedYear) {
        const monthKey = format(date, 'MMM');
        if (!acc[monthKey]) {
          acc[monthKey] = { income: 0, expenses: 0, net: 0 };
        }

        const amount = Number(transaction.amount) || 0;
        if (transaction.type === 'income') {
          acc[monthKey].income += amount;
        } else {
          acc[monthKey].expenses += amount;
        }
        acc[monthKey].net = acc[monthKey].income - acc[monthKey].expenses;
      }
      return acc;
    }, {});

    // Ensure all months are represented
    const allMonths = Array.from({ length: 12 }, (_, i) =>
      format(new Date(selectedYear, i), 'MMM')
    );

    // Fill in missing months with zeros
    allMonths.forEach(month => {
      if (!monthlyMap[month]) {
        monthlyMap[month] = { income: 0, expenses: 0, net: 0 };
      }
    });

    // Convert to arrays in chronological order
    return {
      labels: allMonths,
      incomeData: allMonths.map(month => monthlyMap[month].income),
      expenseData: allMonths.map(month => monthlyMap[month].expenses),
      netData: allMonths.map(month => monthlyMap[month].net)
    };
  }, [transactions, selectedYear]);

  // Enhanced bar chart configuration
  const monthlyOverviewData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Income',
        data: monthlyData.incomeData,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        borderRadius: 4,
        stack: 'stack0',
      },
      {
        label: 'Expenses',
        data: monthlyData.expenseData,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        borderRadius: 4,
        stack: 'stack0',
      },
      {
        label: 'Net',
        data: monthlyData.netData,
        type: 'line',
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ],
  };

  // Enhanced chart options
  const monthlyOverviewOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label;
            const value = context.parsed.y;
            return `${label}: $${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toFixed(0)}`,
          maxTicksLimit: 8
        },
        grid: {
          borderDash: [2, 4]
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'nearest'
    }
  };

  // Improved monthly data processing with better organization
  const monthlyStats = React.useMemo(() => {
    if (!Array.isArray(transactions)) {
      return {
        labels: [],
        series: { income: [], expenses: [], net: [] },
        totals: { income: 0, expenses: 0, net: 0 }
      };
    }

    // Get all months for the selected year
    const monthLabels = Array.from({ length: 12 }, (_, i) =>
      format(new Date(selectedYear, i), 'MMM')
    );

    // Initialize monthly tracking
    const monthlyData = monthLabels.reduce((acc, month) => {
      acc[month] = { income: 0, expenses: 0, net: 0 };
      return acc;
    }, {});

    // Process transactions
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date.getFullYear() === selectedYear) {
        const month = format(date, 'MMM');
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === 'income') {
          monthlyData[month].income += amount;
        } else {
          monthlyData[month].expenses += amount;
        }
        monthlyData[month].net = monthlyData[month].income - monthlyData[month].expenses;
      }
    });

    // Calculate series data
    const series = {
      income: monthLabels.map(month => monthlyData[month].income),
      expenses: monthLabels.map(month => monthlyData[month].expenses),
      net: monthLabels.map(month => monthlyData[month].net)
    };

    // Calculate totals
    const totals = {
      income: series.income.reduce((a, b) => a + b, 0),
      expenses: series.expenses.reduce((a, b) => a + b, 0),
      net: series.net.reduce((a, b) => a + b, 0)
    };

    return { labels: monthLabels, series, totals };
  }, [transactions, selectedYear]);

  // Enhanced monthly overview chart configuration
  const monthlyOverviewConfig = {
    data: {
      labels: monthlyStats.labels,
      datasets: [
        {
          type: 'bar',
          label: 'Income',
          data: monthlyStats.series.income,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
          borderRadius: 4,
          order: 2
        },
        {
          type: 'bar',
          label: 'Expenses',
          data: monthlyStats.series.expenses,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1,
          borderRadius: 4,
          order: 2
        },
        {
          type: 'line',
          label: 'Net Income',
          data: monthlyStats.series.net,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          order: 1,
          yAxisID: 'net'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'center',
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.raw;
              const sign = value >= 0 ? '+' : '';
              return `${context.dataset.label}: ${sign}$${value.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Amount ($)',
            color: 'rgb(107, 114, 128)'
          },
          ticks: {
            callback: (value) => `$${value.toFixed(0)}`
          },
          grid: {
            borderDash: [2, 4]
          }
        },
        net: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Net Income ($)',
            color: 'rgb(99, 102, 241)'
          },
          ticks: {
            callback: (value) => `$${value.toFixed(0)}`
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 backdrop-blur-sm bg-black/30 z-20 transition-opacity duration-300 lg:hidden
          ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header - Improved responsive layout */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Financial Reports</h1>
                  <p className="text-sm lg:text-base text-gray-600">Yearly financial analysis</p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Summary Stats - Full width cards with better spacing */}
            <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Annual Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 sm:p-6 rounded-lg bg-green-50">
                  <p className="text-sm text-green-600">Total Income</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-700">
                    ${yearSummary.totalIncome.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 sm:p-6 rounded-lg bg-red-50">
                  <p className="text-sm text-red-600">Total Expenses</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-700">
                    ${yearSummary.totalExpenses.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 sm:p-6 rounded-lg bg-indigo-50">
                  <p className="text-sm text-indigo-600">Net Balance</p>
                  <p className="text-xl sm:text-2xl font-bold text-indigo-700">
                    ${yearSummary.netBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content Grid - Improved responsive layout */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Monthly Overview - Full width on all screens */}
              <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                <div className="flex flex-col gap-4">
                  {/* ...existing monthly overview content... */}
                  <div className="h-[300px] sm:h-[400px]">
                    <Bar
                      data={monthlyOverviewConfig.data}
                      options={monthlyOverviewConfig.options}
                    />
                  </div>
                </div>
              </div>


              {/* Cash Balance - Full width on all screens */}
              <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Cash Balance Trend</h3>
                <div className="h-[300px] sm:h-[400px]">
                  <Line
                    data={balanceChartData}
                    options={balanceChartOptions}
                  />
                </div>
              </div>

              {/* Category Charts - Side by side on large screens */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Income Categories</h3>
                <div className="h-[300px] sm:h-[350px]">
                  <Doughnut data={incomeDoughnutChartData} options={doughnutChartOptions} />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Expense Categories</h3>
                <div className="h-[300px] sm:h-[350px]">
                  <Doughnut data={expenseDoughnutChartData} options={doughnutChartOptions} />
                </div>
              </div>

              {/* Savings Breakdown - Full width on all screens */}
              <div className="lg:col-span-2">
                <SavingsBreakdown netBalance={yearSummary.netBalance} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
