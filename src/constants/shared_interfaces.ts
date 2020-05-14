import { IMarkerProps } from "google-maps-react";

export interface IArea {
    [key: string]: number[][]
  }

  export interface IMarkerPlace extends IMarkerProps {
    name: string;
    location: {lat: number, lng: number };
  }