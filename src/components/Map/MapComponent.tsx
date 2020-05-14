import React, { useState, useEffect, useRef } from 'react';
import { Map, IProvidedProps, IMapProps, Polyline, Polygon, Marker } from 'google-maps-react';
import { IArea, IMarkerPlace } from '../../constants/shared_interfaces';
// https://drive.google.com/file/d/194LKdI9HXm4tlxNJCJGN3EzDj14NuBPv

const style = {
    width: '100%',
    height: '100%'
  }

  interface IMapComponent extends IProvidedProps {
    areas: IArea,
    places: IMarkerPlace[],
  }

  interface IPoint  {
    lat: number,
    lng: number,
  }

export const MapComponent: React.FC<IMapComponent> = ({ google, areas, places }) =>  {

    const searchPolygon = useRef(null);
    const [ mapCenter, setCenter ] = useState({
        lat: 34.966894,
        lng: 32.390046,
    });

    const [ searchPaths, setSearchPaths ] = useState<IPoint[]>([]);
    const [ foundAreas, setFoundAreas ] = useState<IArea>({});
    const [foundPlaces, setFoundPlaces ] = useState<IMarkerPlace[]>([]);
    const [ mapStartClickListener, setMapStartClickListener ] = useState<google.maps.MapsEventListener | undefined>(undefined);
    const [ isSearchHighlightVisible, setIsSearchHighlightVisible ] = useState<boolean>(false);


    const onClearSearchPath = () => {
      setSearchPaths([]);
      setFoundAreas({});
      setIsSearchHighlightVisible(false);
    }
    
    const updatePath = (event:any): void => {
      let newPaths: IPoint[] = [];
      newPaths.push(event.latLng);
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
      setIsSearchHighlightVisible(true);
      console.log('stop drawing!');
    };

    const findAreas = (polygon: google.maps.Polygon) => {
      const foundAreas: { [key:string]: number[][]} = {};
      Object.keys(areas).forEach((area: string) => {
        const result = areas[area].filter((latLng: number[]) => {
         return google.maps.geometry.poly.containsLocation(
           new google.maps.LatLng({ lat:latLng[0], lng: latLng[1]}), polygon);
       }); 
       if(result.length > 0) {
         foundAreas[area] = result;
       }
     });
     setFoundAreas(foundAreas);
    }

    const findPlaces = (polygon: google.maps.Polygon) => {
      const foundPlaces: IMarkerPlace[] = places.filter((place: IMarkerPlace) => {
        return google.maps.geometry.poly.containsLocation(
          new google.maps.LatLng(place.location), polygon);
       });
       setFoundPlaces(foundPlaces);
    };

    useEffect( () => {
       if(isSearchHighlightVisible) {
         const polygon = (searchPolygon.current as any).polygon;
        findAreas(polygon);
        findPlaces(polygon);
       }

    }, [isSearchHighlightVisible]);

    return (
        <Map 
        zoom={9}
        style={style} 
        google={google} 
        initialCenter={mapCenter} 
        onReady={onMapReady}
        >
        {searchPaths.length > 1 && 
        !isSearchHighlightVisible &&
            <Polyline path={searchPaths}
                      onClick={stopDrawingSearchArea}
                      strokeColor="#0000FF"
                      strokeOpacity={0.6}
                      strokeWeight={4} 
                      />}
        {isSearchHighlightVisible && 
            <Polygon  ref={searchPolygon}
                      paths={searchPaths}
                      strokeColor="#0000FF"
                      strokeOpacity={0.3}
                      strokeWeight={1}
                      fillColor="#00FFFF"
                      fillOpacity={0.35} 
                      />}
        {Object.keys(foundAreas).map(area =>
            (<Polygon key={area}
                      paths={foundAreas[area].map(pathPoint => ({ lat:pathPoint[0], lng: pathPoint[1]}))}
                      strokeColor="#0000FF"
                      strokeOpacity={0.4}
                      strokeWeight={1}
                      fillColor="#FF00FF"
                      fillOpacity={0.8} />))}
            { foundPlaces.length && foundPlaces.map( (place: IMarkerPlace) => {
                return (
                  <Marker 
                          key={place.name}
                          title={place.name}
                          position={place.location} />)
            })
            }
        </Map>
      );
};