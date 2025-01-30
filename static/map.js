ymaps.ready(init);
async function init(){
    // Создание карты.
    var myMap = new ymaps.Map("map", {
        // Координаты центра карты.
        // Порядок по умолчанию: «широта, долгота».
        // Чтобы не определять координаты центра карты вручную,
        // воспользуйтесь инструментом Определение координат.
        center: [55.76, 37.64],
        // Уровень масштабирования. Допустимые значения:
        // от 0 (весь мир) до 19.
        zoom: 7
    });

    
    var url = '/getRoute'
    let response = await fetch(url, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        method: 'POST',
    });
    var result = await response.text();
    const parsedResult = JSON.parse(result)
    console.log(parsedResult)

    var multiRoute = new ymaps.multiRouter.MultiRoute({   
        referencePoints: parsedResult
    }, {
        boundsAutoApply: true
    });

    myMap.geoObjects.add(multiRoute);

    var referencePoints;
    referencePoints = [
        [55.76, 37.64],
        [55.73, 37.6]
    ]
    //console.log(JSON.stringify(referencePoints))
    //saveRoute()
}

async function getRoute(id){
    
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