import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DeviceManager from './DeviceManager';

const DeviceDropdown = () => {
  // Use the compact version of DeviceManager for the dropdown
  return <DeviceManager compact={true} />;
};

export default DeviceDropdown;