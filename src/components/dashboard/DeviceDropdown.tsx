import DeviceManager from './DeviceManager';
import ErrorBoundary from '../common/ErrorBoundary';

const DeviceDropdown = () => {
  return (
    <ErrorBoundary>
      <DeviceManager compact={true} />
    </ErrorBoundary>
  );
};

export default DeviceDropdown;