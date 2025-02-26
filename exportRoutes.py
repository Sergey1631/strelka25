import json
import os
import gpxpy
import gpxpy.gpx
import simplekml 

def export_gpx(id, points, name, desc):
    #print(route)
    gpx = gpxpy.gpx.GPX()
    gpx_route = gpxpy.gpx.GPXRoute()
    gpx.routes.append(gpx_route)

    gpx_track = gpxpy.gpx.GPXTrack()
    gpx.tracks.append(gpx_track)

    gpx_segment = gpxpy.gpx.GPXTrackSegment()
    gpx_track.segments.append(gpx_segment)

    gpx_route.name = name
    gpx_route.description = desc
    for p in points:
        gpx_route.points.append(gpxpy.gpx.GPXRoutePoint(p[0], p[1]))
        
        #gpx_segment.points.append(gpxpy.gpx.GPXTrackPoint(p[0], p[1], elevation=1234))
    

    localPath = os.path.dirname(os.path.realpath(__file__))
    fileName = "route_" + str(id) + ".gpx"

    with open(localPath + "/static/exports/gpx/" + fileName, "w") as f:
        f.write(gpx.to_xml())
    return fileName

def export_kml(id, points, name, desc):
    return simplekml_export(points, id, 'kml', name, desc)

def export_kmz(id, points, name, desc):
    return simplekml_export(points, id, 'kmz', name, desc)
    
    

def simplekml_export(points, id, type, name, desc):
    kml = simplekml.Kml()
    ls = kml.newlinestring(name='Маршрут') 
    kml.document.name = name
    kml.document.description = desc
    for p in points:
        coord = [p[1], p[0], 10.0]
        ls.coords.addcoordinates([coord])

    ls.style.linestyle.width = 5
    ls.style.linestyle.color = simplekml.Color.blue
    ls.extrude = 1
    startPoint = points[0]
    endPoint = points[len(points) - 1]
    ls.altitudemode = simplekml.AltitudeMode.relativetoground
    kml.newpoint(name="Начало маршрута",
                   coords=[[startPoint[1], startPoint[0]]])
    kml.newpoint(name="Конец маршрута",
                   coords=[[endPoint[1], endPoint[0]]])
    
    localPath = os.path.dirname(os.path.realpath(__file__))
    fileName = "route_" + str(id) + "." + type

    if type == 'kml':
        kml.save(localPath + "/static/exports/kml/" + fileName)
    else:
        kml.savekmz(localPath + "/static/exports/kmz/" + fileName)
    return fileName