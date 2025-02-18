// pageHelper - класс(?) где в одном месте хранятся функции, которые можно вызывать
// в любом месте и без повторного их написания в других классах


var pageHelper = {

  // Функция для вывода ошибки на странице 
  // (например, в случае ввода неверных данных при авторизации)
  setErrorText: function(text) {
    var errorText = document.getElementById('errorText'); 
    if(errorText != null)
    {
      errorText.innerText = text;
    }
  },

  // Запрос на получение локального пользователя из flask
  // (так я называю пользователя вошедшего в свой аккаунт)
  getLocalUserInfo: async function(){
    var url = '/getLocalUser'
    let response = await fetch(url, {
      headers: {
          "Content-Type": "application/json; charset=utf-8",
      },
      method: 'GET'
    });
    var result = await response.text();
    const parsedResult = JSON.parse(result)
    return parsedResult
  },
  downloadURI: function(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
  },
  buildRouteOnMap: function(points){
    myMap.geoObjects.remove(mapRoute);
    console.log(points)
    var multiRoute = new ymaps.multiRouter.MultiRoute({   
        referencePoints: points
    }, {
        wayPointVisible: false,
        boundsAutoApply: true
    });
    myMap.geoObjects.add(multiRoute);
    mapRoute = multiRoute;
    multiRoute.model.events.add('requestsuccess', function() {
        var activeRoute = multiRoute.getActiveRoute();
        var activeRoutePaths = activeRoute.getPaths(); 
        activeRoutePaths.each(function(path) {
            pathCoords = path.properties.get('coordinates');
        });
    }); 
  },
  geoJsonImport: function(json){
    console.log(flip(json))
    json.features.forEach(f => 
    {
      var myGeoObject = new ymaps.GeoObject({
        geometry: {
          type: f.geometry.type, // тип геометрии - точка
          coordinates: [f.geometry.coordinates[1], f.geometry.coordinates[0]]// координаты точки
        }
      });
      myMap.geoObjects.add(myGeoObject);
      
      /*
      if (f.geometry.type == 'Point'){
          console.log(f.geometry.coordinates)
          var newPoint = new ymaps.Placemark([f.geometry.coordinates[1],f.geometry.coordinates[0]]);
          
          myMap.geoObjects.add(newPoint);      
      }*/

    });
  }
}