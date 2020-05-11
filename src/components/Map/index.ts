import { GoogleApiWrapper } from 'google-maps-react';
import { MapContainerComponent } from './MapContainer';
import { MAP_API_KEY } from '../../constants/api';
export const MapContainer: any = GoogleApiWrapper({
    apiKey: (MAP_API_KEY)
  })(MapContainerComponent);