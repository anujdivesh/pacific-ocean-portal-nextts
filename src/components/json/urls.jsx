

  export function get_url(value,id = null){

    //var server = "http://localhost:8000";
    var server = "https://dev-oceanportal.spc.int"
    switch (value) {
      case 'root-path':
        return server
      case 'root_menu':
        return server+'/middleware/api/main_menu/?format=json&theme_id='+id;
      case 'metadata':
        return server+'/middleware/api/webapp_product/'+id+'/?format=json';
      case 'layer':
        return server+'/middleware/api/layer_web_map/'+id+'/?format=json';
      case 'theme':
        return server+'/middleware/api/theme/?format=json';
      case 'country':
        return server+'/middleware/api/country/?format=json';
      case 'getLegend':
        return 'https://opmmiddleware.gem.spc.int/cgi-bin/getLegend.py?units=null&layer_map='+id+'&coral=False';
      case 'tailored_menu':
        return 'https://dev-oceanportal.spc.int/middleware/api/tailored_menu/?country_id=4&format=json'
      case 'getMap':
        return 'https://opmmiddleware.gem.spc.int/cgi-bin/getMap.py?'
      default:
        return 'https://api.example.com/default';
    }
  };