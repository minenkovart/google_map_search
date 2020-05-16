import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, 
  IProvidedProps, 
  IMapProps, 
  Polyline, 
  Polygon, 
  Marker, 
  InfoWindow 
} from 'google-maps-react';
import { IArea, IMarkerPlace, IPoint } from '../../constants/shared_interfaces';

const style = {
    width: '100%',
    height: '100%'
  }

  interface IMapComponent extends IProvidedProps {
    areas: IArea,
    places: IMarkerPlace[],
  }
 
  interface IMaxRemoteDistance {
  pointFrom: IMarkerPlace | null,
  pointTo: IMarkerPlace | null,
  distance: number,
  }

export const MapComponent: React.FC<IMapComponent> = ({ google, areas, places }) =>  {

    const searchPolygon = useRef(null);
    const [ mapCenter, setCenter ] = useState({
        lat: 34.966894,
        lng: 32.390046,
    });

    const [ searchPaths, setSearchPaths ] = useState<IPoint[]>([]);
    const [ foundAreas, setFoundAreas ] = useState<IArea>({});

    const [ maxRemoteDistance, setMaxRemoteDistance ] = useState<IMaxRemoteDistance | null>(null);
    const [foundPlaces, setFoundPlaces ] = useState<IMarkerPlace[]>([]);
    const [ mapStartClickListener, setMapStartClickListener ] = useState<google.maps.MapsEventListener | undefined>(undefined);
    const [ isSearchHighlightVisible, setIsSearchHighlightVisible ] = useState<boolean>(false);


    const onClearSearchPath = () => {
      setSearchPaths([]);
      setFoundAreas({});
      setFoundPlaces([]);
      setMaxRemoteDistance(null);
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
      const mapControls: google.maps.MVCArray<Node>|undefined = 
      map?.controls[google.maps.ControlPosition.TOP_CENTER];
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

    const isPolygonContainsLocation = (point: IPoint, polygon: google.maps.Polygon) =>
       google.maps.geometry.poly.containsLocation(new google.maps.LatLng(point), polygon);
    
    const findAreas = (polygon: google.maps.Polygon) => {
      const foundAreas: { [key:string]: number[][]} = {};
      Object.keys(areas).forEach((area: string) => {
        const result = areas[area].filter((latLng: number[]) => {
         return isPolygonContainsLocation({ lat:latLng[0], lng: latLng[1]}, polygon);
       }); 
       if(result.length > 0) {
         foundAreas[area] = result;
       }
     });
     setFoundAreas(foundAreas);
    }

    const findMostRemotePlaces = (foundPlaces:IMarkerPlace[]) => {
      let i: number;
      let maxRemoteDistance: IMaxRemoteDistance = {
        pointFrom: null,
        pointTo: null,
        distance: 0,
      };
      
      const { LatLng, 
              geometry: {
                spherical: { 
                computeDistanceBetween 
              } 
            } 
          } = google.maps;
      for(i = 0; i < foundPlaces.length; i++) {
        const pointFrom = new LatLng(foundPlaces[i].location);
        let j: number;
        for( j = 0; j<foundPlaces.length; j++) {
          if(j === i) {
            continue; // skip current place
          }
          const pointTo = new LatLng(foundPlaces[j].location);
          const distance: number = computeDistanceBetween(
           pointFrom, pointTo);
           if(maxRemoteDistance.distance < distance) {
             maxRemoteDistance = {
               distance,
               pointFrom: foundPlaces[i],
               pointTo: foundPlaces[j],
             }
           }
        }
      }
      setMaxRemoteDistance(maxRemoteDistance);
    }

    const findPlaces = (polygon: google.maps.Polygon) => {
      const foundPlaces: IMarkerPlace[] = places.filter((place: IMarkerPlace) =>
      isPolygonContainsLocation(place.location, polygon));
       findMostRemotePlaces(foundPlaces);
       setFoundPlaces(foundPlaces);
    };

    const calculateAndAvgWalkingTime = (start?: IPoint, end?: IPoint) => {
      const { DirectionsService } = google.maps;
      var directionsService = new DirectionsService();

      directionsService.route({
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.WALKING
      }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          console.log(response.routes[0].legs[0].duration.text);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    }

    const showAvgWalkTime = (mapProps?: IMapProps, map?: google.maps.Map, event?: any) => {
      // const infowindow = new google.maps.InfoWindow();
      // infowindow.open(map); // trows error, investigating...
      // infowindow.setPosition(event.latLng);
      // console.log(map, event);
    }

    useEffect( () => { // calc avg walk time between most remote places,
      if(maxRemoteDistance?.distance) {
        const { pointFrom, pointTo } = maxRemoteDistance;
        calculateAndAvgWalkingTime(pointFrom?.location, pointTo?.location);
      } 
    },[maxRemoteDistance]);

    useEffect( () => { // searching for areas and places in search area;
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
                      onMouseover={showAvgWalkTime}
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
                  <Marker key={place.name}
                          title={place.name}
                          position={place.location} />)
            })
            }
            { maxRemoteDistance?.distance &&
               <Polyline path={[
                 maxRemoteDistance.pointFrom?.location, 
                 maxRemoteDistance.pointTo?.location
                ]}
               strokeColor="#FC3903"
               strokeOpacity={2}
               strokeWeight={1} 
               />
            }
        </Map>
      );
};