import React from 'react';

import {compose, withProps} from "recompose"
import {withScriptjs, withGoogleMap, GoogleMap, Marker} from "react-google-maps"
import HeatmapLayer from "react-google-maps/lib/components/visualization/HeatmapLayer";

/* eslint-disable no-undef */
const MapComponent = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,pla" +
        "ces,visualization&key=AIzaSyBVbAgdSScI654cSV8XCS4RUUxByaOTI9A",
    loadingElement: <div style={{
        height: `100%`
      }}/>,
    containerElement: <div style={{
        height: `600px`
      }}/>,
    mapElement: <div style={{
          height: `100%`
        }}/>
  }),
  withScriptjs,
  withGoogleMap
)(
  (props) => <GoogleMap
    defaultZoom={props.zoom}
    center={props.center}
    options={{
      styles: props.mapStyle
    }}>
    <Marker position={props.currentCenter}/>
    <HeatmapLayer
      options={props.heatmapOptions}
      data={props.data.map(obj => {
        return new google.maps.LatLng(obj.lat, obj.lng)
      })}></HeatmapLayer>
  </GoogleMap>
);

export default MapComponent
