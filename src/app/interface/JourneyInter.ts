export interface Journey {
  journeyId: number;
  journeyName: string;
  invitation: string;
  startDate: string;
  endDate: string;
  transportation: string;
  userMail: string;
}
export interface JourneyResponse {
  code: number;
  message: string;
  journeyList: Journey[];
}
export interface spot {
  journeyId: number;
  spotId: number;
  day: number;
  date: string;
  arrivalTime: string;
  departureTime: string;
  spotName: string;
  placeId: string;
  note: string;
}

export interface route {
  journeyId: number;
  startPlaceId: string;
  endPlaceId: string;
  routeTime: string;
  startTime: string;
  transportation: string;
  distance: string;
  routeLine: string;
  day: number;
}
export interface SpotAndRouteResponse {
  code: number;
  message: string;
  spotList: spot[];
  routeList: route[];
}
export interface joinResponse {
  code: number;
  message: string;
}
export interface day {
  // isRevisable: boolean;
  journeyId: number;
  day: number;
  date: string;
  spotList: daySpot[];
}
export interface daySpot {
  spotId: number;
  spotName: string;
  placeId: string;
  note: string;
  arrivalTime: string;
  stayTime?: string;
  departureTime: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  placeType?: string;
  spotImage?: string;
}
export interface SpotAndRouteResponse2 {
  code: number;
  message: string;
  spotList: day[];
  routeList: route[];
}
