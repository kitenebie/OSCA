import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useSeniorsStore } from '../../store/seniorsStore';
import { useUIStore } from '../../store/uiStore';
import barangaysData from '../../Dummy/data/barangays.json';
import { BarChart, PieChart, TrendingUp, Heart } from 'lucide-react';

export default function BarangayChart() {
  const seniors = useSeniorsStore((state) => state.seniors);
  const setSelectedBarangay = useSeniorsStore((state) => state.setSelectedBarangay);
  const { setCurrentPage } = useUIStore();
  const [activeTab, setActiveTab] = useState<'barangay' | 'demographic' | 'trends'>('barangay');

  // --- Dynamic Computations ---

  // 1. Barangay Distribution
  const barangayCounts: Record<string, number> = {};
  // Initialize with all Juban barangays
  barangaysData.forEach(b => {
    barangayCounts[b.name] = 0;
  });
  // Accumulate
  seniors.forEach(s => {
    if (barangayCounts[s.barangay] !== undefined) {
      barangayCounts[s.barangay]++;
    } else {
      barangayCounts[s.barangay] = 1;
    }
  });

  const barangayNames = Object.keys(barangayCounts);
  const barangayDataValues = Object.values(barangayCounts);

  // 2. Age Bracket Counts
  let brackets = {
    '60-69': 0,
    '70-79': 0,
    '80-89': 0,
    '90-99': 0,
    '100+': 0
  };
  seniors.forEach(s => {
    if (s.age >= 100) brackets['100+']++;
    else if (s.age >= 90) brackets['90-99']++;
    else if (s.age >= 80) brackets['80-89']++;
    else if (s.age >= 70) brackets['70-79']++;
    else if (s.age >= 60) brackets['60-69']++;
  });

  // 3. Status Distribution
  let statusCounts = {
    Approved: 0,
    Pending: 0,
    'For Verification': 0,
    Rejected: 0
  };
  seniors.forEach(s => {
    if (statusCounts[s.status] !== undefined) {
      statusCounts[s.status]++;
    }
  });

  // 4. Registration Trends (Last 12 Months)
  // Let's group by month
  const monthlyCounts: Record<string, number> = {};
  seniors.forEach(s => {
    if (s.registeredDate) {
      const monthYear = s.registeredDate.substring(0, 7); // "YYYY-MM"
      monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
    }
  });

  // Sort months
  const sortedMonths = Object.keys(monthlyCounts).sort().slice(-12);
  const trendLabels = sortedMonths.map(m => {
    const [y, mon] = m.split('-');
    const dateObj = new Date(parseInt(y), parseInt(mon) - 1, 1);
    return dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });
  const trendValues = sortedMonths.map(m => monthlyCounts[m]);

  // --- Apex Charts Configuration ---

  // Bar Chart options
  const barChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      events: {
        click: function(event, chartContext, config) {
          const clickedIndex = config.dataPointIndex;
          if (clickedIndex !== -1 && clickedIndex !== undefined) {
            const bName = barangayNames[clickedIndex];
            setSelectedBarangay(bName);
            setCurrentPage('SeniorsList');
          }
        }
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        barHeight: '75%',
        distributed: true
      }
    },
    colors: [
      '#0d9488', '#14b8a6', '#2dd4bf', '#99f6e4', '#0f766e', 
      '#115e59', '#134e4a', '#0a3632', '#064e3b', '#022c22',
      '#0d9488', '#14b8a6', '#2dd4bf', '#99f6e4'
    ],
    dataLabels: {
      enabled: true,
      style: { fontSize: '10px', colors: ['#ffffff'] },
      offsetX: 0
    },
    xaxis: {
      categories: barangayNames,
      labels: { style: { colors: '#64748b', fontSize: '10px', fontFamily: 'Inter' } }
    },
    yaxis: {
      labels: { style: { colors: '#475569', fontSize: '11px', fontFamily: 'Inter', fontWeight: 600 } }
    },
    grid: { borderColor: '#f1f5f9' },
    tooltip: {
      theme: 'light',
      y: { formatter: (val) => `${val} Senior Citizens` }
    },
    legend: { show: false }
  };

  const barChartSeries = [{
    name: 'Senior Citizens',
    data: barangayDataValues
  }];

  // Donut Chart options (Demographics: Age & Status)
  const donutChartOptions: ApexOptions = {
    chart: { type: 'donut' },
    labels: Object.keys(brackets),
    colors: ['#0d9488', '#0f766e', '#0369a1', '#f59e0b', '#ef4444'],
    legend: {
      position: 'bottom',
      fontSize: '11px',
      fontFamily: 'Inter',
      labels: { colors: '#475569' }
    },
    dataLabels: { enabled: true, style: { fontSize: '10px' } },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Kabuuan',
              formatter: () => String(seniors.length),
              fontSize: '12px',
              fontWeight: 600,
              color: '#475569'
            }
          }
        }
      }
    }
  };

  const donutChartSeries = Object.values(brackets);

  // Status Pie Chart
  const statusChartOptions: ApexOptions = {
    chart: { type: 'pie' },
    labels: Object.keys(statusCounts),
    colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'], // Green, Blue, Yellow, Red
    legend: {
      position: 'bottom',
      fontSize: '11px',
      fontFamily: 'Inter',
      labels: { colors: '#475569' }
    },
    dataLabels: { enabled: true }
  };

  const statusChartSeries = Object.values(statusCounts);

  // Line Chart options (trends)
  const lineChartOptions: ApexOptions = {
    chart: { type: 'line', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#0d9488'],
    markers: { size: 4, colors: ['#ffffff'], strokeColors: '#0d9488', strokeWidth: 2 },
    xaxis: {
      categories: trendLabels.length > 0 ? trendLabels : ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: { style: { colors: '#64748b', fontSize: '10px' } }
    },
    yaxis: {
      labels: { style: { colors: '#64748b', fontSize: '10px' } }
    },
    grid: { borderColor: '#f1f5f9' },
    tooltip: { theme: 'light' }
  };

  const lineChartSeries = [{
    name: 'New Registrations',
    data: trendValues.length > 0 ? trendValues : [2, 4, 3, 5, 8, 12]
  }];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col h-full">
      {/* Chart Headers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h4 className="font-bold text-slate-800 text-sm md:text-base">E-Census Visualizations</h4>
          <p className="text-[11px] text-slate-400">Demographic analysis of Juban, Sorsogon senior citizens</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('barangay')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
              ${activeTab === 'barangay' 
                ? 'bg-white text-teal-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'}`}
          >
            <BarChart size={13} />
            <span>Kada Barangay</span>
          </button>
          <button
            onClick={() => setActiveTab('demographic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
              ${activeTab === 'demographic' 
                ? 'bg-white text-teal-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'}`}
          >
            <PieChart size={13} />
            <span>Edad at Katayuan</span>
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
              ${activeTab === 'trends' 
                ? 'bg-white text-teal-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'}`}
          >
            <TrendingUp size={13} />
            <span>Trend ng Rehistro</span>
          </button>
        </div>
      </div>

      {/* Chart Body */}
      <div className="flex-1 mt-6 flex flex-col justify-center min-h-[350px]">
        {activeTab === 'barangay' && (
          <div className="relative">
            <ReactApexChart 
              options={barChartOptions} 
              series={barChartSeries} 
              type="bar" 
              height={380} 
            />
            <div className="text-center text-[10px] text-slate-400 font-mono mt-2 uppercase">
              💡 Click any bar to instantly filter the profiles registry list
            </div>
          </div>
        )}

        {activeTab === 'demographic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">Edad Distribution (Age Brackets)</span>
              <div className="w-full max-w-[260px]">
                <ReactApexChart 
                  options={donutChartOptions} 
                  series={donutChartSeries} 
                  type="donut" 
                  height={280} 
                />
              </div>
            </div>
            
            <div className="flex flex-col items-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">Katayuan ng Aplikasyon (Status)</span>
              <div className="w-full max-w-[260px]">
                <ReactApexChart 
                  options={statusChartOptions} 
                  series={statusChartSeries} 
                  type="pie" 
                  height={280} 
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="w-full">
            <ReactApexChart 
              options={lineChartOptions} 
              series={lineChartSeries} 
              type="line" 
              height={340} 
            />
            <div className="mt-4 flex items-center gap-2 p-3 bg-teal-50 border border-teal-100/50 rounded-xl">
              <Heart className="text-teal-500 shrink-0" size={16} />
              <p className="text-[11px] text-teal-700 leading-normal">
                Ang trend na ito ay nagpapakita ng tuluy-tuloy na pagpapatala ng mga senior citizens sa Juban, Sorsogon e-Census database mula nang ilunsad ang digital portal.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
