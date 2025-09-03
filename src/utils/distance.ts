export interface UserLocation {
    lat: number;
    lng: number;
}

export interface DistanceResult {
    distance: string;
    duration: string;
    distanceValue: number;
    durationValue: number;
}

// Get user's current location using HTML5 Geolocation API
export function getUserLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                let errorMessage = 'Failed to get location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                }
                reject(new Error(errorMessage));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // Cache for 5 minutes
            }
        );
    });
}

// Calculate distance and duration using Distance Matrix API
export async function getDistance(
    userLat: number,
    userLng: number,
    branchLat: number,
    branchLng: number
): Promise<DistanceResult> {
    const apiKey =
        process.env.NEXT_PUBLIC_DISTANCE_MATRIX_API_KEY ||
        '81SddibFtpdWiJzqug3faNibQSCTrxzhJ7xdogo6LRqbe8buG51PsKGmbqhBpGNd';
    const url = `https://api.distancematrix.ai/maps/api/distancematrix/json?origins=${userLat},${userLng}&destinations=${branchLat},${branchLng}&key=${apiKey}`;

    console.log('Distance Matrix API Request:', {
        userLat,
        userLng,
        branchLat,
        branchLng,
        apiKey: apiKey.substring(0, 10) + '...',
    });

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `API request failed with status ${response.status}`
            );
        }

        const data = await response.json();

        if (data.status !== 'OK') {
            console.error('Distance Matrix API Error:', {
                status: data.status,
                error_message: data.error_message,
                url,
            });
            throw new Error(
                `API returned status: ${data.status}${data.error_message ? ' - ' + data.error_message : ''}`
            );
        }

        const element = data.rows[0]?.elements[0];

        if (!element || element.status !== 'OK') {
            throw new Error('No route found between locations');
        }

        return {
            distance: element.distance.text,
            duration: element.duration.text,
            distanceValue: element.distance.value, // in meters
            durationValue: element.duration.value, // in seconds
        };
    } catch (error) {
        console.error('Distance calculation error:', error);
        throw new Error(
            error instanceof Error
                ? error.message
                : 'Failed to calculate distance'
        );
    }
}

// Get distance between user and branch with proper error handling
export async function getBranchDistance(
    branchLat?: number,
    branchLng?: number
): Promise<DistanceResult | null> {
    try {
        // Check if branch has coordinates
        if (!branchLat || !branchLng) {
            return null;
        }

        // Get user location
        const userLocation = await getUserLocation();

        // Calculate distance
        const distance = await getDistance(
            userLocation.lat,
            userLocation.lng,
            branchLat,
            branchLng
        );

        return distance;
    } catch (error) {
        console.warn('Could not calculate distance:', error);
        return null;
    }
}

// Get address from coordinates using reverse geocoding
export async function getAddressFromCoordinates(
    lat: number,
    lng: number
): Promise<string> {
    try {
        // First try with Google Geocoding API (if available)
        const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (googleApiKey) {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}&language=vi`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0) {
                return data.results[0].formatted_address;
            }
        }

        // Fallback to OpenStreetMap Nominatim (free service)
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi,en`;

        const response = await fetch(nominatimUrl, {
            headers: {
                'User-Agent': 'OMS-Frontend/1.0',
            },
        });

        if (!response.ok) {
            throw new Error(
                `Geocoding request failed with status ${response.status}`
            );
        }

        const data = await response.json();

        if (data.display_name) {
            return data.display_name;
        }

        throw new Error('No address found for the given coordinates');
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        throw new Error(
            error instanceof Error
                ? error.message
                : 'Failed to get address from location'
        );
    }
}

// Get current location and convert to address
export async function getCurrentLocationAddress(): Promise<string> {
    try {
        // Get user location
        const userLocation = await getUserLocation();

        // Convert coordinates to address
        const address = await getAddressFromCoordinates(
            userLocation.lat,
            userLocation.lng
        );

        return address;
    } catch (error) {
        console.error('Get current location address error:', error);
        throw new Error(
            error instanceof Error
                ? error.message
                : 'Failed to get current location address'
        );
    }
}
