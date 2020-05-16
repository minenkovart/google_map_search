import { IMarkerProps } from "google-maps-react";

export interface IArea {
    [key: string]: number[][]
  }

export interface IPoint {
    lat: number,
    lng: number,
  }

export interface IMarkerPlace extends IMarkerProps {
    name: string;
    location: IPoint;
  }