import React, { useState } from 'react';
import {Map, IProvidedProps, IMarkerProps, Polygon} from 'google-maps-react';
import { IArea, IPlace } from '../../constants/shared_interfaces';
// https://drive.google.com/file/d/194LKdI9HXm4tlxNJCJGN3EzDj14NuBPv

const style = {
    width: '100%',
    height: '100%'
  }

  interface IMapComponent extends IProvidedProps {
    areas: IArea,
    places: IPlace[],
  }

export const MapComponent: React.FC<IMapComponent> = ({ google, areas, places }) =>  {

    const [ mapCenter, setCenter ] = useState({
        lat: 31.771959,
        lng: 35.217018,
    });

    return (
        <Map style={style} google={google} initialCenter={mapCenter} zoom={14}>
          {Object.keys(areas).map(area =>
        (<Polygon
            key={area}
            paths={areas[area].map(pathPoint => ({ lat:pathPoint[0], lng: pathPoint[1]}))}
            strokeColor="#0000FF"
            strokeOpacity={0.8}
            strokeWeight={2}
            fillColor="#0000FF"
            fillOpacity={0.35} />))}
        </Map>
      );
};