import { createSlice } from '@reduxjs/toolkit';
import L from 'leaflet';
const mapSlice = createSlice({
  name: 'mapbox',
  initialState: {
    zoom: 4,
    center: [-8, 179.3053],
    bounds:null,
    layers: [],
    basemap: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
      attribution: '&copy; Pacific Community SPC',
    },
    eezoverlay: {
      url: 'https://opmgeoserver.gem.spc.int/geoserver/spc/wms',
      layer: 'spc:pacific_eez3',
    },
    coastlineoverlay: {
      url: 'https://opmgeoserver.gem.spc.int/geoserver/spc/wms',
      layer: 'spc:Pacific_Coastlines_openstreet_polygon',
    },
    enable_eez: true,
    enable_coastline: true
  },
  reducers: {
    setCenter(state, action) {
      state.center = action.payload;
    },
    setZoom(state, action) {
      state.zoom = action.payload;
    },
    setBounds(state, action) {
      state.bounds = action.payload;
    },
    setBaseMapLayer(state, action) {
      state.basemap = action.payload; // Add new layer to state
    },
    setOverlayLayer(state, action) {
      state.eezoverlay = action.payload; // Add new layer to state
    },
    setCoastlineLayer(state, action) {
      state.coastlineoverlay = action.payload; // Add new layer to state
    },
    setCoastlineEnable(state, action) {
      state.enable_coastline = action.payload; // Add new layer to state
    },
    setEEZEnable(state, action) {
      state.enable_eez = action.payload; // Add new layer to state
    },
    addMapLayer(state, action) {
        state.layers.push(action.payload); // Add new layer to state
      },
    removeMapLayer(state, action) {
        state.layers = state.layers.filter(layer => layer.id !== action.payload.id); // Remove layer by id
    },
    updateMapLayer(state, action) {
      const { id, updates } = action.payload;
      const index = state.layers.findIndex(layer => layer.id === id);
      if (index !== -1) {
        state.layers[index] = { ...state.layers[index], ...updates };
      }
    }
  },
});

export const { setCenter, setZoom, setBounds, addMapLayer, removeMapLayer,updateMapLayer,setBaseMapLayer,setOverlayLayer,setEEZEnable,setCoastlineLayer,setCoastlineEnable } = mapSlice.actions;
export default mapSlice.reducer;
