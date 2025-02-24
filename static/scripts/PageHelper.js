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

  // Функция для вывода имени пользователя в правом верхнем углу
  initProfileName: async function(text){
    profileNameText = document.getElementById('profileName');

    if (localUser.error=='fail') {
        profileNameText.innerText = 'Войти'
    }
    else{
        profileNameText.innerText = localUser.username
    }
  },

  // Маршруты

  // Получить информацию о маршруте по его id через getRoute
  // и вывод полученных данных пользователю
  showRouteInfoById: async function(id){
    if(id != currentRouteId)
    {
      route = await pageHelper.getRoute(id);
      this.showRouteInfo(route);
    }
  },
  
  showRouteInfo: async function(route){
    var points = JSON.parse(route.points);
    photos = JSON.parse(route.photos);
    currentRoute = route;
    this.buildRouteOnMap(points);
    routeNameText.innerText = "Название маршрута: " + route.name
    routeDescriptionText.innerText = "Описание: " + route.description
    routeRatingText.innerText = "Рейтинг: " + route.rating
    
    commentsList.innerText = ''
    route.comments.forEach(comment => {
        pageHelper.showComment(comment.creator, comment.comment)
    })
    
    photosList.innerText = ''
    // В данном случае photo - название файла фотографии на серваке.
    i = 0;
    photos.forEach(photo => {
        let photoElem = document.createElement('img');
        photoElem.src = "/static/images/routes/" + photo;
        
        photoElem.photoId = photos.indexOf(photo);
        i++;
        photoElem.style.maxWidth = '300px';
        photoElem.addEventListener('click', pageHelper.onPhotoClick);

        photosList.appendChild(photoElem);
    })
  },  

  // Нажатие по имени профиля
  onProfileNameClick: function(){
    window.location.href = '/login'; 
  },

  // Нажатие на кнопку закрытия просмотра изображения
  onPhotoViewCloseClick: function(){
    document.getElementById('viewPhoto').style.display = 'none';
  },
  

  // Нажатие на фотографию
  onPhotoClick: function(event){
    pageHelper.openPhotoById(event.currentTarget.photoId);
    document.getElementById('routePhotosLabel').innerText = 'Фотографии к маршруту ' + currentRoute.name;
    /*
    document.getElementById('opennedImage').src = event.currentTarget.src;
    currentPhotoId = event.currentTarget.photoId;*/
    document.getElementById('viewPhoto').style.display = 'block';
  },

  // Открыть окно просмотра фотографии по его индексу из массива photos
  openPhotoById: function(id) {
    if (id > -1 & id < photos.length) {
      document.getElementById('opennedImage').src = '/static/images/routes/' + photos[id];
      currentPhotoId = id;
      console.log(id);
    }
  },

  // Следующая фотка 
  nextPhoto: function(){
    this.openPhotoById(currentPhotoId + 1);
  },

  // Предыдущее фото
  prevPhoto: function(){
    this.openPhotoById(currentPhotoId - 1);
  },

  // Получение маршрута по его id 
  // Возвращается json с данными о маршруте
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

  // Экспорт маршрута 
  // На входе тип файла, который будет экспортирован
  // В запросе на входе айдишник маршрута, точки(вообще все точки, 
  // массив точек выстроенный яндексом для построения маршрута, расстояние 
  // между ними дай бог метр), ну и тип экспорта
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

  // Формирование ссылки для скачивания файла экспортируемого маршрута
  downloadURI: function(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
  },

  // Построение маршрута на карте
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



  //-----------Комментарии-------------

  // Функция, чтобы оставить комментарий к маршруту
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
    else{
      parsedResult = JSON.parse(result);
      alert(parsedResult.error);
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
    commentElem.style.marginTop = '5px';

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
  
  
  
  //Импорт объектов 
  importObjects: function(){
    var input = document.getElementById('importSelector');
    input.type = 'file';

    // onchange - event вызываемый, если в input будет загружен какой либо файл
    // Добавляем в onchange обработку выбранного фото 
    input.onchange = async e => { 

        var file = e.target.files[0]; 
        var url = URL.createObjectURL(file);
        response = await fetch(url);
        var result = await response.text();
        
        fileType = file.name.split('.')[1]

        if (fileType == 'json' | fileType == 'geojson')
        {
            flippedJson = pageHelper.flipJsonCoords(JSON.parse(result));
            console.log(flippedJson);
            pageHelper.geoJsonImport(flippedJson);
        };

        if (fileType == 'osm'){
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(result,"text/xml");
            
            flippedXML = pageHelper.flipJsonCoords(osmtogeojson(xmlDoc));
            
            //nobs = remove_bs(flippedXML);
            //console.log(f)
            //pageHelper.geoJsonImport(flippedXML);
            objectManager.add(flippedXML);
            //pageHelper.geoJsonImport(osmtogeojson(xmlDoc));
        }
    }
    

    input.click(); 
  },
  
  geoJsonImport: function(json){
    json.features.forEach(f => 
    {
      var name = ''
      var nameFields = ['location', 'iconCaption']
      
      if (f.properties.location) {
        name = f.properties.location.name
      }
      else if (f.properties.iconCaption){
        name = f.properties.iconCaption
      }
      else if (f.prop)
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