export interface HealthcareFacility {
  id: string;
  name: string;
  type: 'TRAUMA_CENTER' | 'EMERGENCY_ROOM' | 'URGENT_CARE' | '24_7_PHARMACY';
  categoryTitle: string;
  distanceKm: number;
  driveTimeMin: number;
  open24Hours: boolean;
  address: string;
  cityState: string;
  phone: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  verifiedStatus: string;
  pharmacistOnDuty?: string;
  availableBeds?: number;
  currentWaitTimeMin: number;
  stockAvailability?: {
    firstAidSupplies: boolean;
    burnDressings: boolean;
    epinephrineAutoInjectors: boolean;
    sutureKits: boolean;
    otcAntiseptics: boolean;
  };
}

export const SPATIAL_FACILITIES_DATABASE: HealthcareFacility[] = [
  {
    id: 'fac-1',
    name: 'Metro General Level 1 Trauma Center',
    type: 'TRAUMA_CENTER',
    categoryTitle: 'Level 1 Trauma & Resuscitation Center',
    distanceKm: 2.1,
    driveTimeMin: 6,
    open24Hours: true,
    address: '742 University Medical Way',
    cityState: 'Metro District, CA 94103',
    phone: '(555) 911-4000',
    coordinates: { lat: 37.779, lng: -122.418 },
    rating: 4.9,
    verifiedStatus: 'Verified EMS Receiving Center',
    availableBeds: 14,
    currentWaitTimeMin: 0, // Critical trauma triaged immediately
    stockAvailability: {
      firstAidSupplies: true,
      burnDressings: true,
      epinephrineAutoInjectors: true,
      sutureKits: true,
      otcAntiseptics: true
    }
  },
  {
    id: 'fac-2',
    name: 'St. Jude Emergency & Acute Cardiac Center',
    type: 'EMERGENCY_ROOM',
    categoryTitle: 'Comprehensive Emergency Dept',
    distanceKm: 3.4,
    driveTimeMin: 9,
    open24Hours: true,
    address: '1100 Pine Crest Boulevard',
    cityState: 'North Heights, CA 94109',
    phone: '(555) 911-3800',
    coordinates: { lat: 37.788, lng: -122.425 },
    rating: 4.8,
    verifiedStatus: 'Certified Stroke & STEMI Center',
    availableBeds: 8,
    currentWaitTimeMin: 12,
    stockAvailability: {
      firstAidSupplies: true,
      burnDressings: true,
      epinephrineAutoInjectors: true,
      sutureKits: true,
      otcAntiseptics: true
    }
  },
  {
    id: 'fac-3',
    name: 'CityHealth Rapid Urgent Care & Minor Surgery',
    type: 'URGENT_CARE',
    categoryTitle: 'Walk-In Urgent Care & Lacerations',
    distanceKm: 1.2,
    driveTimeMin: 4,
    open24Hours: false,
    address: '450 Market Street, Suite 100',
    cityState: 'Downtown, CA 94105',
    phone: '(555) 344-8700',
    coordinates: { lat: 37.771, lng: -122.409 },
    rating: 4.7,
    verifiedStatus: 'On-Site Suturing & Digital X-Ray',
    currentWaitTimeMin: 15,
    stockAvailability: {
      firstAidSupplies: true,
      burnDressings: true,
      epinephrineAutoInjectors: false,
      sutureKits: true,
      otcAntiseptics: true
    }
  },
  {
    id: 'fac-4',
    name: 'BioCross 24/7 Tele-Pharmacy & Rapid Dispatch',
    type: '24_7_PHARMACY',
    categoryTitle: 'Verified 24/7 Community Tele-Pharmacy',
    distanceKm: 0.8,
    driveTimeMin: 3,
    open24Hours: true,
    address: '280 Mission Boulevard',
    cityState: 'Mission Bay, CA 94107',
    phone: '(555) 882-9900',
    coordinates: { lat: 37.775, lng: -122.402 },
    rating: 4.9,
    verifiedStatus: 'Verified Pharmacist on Duty • Courier Hub',
    pharmacistOnDuty: 'Dr. Elena Rostova, PharmD (Active)',
    currentWaitTimeMin: 2,
    stockAvailability: {
      firstAidSupplies: true,
      burnDressings: true,
      epinephrineAutoInjectors: false,
      sutureKits: false,
      otcAntiseptics: true
    }
  },
  {
    id: 'fac-5',
    name: 'CarePoint 24-Hour Apothecary & Wound Care',
    type: '24_7_PHARMACY',
    categoryTitle: 'Licensed Medical Supply & OTC Dispenser',
    distanceKm: 2.6,
    driveTimeMin: 7,
    open24Hours: true,
    address: '1520 Valencia Street',
    cityState: 'Mission District, CA 94110',
    phone: '(555) 762-1144',
    coordinates: { lat: 37.755, lng: -122.421 },
    rating: 4.6,
    verifiedStatus: 'State Board Licensed • Doorstep Drone/Courier',
    pharmacistOnDuty: 'Marcus Chen, RPh (Active)',
    currentWaitTimeMin: 5,
    stockAvailability: {
      firstAidSupplies: true,
      burnDressings: true,
      epinephrineAutoInjectors: false,
      sutureKits: false,
      otcAntiseptics: true
    }
  }
];
