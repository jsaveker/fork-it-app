declare namespace google.maps.places {
  interface PlaceOptions {
    location?: google.maps.LatLng | google.maps.LatLngLiteral;
    placeId?: string;
    query?: string;
    fields?: string[];
  }

  class Place {
    constructor(options: PlaceOptions);
    static searchNearby(request: {
      location: google.maps.LatLng;
      radius: number;
      type?: string;
      keyword?: string;
    }): Promise<{
      status: string;
      results: Array<{
        place_id: string;
        name: string;
        vicinity: string;
        rating?: number;
        user_ratings_total?: number;
        price_level?: number;
        geometry: {
          location: {
            lat: number;
            lng: number;
          };
        };
        types: string[];
        photos?: Array<{
          height: number;
          width: number;
          html_attributions: string[];
          photo_reference: string;
        }>;
      }>;
    }>;
  }
} 