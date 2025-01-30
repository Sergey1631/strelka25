import os
import random
import sqlite3
import string
from flask import Flask, redirect, render_template, request, session
from PIL import Image
#from werkzeusg.utils import secure_filename

UPLOAD_FOLDER = 'static\\images\\profilePics'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['account_url'] = 'static\\account\\'
app.config['profilePicsPath'] = 'static\\images\\profilePics\\'

app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        jsonData = request.get_json()
        
        password = jsonData['password']
        accountname = jsonData['accountname']
        
        connection = sqlite3.connect('database.db')

        cursor = connection.cursor()
        user = (accountname, password)
        
        cursor.execute('SELECT EXISTS(SELECT 1 FROM users WHERE accountname=? AND password=?)', user)
        isExists = cursor.fetchone() == (1,)

        connection.commit()
        connection.close()

        errorString = ""

        if isExists:
            resp = redirect("/profile")
            resp.set_cookie('accountname', accountname)

            session['accountname'] = accountname
            print(session['accountname'])
            return resp 
        else:
            data = { 
                "error" : errorString, 
            } 
            return data
    return render_template("index.html")

@app.route('/signup',  methods=['GET', 'POST'])
def signUp():
    if request.method == 'POST':
        jsonData = request.get_json()
        
        email = jsonData['email']
        password = jsonData['password']
        accountname = jsonData['accountname']
        username = jsonData['username']
        
        errorString = ""
        
        connection = sqlite3.connect('database.db')

        cursor = connection.cursor()

        user = (email, password, username)
        
        cursor.execute('SELECT EXISTS(SELECT 1 FROM users WHERE email=?)', [email])
        isExists = cursor.fetchone() == (1,)

        if isExists:
            errorString = "UserExists"
        else:     
            cursor.execute('INSERT INTO users (email, password, username) VALUES (?, ?, ?)', user)
        
        connection.commit()
        connection.close()

        if errorString:
            data = { 
                "error" : errorString, 
            } 
            return data
        else:
            resp = redirect("/")
            #resp.set_cookie('accountname', accountname)
            session['accountname'] = accountname
            print(session['accountname'])
            return resp
    return render_template("signup/index.html")

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    return render_template("/profile.html")

@app.route('/account/<operation>', methods=['GET', 'POST'])
def accountOperation(operation):
    if request.method == 'POST':
        if operation == "getUsernameByAccountname":
            jsonData = request.get_json()
            accountname = jsonData['accountname']
            connection = sqlite3.connect('database.db')

            cursor = connection.cursor()

            cursor.execute('SELECT username FROM users WHERE accountname=?', [accountname])
            name = cursor.fetchone()
            connection.close()
            
            data = { 
                "name" : name, 
            } 
            return data
        
        if operation == "editPhoto":
            if 'file' in request.files:
                photo = request.files['file']
                accountname = request.form['accountname']
                filename = id_generator() + '.jpg'
                connection = sqlite3.connect('database.db')

                cursor = connection.cursor()

                cursor.execute('UPDATE users SET picName = ? WHERE accountname = ?', (filename, accountname))

                connection.commit()
                connection.close()

                photo.save(app.config['profilePicsPath'] + os.path.join(filename))

                img = Image.open(app.config['profilePicsPath'] + filename) 
                img = img.resize((164, 164))
                img.save(app.config['profilePicsPath'] + os.path.join(filename), format='JPEG')

                return filename

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
    
@app.route('/getRoute/', methods=['GET', 'POST'])
def getRoute():
    if request.method == 'POST':
        connection = sqlite3.connect('database.db')

        cursor = connection.cursor()

        cursor.execute('SELECT points FROM routes WHERE creator_id=1')
        points = cursor.fetchone()[0]
        return points

def id_generator(size=32, chars=string.ascii_letters + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))                
                    
app.run("0.0.0.0", debug=True)