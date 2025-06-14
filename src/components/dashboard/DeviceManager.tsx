import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, Check, Plus, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useDeviceManager, Device } from '../../hooks/useDeviceManager';
import ImageWithFallback from '../common/ImageWithFallback';

interface DeviceManagerProps {
  compact?: boolean;
}

export default function DeviceManager({ compact = false }: DeviceManagerProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  
  const {
    devices,
    connectedDevices,
    loading,
    connecting,
    successMessage,
    errorMessage,
    toggleDeviceConnection,
    clearMessages
  } = useDeviceManager();

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Connected Devices</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark"
        >
          {isExpanded ? 'Hide' : 'Manage'}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      
      {/* Connected devices summary */}
      <div className="mb-2 flex flex-wrap gap-2">
        {connectedDevices.length > 0 ? (
          connectedDevices.map(device => (
            <div 
              key={device.id}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
            >
              <Check className="h-3 w-3" />
              {device.name}
            </div>
          ))
        ) : (
          <div className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-2 text-center text-xs text-text-light">
            No devices connected
          </div>
        )}
      </div>
      
      {/* Success/Error messages */}
      {successMessage && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-success/10 p-2 text-xs text-success">
          <Check className="h-3 w-3 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-error/10 p-2 text-xs text-error">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}
      
      {/* Expanded device list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]"
          >
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto p-2">
                {devices.map((device) => (
                  <div 
                    key={device.id}
                    className="mb-2 flex items-center justify-between rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-2 last:mb-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
                        <ImageWithFallback
                          src={device.imageUrl}
                          alt={device.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{device.name}</h4>
                        <p className="text-xs text-text-light">{device.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleDeviceConnection(device.id)}
                      disabled={connecting === device.id}
                      className={`ml-2 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                        device.connected
                          ? 'bg-error/10 text-error hover:bg-error/20'
                          : 'bg-primary text-white hover:bg-primary-dark'
                      }`}
                    >
                      {connecting === device.id ? (
                        <Loader className="h-3 w-3 animate-spin" />
                      ) : device.connected ? (
                        'Disconnect'
                      ) : (
                        <>
                          <Plus className="h-3 w-3" />
                          Connect
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-t border-[hsl(var(--color-border))] p-2">
              <button
                onClick={() => setIsExpanded(false)}
                className="w-full rounded-lg bg-[hsl(var(--color-surface-1))] px-3 py-2 text-xs text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}