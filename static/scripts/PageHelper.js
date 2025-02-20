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

  initProfileName: async function(text){
    profileNameText = document.getElementById('profileName');

    if (localUser.error=='fail') {
        profileNameText.innerText = 'Войти'
    }
    else{
        profileNameText.innerText = localUser.username
    }
  },

  onProfileNameClick: function(){
    if (localUser){
      window.location.href = '/profile'; 
    }
    else{
      window.location.href = '/auth'; 
    }
  },

  getRoute: async function(id){
    var url = '/getRoute'

    let data = JSON.stringify({ route_id: id })

    let response = await fetch(url, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        method: 'POST',
        body: data
    });
    var result = await response.text();
    const parsedResult = JSON.parse(result)
    return parsedResult
  },

  exportRoute: async function(type){
    var url = '/export'

    let data = JSON.stringify({ 
        id: currentRoute.id,
        points: pathCoords, 
        export_type: type
    })

    let response = await fetch(url, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        method: 'POST',
        body: data
    });
    var result = await response.text();

    exporturi = '/static/exports/' + type + "/" + result;
    pageHelper.downloadURI(exporturi, type + '_export')
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

  makeComment: async function(){
    var url = '/makeComment'

    let data = JSON.stringify({ 
        route_id: currentRoute.id, 
        comment: commentField.value
    })

    let response = await fetch(url, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        method: 'POST',
        body: data
    });
    var result = await response.text();

    if (result == 'ok'){
      this.showComment(localUser.username, commentField.value)
    }
    /*
    const parsedResult = JSON.parse(result);
    if(parsedResult.error != null){
        alert(parsedResult.error);
    }
    else{
        this.showComment(localUser.username, data.comment)
        console.log('show')
    }
    */
  },

  showComment: function(creator, comment){
    let commentElem = document.createElement('div');
    commentElem.style.border = '1px solid #ccc';

    let commentCreatorElem = document.createElement('p');
    commentCreatorElem.style.fontWeight = 'bold';
    commentCreatorElem.style.marginTop = '10px'
    commentCreatorElem.style.marginBottom = '0px'
    commentCreatorElem.style.marginLeft = '7px'
    commentCreatorElem.style.fontSize = '16px'
    commentElem.appendChild(commentCreatorElem);


    let commentTextElem = document.createElement('p');

    commentTextElem.style.marginLeft = '7px'
    commentTextElem.style.marginTop = '5px'
    commentTextElem.style.fontSize = '16px'

    commentElem.appendChild(commentTextElem);
    commentTextElem.innerText = comment;
    commentCreatorElem.innerText = creator;
    commentsList.appendChild(commentElem);
  },
  //JSON
  geoJsonImport: function(json){
    json.features.forEach(f => 
    {
      var name = ''
      if (f.properties.location) {
        name = f.properties.location.name
      }
      else if (f.properties.iconCaption){
        name = f.properties.iconCaption
      }
      var myGeoObject = new ymaps.GeoObject({
        geometry: {
          type: f.geometry.type, // тип геометрии - точка
          coordinates: f.geometry.coordinates // координаты точки
        },
        properties:{
          balloonContentHeader: name,
          balloonContent: f.properties.description
        }
      },{
          strokeColor: f.properties.stroke,
          strokeWidth: f.properties['stroke-width'],
          strokeOpacity: f.properties['stroke-opacity'],
          fillColor: f.properties.fill,
          fillOpacity: f.properties['fill-opacity']
        });
      
      myMap.geoObjects.add(myGeoObject);
      
    });
  },
  flipJsonCoords: function(json){
    function findAllCoordinates(obj) {
      var objects = [];
      for (var i in obj) {
          if (i === "coordinates") {
              objects.push(obj[i]);
          } else if (typeof obj[i] == 'object') {
              objects = objects.concat(
                  findAllCoordinates(obj[i])
              );
          }
      }
      return objects;
    }

    function flipAllCoordinatesArray(coordinates) {
        if (coordinates && coordinates.length === 2 && typeof coordinates[0] === 'number') {
            coordinates.reverse();
        } else {
            for (var p = 0; p < coordinates.length; p++) {
              flipAllCoordinatesArray(coordinates[p]);
            }
        }
    }

    var values = findAllCoordinates(json);

    for (var i = 0; i < values.length; i++) {
        flipAllCoordinatesArray(values[i]);
    }

    return json;
  }
  
}