
import L from 'leaflet';
import $ from 'jquery';
L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
  
    onAdd: function (map) {
      // Triggered when the layer is added to a map.
      //   Register a click listener, then do all the upstream WMS things
      L.TileLayer.WMS.prototype.onAdd.call(this, map);
  map.on('click', this.getFeatureInfo, this);
    },
    
    onRemove: function (map) {
      // Triggered when the layer is removed from a map.
      //   Unregister a click listener, then do all the upstream WMS things
      L.TileLayer.WMS.prototype.onRemove.call(this, map);
      map.off('click', this.getFeatureInfo, this);
    },
    
    getFeatureInfo: function (evt) {
      console.log(evt.latlng); // Check if latlng is being passed correctly
      var url = this.getFeatureInfoUrl(evt.latlng);
      var showResults = L.Util.bind(this.showGetFeatureInfo, this);
      $.ajax({
        url: url,
        success: function (data, status, xhr) {
          var err = typeof data === 'string' ? null : data;
          var doc = (new DOMParser()).parseFromString(data, "text/html"); 
          if (doc.body.innerHTML.trim().length > 0)
            showResults(err, evt.latlng, data);
        },
        error: function (xhr, status, error) {
          showResults(error);
        }
      });
    },    
    
    getFeatureInfoUrl: function (latlng) {
      // Construct a GetFeatureInfo request URL given a point
      var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
          size = this._map.getSize(),
          
          params = {
            request: 'GetFeatureInfo',
            service: 'WMS',
            srs: 'EPSG:4326',
            styles: this.wmsParams.styles,
            transparent: this.wmsParams.transparent,
            version: this.wmsParams.version,      
            format: this.wmsParams.format,
            bbox: this._map.getBounds().toBBoxString(),
            height: Math.round(size.y),
            width: Math.round(size.x),
            layers: this.wmsParams.layers,
            query_layers: this.wmsParams.layers,
            info_format: 'text/html'
          };
      
      params[params.version === '1.3.0' ? 'i' : 'x'] = Math.round(point.x);
      params[params.version === '1.3.0' ? 'j' : 'y'] = Math.round(point.y);
      
      return this._url + L.Util.getParamString(params, this._url, true);
    },
    
    showGetFeatureInfo: function (err, latlng, content) {
      if (err) { console.log(err); return; } // do nothing if there's an error
      var el = document.createElement( 'html' );
      el.innerHTML =content
      var p = el.getElementsByTagName( 'td' );
      var val = p[5].textContent;
      var value = "";
      /*try {
        var val = p[5].textContent;
        val.replace(/\s/g, "");
        if(parseFloat(val) === -10.0){
          value = " No Data"
        }
        else{
          var valuee = parseFloat(p[5].textContent).toFixed(2);
          value = valuee;
        }
      }
      catch(err) {
        value = " Undefined"
      }*/
      // Otherwise show the content in a popup, or something.
      L.popup({ maxWidth: 800})
        .setLatLng(latlng)
        .setContent("<p>"+val+"</p>\n<p></p>timeseries")
        .openOn(this._map);
    }
  });
  
  L.tileLayer.betterWms = function (url, options) {
    return new L.TileLayer.BetterWMS(url, options);  
  };