export interface Vehicle {
  name: string;
  imagePath: string;
  price: string;
  type: string;
  seats: number;
  brand: string;
  transmission: 'Automatic' | 'Manual';
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  horsepower: number;
  torque: number; // in lb-ft
  acceleration: number; // 0-60 mph in seconds
  topSpeed: number; // in mph
  engine: string; // e.g., "V12 Twin-Turbo"
  interiorMaterial: 'Leather' | 'Alcantara' | 'Carbon' | 'Merino Leather' | 'Nappa Leather' | 'Bridge of Weir Leather';
  convertible: boolean;
  hasHeatedSeats: boolean;
  hasMassageSeats: boolean;
  color: string;
  features: string[];
  year: number;
  mileage: number;
  chauffeurAvailable: boolean; // Indicates if a chauffeur is available
  vehicleId: number; // Unique identifier for the vehicle
  unavailableDates: string[]; // Array of unavailable dates in YYYY-MM-DD format
}