import React, { useState, useRef, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  Pressable, 
  Alert, 
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ExternalLink, Shield, Smartphone } from 'lucide-react-native';

const { height: screenHeight } = Dimensions.get('window');

interface Integration {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface IntegrationAuthModalProps {
  visible: boolean;
  onClose: () => void;
  authToken: string;
  integration: Integration;
  onSuccess: (connection: any) => void;
  onError: (error: any) => void;
}

export function IntegrationAuthModal({
  visible,
  onClose,
  authToken,
  integration,
  onSuccess,
  onError
}: IntegrationAuthModalProps) {
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing authentication...');
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  // AuthKit URL with token and integration config
  const authUrl = `https://app.picaos.com/authkit?token=${authToken}&connector=${integration.id}&platform=mobile&return_url=haus://auth/callback`;

  useEffect(() => {
    if (visible) {
      setLoading(true);
      setError(null);
      setLoadingMessage('Initializing authentication...');
    }
  }, [visible]);

  const handleNavigationStateChange = (navState: any) => {
    const { url, loading: isLoading } = navState;
    
    if (!isLoading) {
      setLoadingMessage('Processing...');
    }
    
    // Check for success callback
    if (url.includes('success') || url.includes('haus://auth/callback')) {
      try {
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const connectionId = urlParams.get('connection_id');
        const status = urlParams.get('status');
        
        if (connectionId && status === 'connected') {
          const connectionData = {
            connectionId,
            connector: integration.id,
            status: 'connected',
            connectedAt: new Date().toISOString()
          };
          onSuccess(connectionData);
          onClose();
        } else {
          throw new Error('Invalid connection response');
        }
      } catch (err) {
        onError(new Error('Failed to process connection response'));
        onClose();
      }
    }
    
    // Check for error callback
    if (url.includes('error') || url.includes('denied') || url.includes('cancelled')) {
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const errorMessage = urlParams.get('error') || 'Authentication was cancelled';
      onError(new Error(errorMessage));
      onClose();
    }
  };

  const handleWebViewLoad = () => {
    setLoading(false);
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    
    setError('Failed to load authentication page');
    setLoading(false);
    
    // Offer alternative to open in browser
    Alert.alert(
      'Connection Error',
      'Unable to load the authentication page in the app. Would you like to authenticate in your browser instead?',
      [
        { text: 'Cancel', onPress: onClose },
        { text: 'Open Browser', onPress: openInBrowser }
      ]
    );
  };

  const openInBrowser = async () => {
    try {
      // Open in external browser with custom scheme for callback
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'haus://auth/callback'
      );
      
      if (result.type === 'success' && result.url) {
        // Handle the callback URL
        handleNavigationStateChange({ url: result.url, loading: false });
      } else if (result.type === 'cancel') {
        onError(new Error('Authentication was cancelled'));
      } else {
        onError(new Error('Authentication failed'));
      }
    } catch (err) {
      onError(err);
    }
    
    onClose();
  };

  const retryWebView = () => {
    setError(null);
    setLoading(true);
    setLoadingMessage('Retrying...');
    webViewRef.current?.reload();
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              Connect {integration.name}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Secure authentication via OAuth 2.0
            </Text>
          </View>
          <Pressable 
            onPress={onClose} 
            className="p-2 rounded-full bg-gray-100"
          >
            <X size={20} color="#6B7280" />
          </Pressable>
        </View>

        {/* Security Notice */}
        <View className="bg-blue-50 mx-4 my-3 p-3 rounded-lg border border-blue-200">
          <View className="flex-row items-center">
            <Shield size={16} color="#3B82F6" />
            <Text className="text-sm text-blue-800 ml-2 flex-1">
              Your credentials are handled securely by {integration.name}. We never see or store your password.
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1">
          {/* Loading State */}
          {loading && !error && (
            <View className="flex-1 items-center justify-center p-8">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-center text-gray-600 mt-4 text-base">
                {loadingMessage}
              </Text>
              <Text className="text-center text-gray-500 mt-2 text-sm">
                This may take a few seconds...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View className="flex-1 items-center justify-center p-8">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                <X size={32} color="#EF4444" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Connection Failed
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                {error}
              </Text>
              <View className="flex-row space-x-3">
                <Pressable
                  onPress={retryWebView}
                  className="bg-blue-500 px-6 py-3 rounded-lg"
                >
                  <Text className="text-white font-medium">Try Again</Text>
                </Pressable>
                <Pressable
                  onPress={openInBrowser}
                  className="bg-gray-200 px-6 py-3 rounded-lg flex-row items-center"
                >
                  <ExternalLink size={16} color="#6B7280" />
                  <Text className="text-gray-700 font-medium ml-2">Use Browser</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* WebView */}
          {!error && (
            <WebView
              ref={webViewRef}
              source={{ uri: authUrl }}
              onLoad={handleWebViewLoad}
              onNavigationStateChange={handleNavigationStateChange}
              onError={handleWebViewError}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                if (nativeEvent.statusCode >= 400) {
                  handleWebViewError(syntheticEvent);
                }
              }}
              style={{ 
                flex: 1,
                opacity: loading ? 0 : 1 
              }}
              startInLoadingState
              javaScriptEnabled
              domStorageEnabled
              thirdPartyCookiesEnabled={true}
              cacheEnabled={false}
              incognito={false} // Allow cookies for auth
              userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 HausPlatform/1.0"
              mixedContentMode="compatibility"
              allowsInlineMediaPlayback={false}
              mediaPlaybackRequiresUserAction={true}
              bounces={false}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
              contentInsetAdjustmentBehavior="automatic"
            />
          )}
        </View>

        {/* Footer Options */}
        <View className="p-4 border-t border-gray-200 bg-white">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Smartphone size={16} color="#6B7280" />
              <Text className="text-xs text-gray-500 ml-2">
                Mobile optimized experience
              </Text>
            </View>
            
            <Pressable
              onPress={openInBrowser}
              className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
            >
              <ExternalLink size={14} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1 font-medium">
                Open in Browser
              </Text>
            </Pressable>
          </View>
          
          {/* Privacy Note */}
          <Text className="text-xs text-gray-400 mt-3 text-center">
            By connecting, you agree to share data between Haus Platform and {integration.name} 
            according to their privacy policy.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}