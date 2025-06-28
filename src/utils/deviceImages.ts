// Map of device IDs to their image URLs
export const deviceImages = {
  'freestyle-libre': 'https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'dexcom-g7': 'https://images.pexels.com/photos/4226264/pexels-photo-4226264.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'apple-watch': 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'oura-ring': 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'fitbit': 'https://images.pexels.com/photos/4498482/pexels-photo-4498482.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'garmin': 'https://images.pexels.com/photos/4498361/pexels-photo-4498361.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'whoop': 'https://images.pexels.com/photos/4498140/pexels-photo-4498140.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'apple-health': 'https://images.pexels.com/photos/4226122/pexels-photo-4226122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'google-fit': 'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'withings': 'https://images.pexels.com/photos/4498429/pexels-photo-4498429.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'default': 'https://images.pexels.com/photos/4226263/pexels-photo-4226263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
};

// Get image URL for a device
export const getDeviceImage = (deviceId: string): string => {
  // Fallback to default if image URL is not available
  if (!deviceId || !deviceImages[deviceId as keyof typeof deviceImages]) {
    return deviceImages.default;
  }
  return deviceImages[deviceId as keyof typeof deviceImages];
};