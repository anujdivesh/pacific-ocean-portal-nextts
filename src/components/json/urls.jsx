

  export function get_url(value,id = null){

    //var server = "http://localhost:8000";
    var server = "https://dev-oceanportal.spc.int"
    switch (value) {
      case 'root_menu':
        return server+'/middleware/api/main_menu/?format=json&theme_id='+id;
      case 'metadata':
        return server+'/middleware/api/webapp_product/'+id+'/?format=json';
      case 'layer':
        return server+'/middleware/api/layer_web_map/'+id+'/?format=json';
      case 'theme':
        return server+'/middleware/api/theme/?format=json';
      default:
        return 'https://api.example.com/default';
    }
  };