var myMap; // Переменная для хранения созданной карты 

// ----Элементы из html----
var routeNameInput; // Ссылка на элемент текста названия маршрута,...
var routeDescriptionInput; //... описания маршрута
var routeRatingText; //... рейтинга маршрута
var profileNameText; // элемент текста имени пользователя
var commentField; // элемент поля ввода комментария
var routeList;
var commentsList;
var changesList;
var changesMode;
var pathCoords;

var loadedPhotos = [];

var publicRoutes; // переменная для хранения всех публичных маршрутов

var localUser; // переменная для хранения вошедшего пользователя

var currentPhotoId;
var photos = [];

var currentRoute;
var currentRouteId = -1;
var mapRoute;
ymaps.ready(init);

async function init(){
    routeNameInput = document.getElementById("routeNameInput");
    routeDescriptionInput = document.getElementById("routeDescInput");
    profileNameText = document.getElementById('profileName');
    commentField = document.getElementById('commentField');
    commentsList = document.getElementsByClassName('commentsList')[0];
    photosList = document.getElementsByClassName('photosList')[0];
    changesList = document.getElementsByClassName('changesList')[0];

    var routeLabelText = document.getElementById('routeLabel');
    localUser = await pageHelper.getLocalUserInfo();
    pageHelper.initProfileName();

    // Создание карты.
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],     
        zoom: 7
    });

    //pageHelper.showRouteInfo(myRoutes[0].id)
    currentRoute = JSON.parse(document.getElementById("mydiv").dataset.route);

    routeLabelText.innerText = 'Маршрут ' + currentRoute.name;
    
    routeNameInput.value = currentRoute.name;
    routeDescriptionInput.value = currentRoute.description;
    //photos = JSON.parse(currentRoute.photos);

    var remotePhotos = JSON.parse(currentRoute.photos);
    remotePhotos.forEach(p => {photos.push(pageHelper.createPhoto(p, false))})
    console.log(photos)
    pageHelper.buildRouteOnMap(JSON.parse(currentRoute.points));
    
    pageHelper.showPhotos(photos);
    pageHelper.showComments(currentRoute.comments);
    mapRoute.editor.start({
        addWayPoints: true,
        removeWayPoints: true
    });    //pageHelper.showRouteInfo(currentRoute);
    /*
    var referencePoints;
    referencePoints = ['kolosunin.jpg', 'test.jpg']
    
    console.log(JSON.stringify(referencePoints))*/
    //saveRoute()
}

function onRouteButtonClick(event){
    pageHelper.showRouteInfoById(event.currentTarget.routeId);
}

function deletePhoto(){
    photos.splice(currentPhotoId, 1);
    photoElems = document.getElementsByClassName("ph");
    pageHelper.showPhotos(photos);
    if (currentPhotoId == photos.length - 1){
        pageHelper.openPhotoById(currentPhotoId - 1);}
    else if (currentPhotoId == 0 & photos.length > 1){
        pageHelper.openPhotoById(currentPhotoId + 1);}
    else {
        pageHelper.openPhotoById(currentPhotoId - 1);
    }
    
    console.log(currentRouteId);
    console.log(photos);
}

async function selectMultiplePhotos()
{
  // Получаем ссылку на элемент загрузки фото (<input type="file">) из html
  var input = document.getElementById('photoSelector');
  input.type = 'file';
  
  // onchange - event вызываемый, если в input будет загружен какой либо файл
  // Добавляем в onchange обработку выбранного фото 
  input.onchange = async e => { 

    var files = e.target.files; 
    for(let i = 0; i < files.length; i++){
        photos.push(pageHelper.createPhoto(URL.createObjectURL(files.item(i)), true))
        pageHelper.showPhotos(photos);
        loadedPhotos = files;
    }
    
    
    //loadPhotos(files);
    // Показываем выбранное фото в элементе для отображения аватарки
    //profilePic.src = URL.createObjectURL(loadedPhoto)
  }

  input.click(); 
}

async function saveRouteChanges(){
    const data = new FormData();
    data.append('name', routeNameInput.value);
    data.append('desc', routeDescriptionInput.value);
    data.append('id', currentRoute.id);
    console.log(photos);
    photosNames = []
    photos.forEach(p => {
        if(!p.isLocal)
        {
            photosNames.push(p.name);
        }
    });
    data.append('photos', JSON.stringify(photosNames));

    for (var i = 0; i < loadedPhotos.length; i++) {
        data.append('files[]', loadedPhotos[i]);
    }
    data.append('points', JSON.stringify(mapRoute.model.getReferencePoints()))
    // Если пользователь загрузил новое фото, то записываем в тело запроса ещё и фото
    
    /*if (loadedPhoto)
    {
        data.append('loadedPhotos', loadedPhotos);
    }*/
    let response = await fetch('/saveRouteChanges', {
        method: 'POST',    
        body: data
    })
}

function onChangeElementClick(event){
    pageHelper.buildRouteOnMap(event.currentTarget.points);    
    changesMode = true;
}


// Получение маршрута по его id
async function getRoute(id){
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
}


async function saveRoute(route){
    let data = JSON.stringify({ 
        route:route })
    var url = '/saveRoute'
    let response = await fetch(url, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        method: 'POST',
        body: data
    });
    var result = await response.text();
    const parsedResult = JSON.parse(result)
    var name = parsedResult.name;
    return name
}

// Это хуыня для вкладок(основное, комментарии, фотографии), спизженная из интернета.
function showTabContent(evt, tabContent){
    if (changesMode){
        pageHelper.buildRouteOnMap(JSON.parse(currentRoute.points));
        changesMode = false;
    }
    if(tabContent=='changes'){
        showRouteChanges();
    }
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabContent).style.display = "block";
  evt.currentTarget.className += " active";
}