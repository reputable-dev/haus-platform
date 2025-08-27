import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { Home, DollarSign, TrendingUp, Users } from 'lucide-react-native';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ChartWidget from '@/components/dashboard/ChartWidget';
import MetricWidget from '@/components/dashboard/MetricWidget';
import TableWidget from '@/components/dashboard/TableWidget';
import RealTimeWidget from '@/components/dashboard/RealTimeWidget';
import { useTheme } from '@/providers/ThemeProvider';
import Colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');

export default function DashboardScreen() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const [currentView, setCurrentView] = useState('dashboard');

  // Sample data for charts
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [20, 45, 28, 80, 99, 43]
    }]
  };

  const barChartData = {
    labels: ['NSW', 'VIC', 'QLD', 'WA', 'SA'],
    datasets: [{
      data: [85, 72, 68, 45, 32]
    }]
  };

  const pieChartData = [
    { name: 'Houses', value: 45, color: '#3366FF' },
    { name: 'Apartments', value: 30, color: '#FF6B6B' },
    { name: 'Townhouses', value: 15, color: '#FFD166' },
    { name: 'Land', value: 10, color: '#06D6A0' },
  ];

  // Sample table data
  const tableColumns = [
    { key: 'suburb', title: 'Suburb', width: 120 },
    { key: 'median', title: 'Median Price', width: 120 },
    { key: 'change', title: 'Change %', width: 100 },
    { key: 'sales', title: 'Sales', width: 80 },
  ];

  const tableData = [
    { suburb: 'Toorak', median: '$2.8M', change: '+5.2%', sales: 12 },
    { suburb: 'Mosman', median: '$3.1M', change: '+3.8%', sales: 8 },
    { suburb: 'Brighton', median: '$1.9M', change: '+2.1%', sales: 15 },
    { suburb: 'Cottesloe', median: '$2.2M', change: '+4.5%', sales: 10 },
  ];

  // Real-time data
  const realTimeData = [
    { label: 'Active Listings', value: '1,247', status: 'online' as const },
    { label: 'New Inquiries', value: '89', status: 'online' as const },
    { label: 'Pending Sales', value: '156', status: 'warning' as const },
    { label: 'Completed Sales', value: '23', status: 'online' as const },
  ];

  const dashboardView = (
    <View style={styles.dashboardGrid}>
      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <MetricWidget
            title="Total Properties"
            value="50,247"
            change={12.5}
            changeType="increase"
            subtitle="This month"
            icon={<Home size={screenWidth < 768 ? 18 : 20} color={colors.primary} />}
          />
        </View>
        <View style={styles.metricItem}>
          <MetricWidget
            title="Total Revenue"
            value="$2.8M"
            change={8.3}
            changeType="increase"
            subtitle="This month"
            icon={<DollarSign size={screenWidth < 768 ? 18 : 20} color={colors.success} />}
          />
        </View>
        <View style={styles.metricItem}>
          <MetricWidget
            title="Market Growth"
            value="15.2%"
            change={-2.1}
            changeType="decrease"
            subtitle="Quarterly"
            icon={<TrendingUp size={screenWidth < 768 ? 18 : 20} color={colors.warning} />}
          />
        </View>
        <View style={styles.metricItem}>
          <MetricWidget
            title="Active Users"
            value="12,847"
            change={5.7}
            changeType="increase"
            subtitle="This week"
            icon={<Users size={screenWidth < 768 ? 18 : 20} color={colors.secondary} />}
          />
        </View>
      </View>

      {/* Charts Row */}
      <View style={styles.chartsRow}>
        <View style={styles.chartItem}>
          <ChartWidget
            title="Property Sales Trend"
            type="line"
            data={lineChartData}
            height={screenWidth < 768 ? 180 : 220}
          />
        </View>
        <View style={styles.chartItem}>
          <ChartWidget
            title="Sales by State"
            type="bar"
            data={barChartData}
            height={screenWidth < 768 ? 180 : 220}
          />
        </View>
      </View>

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        <View style={styles.tableContainer}>
          <TableWidget
            title="Top Performing Suburbs"
            columns={tableColumns}
            data={tableData}
            maxHeight={screenWidth < 768 ? 200 : 250}
          />
        </View>
        <View style={styles.realtimeContainer}>
          <RealTimeWidget
            title="Live Market Data"
            data={realTimeData}
            updateInterval={3000}
          />
        </View>
      </View>
    </View>
  );

  const chartsView = (
    <View style={styles.chartsOnlyView}>
      <ChartWidget
        title="Property Price Trends"
        type="line"
        data={lineChartData}
      />
      <ChartWidget
        title="Property Types Distribution"
        type="pie"
        data={pieChartData}
      />
      <ChartWidget
        title="Regional Performance"
        type="bar"
        data={barChartData}
      />
    </View>
  );

  const realtimeView = (
    <View style={styles.realtimeOnlyView}>
      <RealTimeWidget
        title="Market Activity"
        data={realTimeData}
      />
      <RealTimeWidget
        title="System Status"
        data={[
          { label: 'API Response', value: '45ms', status: 'online' },
          { label: 'Database', value: 'Connected', status: 'online' },
          { label: 'Cache Hit Rate', value: '94%', status: 'online' },
          { label: 'Error Rate', value: '0.02%', status: 'online' },
        ]}
      />
    </View>
  );

  const views = [
    { key: 'dashboard', title: 'Dashboard', component: dashboardView },
    { key: 'charts', title: 'Charts', component: chartsView },
    { key: 'realtime', title: 'Real-time', component: realtimeView },
    { key: 'map', title: 'Map', component: dashboardView },
    { key: 'schedule', title: 'Schedule', component: dashboardView },
    { key: 'settings', title: 'Settings', component: dashboardView },
  ];

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Analytics Dashboard',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }} 
      />
      <DashboardLayout
        currentView={currentView}
        onViewChange={setCurrentView}
        views={views}
      >
        {views.find(view => view.key === currentView)?.component}
      </DashboardLayout>
    </>
  );
}

const styles = StyleSheet.create({
  dashboardGrid: {
    flex: 1,
  },
  metricsRow: {
    flexDirection: screenWidth < 768 ? 'column' : 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  metricItem: {
    width: screenWidth < 768 ? '100%' : screenWidth < 1024 ? '50%' : '25%',
    paddingHorizontal: screenWidth < 768 ? 0 : 8,
  },
  chartsRow: {
    flexDirection: screenWidth < 768 ? 'column' : 'row',
    marginBottom: 16,
  },
  chartItem: {
    flex: 1,
    paddingHorizontal: screenWidth < 768 ? 0 : 8,
  },
  bottomRow: {
    flexDirection: screenWidth < 768 ? 'column' : 'row',
  },
  tableContainer: {
    flex: screenWidth < 768 ? 1 : 2,
    paddingHorizontal: screenWidth < 768 ? 0 : 8,
  },
  realtimeContainer: {
    flex: 1,
    paddingHorizontal: screenWidth < 768 ? 0 : 8,
  },
  chartsOnlyView: {
    flex: 1,
  },
  realtimeOnlyView: {
    flex: 1,
  },
});