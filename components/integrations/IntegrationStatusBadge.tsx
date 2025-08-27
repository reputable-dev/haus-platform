import React from 'react';
import { View, Text } from 'react-native';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  XCircle,
  Wifi,
  WifiOff
} from 'lucide-react-native';

interface IntegrationStatusBadgeProps {
  status: 'connected' | 'disconnected' | 'error' | 'pending' | 'syncing' | 'offline';
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export function IntegrationStatusBadge({ 
  status, 
  size = 'medium',
  showText = true,
  className = ''
}: IntegrationStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: '#10B981',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          text: 'Connected'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: '#EF4444',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          text: 'Error'
        };
      case 'pending':
        return {
          icon: Clock,
          color: '#F59E0B',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          text: 'Pending'
        };
      case 'syncing':
        return {
          icon: Wifi,
          color: '#3B82F6',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          text: 'Syncing'
        };
      case 'offline':
        return {
          icon: WifiOff,
          color: '#6B7280',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-600',
          text: 'Offline'
        };
      default: // disconnected
        return {
          icon: XCircle,
          color: '#6B7280',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-600',
          text: 'Disconnected'
        };
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return {
          iconSize: 14,
          padding: 'px-2 py-1',
          textSize: 'text-xs',
          spacing: 'space-x-1'
        };
      case 'large':
        return {
          iconSize: 20,
          padding: 'px-4 py-2',
          textSize: 'text-sm',
          spacing: 'space-x-2'
        };
      default: // medium
        return {
          iconSize: 16,
          padding: 'px-3 py-1.5',
          textSize: 'text-xs',
          spacing: 'space-x-1.5'
        };
    }
  };

  const config = getStatusConfig();
  const sizeConfig = getSize();
  const Icon = config.icon;

  if (!showText) {
    // Icon only mode
    return (
      <View className={`${config.bgColor} ${config.borderColor} border rounded-full p-1 ${className}`}>
        <Icon size={sizeConfig.iconSize} color={config.color} />
      </View>
    );
  }

  return (
    <View className={`
      ${config.bgColor} 
      ${config.borderColor} 
      border 
      rounded-full 
      ${sizeConfig.padding}
      flex-row 
      items-center 
      ${sizeConfig.spacing}
      ${className}
    `}>
      <Icon size={sizeConfig.iconSize} color={config.color} />
      <Text className={`${config.textColor} ${sizeConfig.textSize} font-medium`}>
        {config.text}
      </Text>
    </View>
  );
}

// Usage examples:
// <IntegrationStatusBadge status="connected" />
// <IntegrationStatusBadge status="error" size="small" />
// <IntegrationStatusBadge status="pending" showText={false} />
// <IntegrationStatusBadge status="syncing" size="large" />