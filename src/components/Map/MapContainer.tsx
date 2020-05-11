import React, { PureComponent } from 'react';
import { IProvidedProps } from 'google-maps-react';
import { MapComponent } from './MapComponent';
import areas from '../../assets/areas.json';
import places from '../../assets/places.json';
import { IArea, IPlace } from '../../constants/shared_interfaces';



interface IMapContainerComponentState {
 areas: IArea,
 places: IPlace[],
};

export class MapContainerComponent extends 
PureComponent<IProvidedProps, IMapContainerComponentState> {
  
 state: IMapContainerComponentState = {
  areas,
  places,
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