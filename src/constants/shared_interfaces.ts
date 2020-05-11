export interface IArea {
    [key: string]: number[][]
  }
  
export interface IPlace {
    name: string, 
    location: {
      lat: number,
      lon: number,
    }
  };