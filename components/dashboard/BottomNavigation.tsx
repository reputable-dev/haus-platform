import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { 
  BarChart3, 
  Activity, 
  Map, 
  Calendar, 
  Settings,
  Home
} from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import Colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');

interface BottomNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  views: { key: string; title: string }[];
}

export default function BottomNavigation({ 
  currentView, 
  onViewChange, 
  views 
}: BottomNavigationProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  const getIcon = (viewKey: string, isActive: boolean) => {
    const iconSize = 22;
    const iconColor = isActive ? colors.primary : colors.tabIconDefault;
    
    switch (viewKey) {
      case 'dashboard':
        return <Home size={iconSize} color={iconColor} />;
      case 'charts':
        return <BarChart3 size={iconSize} color={iconColor} />;
      case 'realtime':
        return <Activity size={iconSize} color={iconColor} />;
      case 'map':
        return <Map size={iconSize} color={iconColor} />;
      case 'schedule':
        return <Calendar size={iconSize} color={iconColor} />;
      case 'settings':
        return <Settings size={iconSize} color={iconColor} />;
      default:
        return <Home size={iconSize} color={iconColor} />;
    }
  };

  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.navContainer, 
          { 
            backgroundColor: Platform.OS === 'web' 
              ? `${colors.background}E6` 
              : colors.background,
            borderTopColor: colors.border,
          }
        ]}
      >
        {views.map((view) => {
          const isActive = currentView === view.key;
          
          return (
            <TouchableOpacity
              key={view.key}
              style={[
                styles.navItem,
                isActive && { backgroundColor: `${colors.primary}20` }
              ]}
              onPress={() => onViewChange(view.key)}
              activeOpacity={0.7}
            >
              {getIcon(view.key, isActive)}
              <Text 
                style={[
                  styles.navLabel,
                  { 
                    color: isActive ? colors.primary : colors.tabIconDefault,
                    fontWeight: isActive ? '600' as const : '400' as const
                  }
                ]}
              >
                {view.title}
              </Text>
              {isActive && (
                <View 
                  style={[styles.activeIndicator, { backgroundColor: colors.primary }]} 
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  navContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minHeight: 44,
    minWidth: 44,
    position: 'relative',
  },
  navLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
});