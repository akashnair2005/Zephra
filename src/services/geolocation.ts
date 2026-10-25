/**
 * Browser Geolocation helper with timeout and friendly error messages.
 */
export async function getDeviceCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser. Please search manually."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location access was denied. You can still search for any city manually."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Your current location coordinates are unavailable. Please search manually."));
            break;
          case error.TIMEOUT:
            reject(new Error("Request to get your location timed out. Please try again or search manually."));
            break;
          default:
            reject(new Error("Unable to retrieve location. Please search for your city above."));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}
