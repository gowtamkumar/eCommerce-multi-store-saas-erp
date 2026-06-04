'use client';

import { useEffect, useState, useCallback } from 'react';
import { getHrmDashboardStats, getAttendanceSessions } from '@/services/hrm';
import type { HrmDashboardStats, HrmDashboardChartItem } from '../type';

export function useHrmDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HrmDashboardStats | null>(null);
  const [chartData, setChartData] = useState<HrmDashboardChartItem[]>([
    { name: 'Mon', attendance: 0 },
    { name: 'Tue', attendance: 0 },
    { name: 'Wed', attendance: 0 },
    { name: 'Thu', attendance: 0 },
    { name: 'Fri', attendance: 0 },
    { name: 'Sat', attendance: 0 },
    { name: 'Sun', attendance: 0 },
  ]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, sessionsData] = await Promise.all([
        getHrmDashboardStats().catch(() => null),
        getAttendanceSessions().catch(() => [])
      ]);

      if (statsData) {
        setStats({
          employeeCount: statsData.employeeCount || 0,
          attendanceCount: statsData.attendanceCount || 0,
          attendanceRate: statsData.attendanceRate || 0,
          leaveCount: statsData.leaveCount || 0,
          jobCount: statsData.jobCount || 0,
          applicantCount: statsData.applicantCount || 0,
        });
      }

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayCounts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
      
      if (Array.isArray(sessionsData)) {
        sessionsData.forEach((s: any) => {
          if (s.checkIn || s.clockIn) {
            const d = new Date(s.checkIn || s.clockIn);
            const dayName = days[d.getDay()];
            if (dayCounts[dayName] !== undefined) {
              dayCounts[dayName]++;
            }
          }
        });
      }

      const updatedChart = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(name => ({
        name,
        attendance: dayCounts[name] || 0
      }));
      setChartData(updatedChart);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    loading,
    stats,
    chartData,
    refetch: fetchData
  };
}
