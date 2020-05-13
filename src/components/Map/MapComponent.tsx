import React, { useState } from 'react';
import { Map, IProvidedProps, IMapProps, Polyline } from 'google-maps-react';
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

  interface IPoint  {
    lat: number,
    lng: number,
  }

export const MapComponent: React.FC<IMapComponent> = ({ google, areas, places }) =>  {


    const [ mapCenter, setCenter ] = useState({
        lat: 31.771959,
        lng: 35.217018,
    });

    const [ searchPaths, setSearchPaths ] = useState<IPoint[]>([]);
    const [ mapStartClickListener, setMapStartClickListener ] = useState<google.maps.MapsEventListener | undefined>(undefined);

    const onClearSearchPath = () => {
      setSearchPaths([]);
    }
    
    const updatePath = (event:any): void => {
      let newPaths: IPoint[] = [];
      newPaths.push({ lat: event.latLng.lat(), lng: event.latLng.lng()});
      setSearchPaths(searchPaths => searchPaths.concat(newPaths));
    }

    const onMapReady = (mapProps?: IMapProps, map?: google.maps.Map, event?: any): void => {
      const startSearchButton: Node = document.createElement('button');
      const clearSearchButton: Node = document.createElement('button');
            startSearchButton.textContent = 'Start search';
            clearSearchButton.textContent = 'Clear search';
            clearSearchButton.addEventListener('click', onClearSearchPath);
            startSearchButton.addEventListener('click', onStartSearch(map));
      const mapControls: google.maps.MVCArray<Node>|undefined = map?.controls[google.maps.ControlPosition.TOP_CENTER];
      mapControls?.push(startSearchButton);
      mapControls?.push(clearSearchButton);
    };

    const drawSearchArea = (event?: any): void => {
      updatePath(event);
    };

    const onStartSearch = (mapLink?: google.maps.Map) => () => {
      if(searchPaths.length > 0) {
        onClearSearchPath();
      }
        setMapStartClickListener(mapLink?.addListener('click', drawSearchArea));
    }

    const stopDrawingSearchArea = (mapProps?: IMapProps, map?: google.maps.Map, event?: any): void => {
      if(mapStartClickListener) {
        google.maps.event.removeListener(mapStartClickListener);
      }
      updatePath(event);
      console.log('stop drawing!');
    };

    return (
        <Map 
        zoom={14}
        style={style} 
        google={google} 
        initialCenter={mapCenter} 
        onReady={onMapReady}
        >
        {searchPaths.length > 1 && 
            <Polyline
            path={searchPaths}
            onClick={stopDrawingSearchArea}
            strokeColor="#0000FF"
            strokeOpacity={0.6}
            strokeWeight={4} />}
        </Map>
      );
};