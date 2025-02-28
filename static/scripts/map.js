var myMap; // Переменная для хранения созданной карты 

// ----Элементы из html----
var routeNameText; // Ссылка на элемент текста названия маршрута,...
var routeDescriptionText; //... описания маршрута
var routeRatingText; //... рейтинга маршрута
var profileNameText; // элемент текста имени пользователя
var commentField; // элемент поля ввода комментария
var routeList;
var commentsList;
var changesList;
var changesMode;
var pathCoords;

var photos = [];
var currentPhotoId;

var publicRoutes;// переменная для хранения всех публичных маршрутов

var localUser; // переменная для хранения вошедшего пользователя

var currentRoute;
var currentRouteId = -1;
var mapRoute;
ymaps.ready(init);

async function init(){
    routeNameText = document.getElementById("routeName");
    routeDescriptionText = document.getElementById("routeDescription");
    routeRatingText = document.getElementById("routeRating");
    profileNameText = document.getElementById('profileName');
    commentField = document.getElementById('commentField');
    routeList = document.getElementsByClassName('routeList')[0];
    commentsList = document.getElementsByClassName('commentsList')[0];
    photosList = document.getElementsByClassName('photosList')[0];
    
    localUser = await pageHelper.getLocalUserInfo();

    pageHelper.initProfileName();

    // Создание карты.
    myMap = new ymaps.Map("map", {
        center: [55.404039, 43.830671],     
        zoom: 7
    }), objectManager = new ymaps.ObjectManager();
    myMap.geoObjects.add(objectManager);
    

    var publicRoutes = await getPublicRoutes();
    publicRoutes.forEach(route => {
        let btn = document.createElement('button');
        btn.routeId = route.id
        btn.addEventListener('click', onRouteButtonClick)
        btn.innerText = route.name
        routeList.appendChild(btn)
    });
    pageHelper.showRouteInfo(publicRoutes[0])

    /*
    var referencePoints;
    referencePoints = ['kolosunin.jpg', 'test.jpg']
    
    console.log(JSON.stringify(referencePoints))*/
    //saveRoute()
}


function onRouteButtonClick(event){
    pageHelper.showRouteInfoById(event.currentTarget.routeId);
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

async function getPublicRoutes(){
    var url = '/getPublicRoutes'
    let response = await fetch(url, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        method: 'GET',
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

async function importObjects(){
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
}



// Это хуыня для вкладок(основное, комментарии, фотографии), спизженная из интернета.
function showTabContent(evt, tabContent){
    if (changesMode){
        buildRouteOnMap(JSON.parse(route.points));
        changesMode = false;
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


//Оставлю на всякий пока что
// Убираем лишнюю хуйню с osm
function remove_bs(json){
    bs = []    
    shitlist = ['building', 'highway', 'natural', 'bus', 'entrance', 'route', 'barrier']
    for (let i = json.features.length - 1; i > -1; i--) {
        var f = json.features[i];
        shitlist.forEach(s => {
            if (f.properties[s] != null){
                bs.push(s);
            }
        })
    }

    bs.forEach(b => {
        json.features.splice(b, 1);
    });

    return json;
}