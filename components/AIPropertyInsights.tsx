/**
 * AI Property Insights Component
 * Displays AI-powered market analysis and property recommendations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import {
  TrendingUp,
  TrendingDown,
  Home,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Award,
  AlertCircle,
  Lightbulb,
  BarChart3,
} from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface PropertyInsight {
  id: string;
  type: 'trend' | 'recommendation' | 'alert' | 'opportunity';
  title: string;
  description: string;
  value?: string;
  change?: number;
  confidence: number;
  location?: string;
  timeframe?: string;
}

interface MarketData {
  medianPrice: number;
  priceChange: number;
  daysOnMarket: number;
  salesVolume: number;
  marketTrend: 'up' | 'down' | 'stable';
  confidenceScore: number;
}

interface AIPropertyInsightsProps {
  propertyId?: string;
  location?: string;
  onInsightPress?: (insight: PropertyInsight) => void;
}

export function AIPropertyInsights({ 
  propertyId, 
  location, 
  onInsightPress 
}: AIPropertyInsightsProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  
  const [insights, setInsights] = useState<PropertyInsight[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fadeAnimation = useSharedValue(0);
  const slideAnimation = useSharedValue(50);

  useEffect(() => {
    loadInsights();
  }, [propertyId, location]);

  useEffect(() => {
    if (!loading) {
      fadeAnimation.value = withTiming(1, { duration: 800 });
      slideAnimation.value = withSpring(0, { 
        damping: 15,
        stiffness: 150 
      });
    }
  }, [loading]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - replace with actual HAUS AI service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock insights data
      const mockInsights: PropertyInsight[] = [
        {
          id: '1',
          type: 'trend',
          title: 'Market Price Trending Up',
          description: 'Properties in this area have increased 8.3% in the last quarter',
          value: '+8.3%',
          change: 8.3,
          confidence: 92,
          location: location || 'Melbourne CBD',
          timeframe: '3 months'
        },
        {
          id: '2',
          type: 'recommendation',
          title: 'Similar Properties Available',
          description: '5 similar properties within 2km with better value for money',
          confidence: 87,
          location: location || 'Melbourne CBD'
        },
        {
          id: '3',
          type: 'opportunity',
          title: 'Investment Opportunity',
          description: 'High rental yield potential based on comparable properties',
          value: '6.2%',
          confidence: 84,
          timeframe: 'Annual'
        },
        {
          id: '4',
          type: 'alert',
          title: 'Market Activity Increased',
          description: 'Sales volume up 45% compared to last month',
          value: '+45%',
          change: 45,
          confidence: 91,
          timeframe: '30 days'
        }
      ];

      const mockMarketData: MarketData = {
        medianPrice: 850000,
        priceChange: 8.3,
        daysOnMarket: 28,
        salesVolume: 156,
        marketTrend: 'up',
        confidenceScore: 89
      };

      setInsights(mockInsights);
      setMarketData(mockMarketData);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnimation.value,
    transform: [{ translateY: slideAnimation.value }],
  }));

  const getInsightIcon = (type: PropertyInsight['type']) => {
    switch (type) {
      case 'trend':
        return BarChart3;
      case 'recommendation':
        return Lightbulb;
      case 'opportunity':
        return Award;
      case 'alert':
        return AlertCircle;
      default:
        return Home;
    }
  };

  const getInsightColor = (type: PropertyInsight['type']) => {
    switch (type) {
      case 'trend':
        return '#4A90E2';
      case 'recommendation':
        return '#50C878';
      case 'opportunity':
        return '#FFD700';
      case 'alert':
        return '#FF6B6B';
      default:
        return '#D4C1B3';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return BarChart3;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '#50C878';
      case 'down':
        return '#FF6B6B';
      default:
        return '#D4C1B3';
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#D4C1B3" />
        <Text style={[styles.loadingText, { color: colors.secondary }]}>
          Analyzing market data...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            AI Market Insights
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>
            Powered by HAUS Intelligence
          </Text>
        </View>

        {/* Market Overview */}
        {marketData && (
          <View style={[styles.marketOverview, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Market Overview
            </Text>
            
            <View style={styles.marketStats}>
              <View style={styles.statItem}>
                <DollarSign size={20} color="#D4C1B3" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  ${(marketData.medianPrice / 1000).toFixed(0)}K
                </Text>
                <Text style={[styles.statLabel, { color: colors.secondary }]}>
                  Median Price
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {React.createElement(getTrendIcon(marketData.marketTrend), {
                    size: 20,
                    color: getTrendColor(marketData.marketTrend)
                  })}
                </View>
                <Text style={[
                  styles.statValue, 
                  { color: getTrendColor(marketData.marketTrend) }
                ]}>
                  {marketData.priceChange > 0 ? '+' : ''}{marketData.priceChange}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.secondary }]}>
                  Price Change
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Calendar size={20} color="#D4C1B3" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {marketData.daysOnMarket}
                </Text>
                <Text style={[styles.statLabel, { color: colors.secondary }]}>
                  Days on Market
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Users size={20} color="#D4C1B3" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {marketData.salesVolume}
                </Text>
                <Text style={[styles.statLabel, { color: colors.secondary }]}>
                  Sales Volume
                </Text>
              </View>
            </View>
            
            <View style={styles.confidenceContainer}>
              <Text style={[styles.confidenceLabel, { color: colors.secondary }]}>
                Analysis Confidence
              </Text>
              <View style={[styles.confidenceBar, { backgroundColor: colors.border }]}>
                <LinearGradient
                  colors={['#50C878', '#4CBB17']}
                  style={[
                    styles.confidenceFill,
                    { width: `${marketData.confidenceScore}%` }
                  ]}
                />
              </View>
              <Text style={[styles.confidenceValue, { color: colors.text }]}>
                {marketData.confidenceScore}%
              </Text>
            </View>
          </View>
        )}

        {/* Insights List */}
        <View style={styles.insightsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Key Insights
          </Text>
          
          {insights.map((insight, index) => {
            const IconComponent = getInsightIcon(insight.type);
            const insightColor = getInsightColor(insight.type);
            
            return (
              <Pressable
                key={insight.id}
                style={[
                  styles.insightCard,
                  { backgroundColor: colors.card }
                ]}
                onPress={() => onInsightPress?.(insight)}
              >
                <View style={styles.insightHeader}>
                  <View style={[
                    styles.insightIconContainer,
                    { backgroundColor: insightColor + '20' }
                  ]}>
                    <IconComponent size={20} color={insightColor} />
                  </View>
                  
                  <View style={styles.insightTitleContainer}>
                    <Text style={[styles.insightTitle, { color: colors.text }]}>
                      {insight.title}
                    </Text>
                    {insight.location && (
                      <View style={styles.locationContainer}>
                        <MapPin size={12} color={colors.secondary} />
                        <Text style={[styles.locationText, { color: colors.secondary }]}>
                          {insight.location}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {insight.value && (
                    <Text style={[
                      styles.insightValue,
                      { color: insight.change && insight.change > 0 ? '#50C878' : insightColor }
                    ]}>
                      {insight.value}
                    </Text>
                  )}
                </View>
                
                <Text style={[styles.insightDescription, { color: colors.secondary }]}>
                  {insight.description}
                </Text>
                
                <View style={styles.insightFooter}>
                  <View style={styles.confidenceContainer}>
                    <Text style={[styles.confidenceLabel, { color: colors.secondary }]}>
                      Confidence
                    </Text>
                    <View style={[styles.confidenceBar, { backgroundColor: colors.border }]}>
                      <LinearGradient
                        colors={[insightColor, insightColor + 'CC']}
                        style={[
                          styles.confidenceFill,
                          { width: `${insight.confidence}%` }
                        ]}
                      />
                    </View>
                    <Text style={[styles.confidenceValue, { color: colors.text }]}>
                      {insight.confidence}%
                    </Text>
                  </View>
                  
                  {insight.timeframe && (
                    <Text style={[styles.timeframe, { color: colors.secondary }]}>
                      {insight.timeframe}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  marketOverview: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  marketStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    minWidth: 60,
  },
  confidenceBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
  insightsContainer: {
    paddingHorizontal: 20,
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightTitleContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  insightDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeframe: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default AIPropertyInsights;