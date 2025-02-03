import os
import random
import sqlite3
import string
from flask import Flask, json, redirect, render_template, request, session
from PIL import Image
#from werkzeusg.utils import secure_filename

PROFILEPICS_FOLDER = 'static\\images\\profilePics'

app = Flask(__name__)
app.config['PROFILEPICS_FOLDER'] = PROFILEPICS_FOLDER
app.config['account_url'] = 'static\\account\\'
app.config['profilePicsPath'] = 'static\\images\\profilePics\\'

app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

#-------------------------------
def makeError(errorString):
    data = { 
        "error" : errorString
    } 
    return data

@app.route('/getLocalUser', methods=['GET'])
def getLocalUser():
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()
    cursor.execute('SELECT * FROM users WHERE id=?', [session['user_id']])

    user = cursor.fetchone()
    userDict = {
        'id':user[0],
        'email':user[1],
        'username':user[3],
        'picname':user[4],
        'admin':user[5]
    }
    
    connection.close()
    return json.dumps(userDict)

#------------------------------

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        jsonData = request.get_json()
        
        password = jsonData['password']
        email = jsonData['email']
        
        connection = sqlite3.connect('database.db')

        cursor = connection.cursor()
        user = (email, password)
        
        cursor.execute('SELECT EXISTS(SELECT 1 FROM users WHERE email=? AND password=?)', user)
        isUserExists = cursor.fetchone() == (1,)

        if not isUserExists:
            return makeError("Неправильные эл.почта или пароль")
        
        cursor.execute('SELECT id FROM users WHERE email=? AND password=?', user)
        id = str(cursor.fetchone()[0])

        session['user_id'] = id
        resp = redirect("/profile")
        resp.set_cookie('user_id', id)
        return resp 

    return render_template("login.html")

@app.route('/signup',  methods=['GET', 'POST'])
def signUp():
    if request.method == 'POST':
        jsonData = request.get_json()
        
        email = jsonData['email']
        password = jsonData['password']
        username = jsonData['username']
        
        connection = sqlite3.connect('database.db')
        cursor = connection.cursor()

        user = (email, password, username)
        
        if not(email and password and username):
            return makeError("Введены не все данные")
        
        if '@' not in email or email[0] == '@':
            return makeError('Неправильный адрес электронной почты')
        
        if len(password) < 8:
            return makeError("Пароль слишком короткий")

        cursor.execute('SELECT EXISTS(SELECT 1 FROM users WHERE email=?)', [email])
        isExists = cursor.fetchone() == (1,)

        if isExists:
            return makeError("Пользователь уже существует")    
    
        cursor.execute('INSERT INTO users (email, password, username) VALUES (?, ?, ?)', user)
        
        connection.commit()
        
        user_id = str(cursor.lastrowid)
        print(user_id)
        resp = redirect("/")
        resp.set_cookie('user_id', user_id)
        session['user_id'] = user_id

        connection.close()

        return resp
    return render_template("/signup.html")

#-----Страница профиля-----
#Проверяется, вошёл ли пользователь в аккаунт. Если не вошёл, то выводится страница с предложением войти в аккаунт
@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'user_id' in session:
        return render_template("/profile.html")
    else:
        return render_template("/notLoggedIn.html")

@app.route('/editProfile', methods=['GET', 'POST'])
def editProfile():
    if 'user_id' in session:
        return render_template("/editProfile.html")
    else: 
        return render_template("/notLoggedIn.html")      


@app.route('/profile/saveProfileChanges', methods=['POST'])
def saveProfileChanges():
    if request.method == 'POST':        
        newUsername = request.form['username']  
        connection = sqlite3.connect('database.db')
        cursor = connection.cursor()
        cursor.execute('UPDATE users SET username = ? WHERE id = ?', (newUsername, session['user_id']))
        
        if 'photo' in request.files:
            photo = request.files['photo']
            filename = id_generator() + '.jpg'
            photo.save(app.config['profilePicsPath'] + os.path.join(filename))

            img = Image.open(app.config['profilePicsPath'] + filename) 
            img = img.resize((164, 164))
            img.save(app.config['profilePicsPath'] + os.path.join(filename), format='JPEG')

            cursor.execute('UPDATE users SET picpath = ? WHERE id = ?', (newUsername, session['user_id']))

        connection.commit()
        connection.close() 
        return 'ok'
    

@app.route('/map')
def showmap():
    return render_template("/map.html")


@app.route('/saveRoute/', methods=['GET', 'POST'])
def saveRoute():
    if request.method == 'POST':
        jsonData = request.get_json()
        connection = sqlite3.connect('database.db')

        cursor = connection.cursor()
        
        points = jsonData['route']
        print(points)
        user = (1, str(jsonData))

        cursor.execute('INSERT INTO routes (creator_id, points) VALUES (?, ?)', user)
        connection.commit()
        connection.close()
        return 'ok'

@app.route('/getPublicRoutes/', methods=['GET'])
def getPublicRoutes():
    connection = sqlite3.connect('database.db')

    cursor = connection.cursor()

    cursor.execute('SELECT * FROM routes WHERE public=1')
    routes = cursor.fetchall()
    print(routes)
    return routes

@app.route('/getRoute/', methods=['GET', 'POST'])
def getRoute():
    if request.method == 'POST':
        connection = sqlite3.connect('database.db')

        cursor = connection.cursor()

        cursor.execute('SELECT points FROM routes WHERE creator_id=1')
        points = cursor.fetchone()[0]
        return points
    
@app.route('/getUserInfoByID', methods=['POST'])
def getUserInfoByID():
    
    user = getLocalUser()
    
    data = { 
        "username" : 'j', 
        "picpath": user.picpath
    } 
    return getLocalUser()

def id_generator(size=32, chars=string.ascii_letters + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))                
                    
app.run("0.0.0.0", debug=True)