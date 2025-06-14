import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAuth } from '../contexts/AuthContext';
import { getDeviceImage } from '../utils/deviceImages';
import dataService from '../services/dataService';

export interface Device {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
  imageUrl?: string;
}

export function useDeviceManager() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { supabase } = useSupabase();
  const { user, isDemo } = useAuth();
  
  // Fetch connected devices
  const fetchDevices = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const fetchedDevices = await dataService.getDevices(user.id);
      
      // Ensure all devices have image URLs
      const devicesWithImages = fetchedDevices.map(device => ({
        ...device,
        imageUrl: device.image_url || getDeviceImage(device.id)
      }));
      
      setDevices(devicesWithImages);
    } catch (error) {
      console.error('Error fetching connected devices:', error);
      setErrorMessage('Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
      fetchDevices();
    }
  }, [user, fetchDevices]);
  
  // Connect a device
  const connectDevice = useCallback(async (deviceId: string) => {
    if (!user) return;
    
    setConnecting(deviceId);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      // Simulate API call for demo mode
      if (isDemo) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setDevices(devices.map(device => 
          device.id === deviceId ? { ...device, connected: true } : device
        ));
        setSuccessMessage(`Successfully connected to ${devices.find(d => d.id === deviceId)?.name}`);
      } else {
        // Real implementation
        const { error } = await supabase
          .from('wearable_connections')
          .insert({
            user_id: user.id,
            provider: deviceId,
            access_token: 'demo-token',
            refresh_token: 'demo-refresh-token',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        
        if (error) throw error;
        
        setDevices(devices.map(device => 
          device.id === deviceId ? { ...device, connected: true } : device
        ));
        setSuccessMessage(`Successfully connected to ${devices.find(d => d.id === deviceId)?.name}`);
      }
    } catch (error) {
      console.error('Error connecting device:', error);
      setErrorMessage(`Failed to connect to ${devices.find(d => d.id === deviceId)?.name}. Please try again.`);
    } finally {
      setConnecting(null);
    }
  }, [user, isDemo, supabase, devices]);
  
  // Disconnect a device
  const disconnectDevice = useCallback(async (deviceId: string) => {
    if (!user) return;
    
    setConnecting(deviceId);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      // Simulate API call for demo mode
      if (isDemo) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setDevices(devices.map(device => 
          device.id === deviceId ? { ...device, connected: false } : device
        ));
        setSuccessMessage(`Successfully disconnected from ${devices.find(d => d.id === deviceId)?.name}`);
      } else {
        // Real implementation
        const { error } = await supabase
          .from('wearable_connections')
          .delete()
          .eq('user_id', user.id)
          .eq('provider', deviceId);
        
        if (error) throw error;
        
        setDevices(devices.map(device => 
          device.id === deviceId ? { ...device, connected: false } : device
        ));
        setSuccessMessage(`Successfully disconnected from ${devices.find(d => d.id === deviceId)?.name}`);
      }
    } catch (error) {
      console.error('Error disconnecting device:', error);
      setErrorMessage(`Failed to disconnect from ${devices.find(d => d.id === deviceId)?.name}. Please try again.`);
    } finally {
      setConnecting(null);
    }
  }, [user, isDemo, supabase, devices]);
  
  // Toggle device connection status
  const toggleDeviceConnection = useCallback(async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    
    if (device.connected) {
      await disconnectDevice(deviceId);
    } else {
      await connectDevice(deviceId);
    }
  }, [devices, connectDevice, disconnectDevice]);
  
  // Get connected devices
  const getConnectedDevices = useCallback(() => {
    return devices.filter(device => device.connected);
  }, [devices]);

  // Clear messages after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
    
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);
  
  return {
    devices,
    connectedDevices: getConnectedDevices(),
    loading,
    connecting,
    successMessage,
    errorMessage,
    connectDevice,
    disconnectDevice,
    toggleDeviceConnection,
    refreshDevices: fetchDevices,
    clearMessages: () => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  };
}