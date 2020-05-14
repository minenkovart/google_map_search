import React, { PureComponent } from 'react';
import { IProvidedProps } from 'google-maps-react';
import { MapComponent } from './MapComponent';
import areas from '../../assets/areas.json';
import importPlaces from '../../assets/places.json';
import { IArea, IMarkerPlace } from '../../constants/shared_interfaces';

interface IMapContainerComponentState {
 areas: IArea,
 places: IMarkerPlace[],
};

export class MapContainerComponent extends 
PureComponent<IProvidedProps, IMapContainerComponentState> {
  
 state: IMapContainerComponentState = {
  areas,
  places: importPlaces.map( (place: { name: string, location: {lat:number, lon: number}}) => 
  ({ name: place.name, location: { lat: place.location.lat, lng: place.location.lon }})),
 }
  
  componentDidMount() {
    const { areas, places } = this.state;
    console.log(areas);
    console.log(places);
  }

  render() {
     const { areas, places } = this.state;
    return (<MapComponent 
      areas={areas} 
      places={places} 
      google={this.props.google}
      />);
  }
};