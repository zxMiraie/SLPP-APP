# SLPP App

## Installation
There are two folders inside the slppwebapp directory - the backend Django APP and the frontend Vite + React.
Please ensure you install all the dependencies before running this project. A venv is recommended for Django!


## Technologies Used
For this Project the following technologies/frameworks/Libraries were used:
- Python 3.12
- Node.Js 20.x (20.15)
- Tailwind CCS
- JS-Cookies
- PyJWT
- djangorestframework
- django-cors-headers

## Running the App
To run the app simply (details below):
- Start the backend 
- Host the frontend
- Go to http://127.0.0.1:5173

## Django- Backend Setup
Please navigate to the Backend Directory and install the requirements for the app.

By default, the server runs at http://127.0.0.1:8000

```bash
cd backend
```
create a venv if you would like and activate it
```bash
python -m venv venv
```
Install the requirements
```bash
pip install -r requirements.txt
```
Run the Django Server
```bash
python manage.py runserver
```

The BioIDs are hard coded in - they are in settings.py - the threshold is also there.
If you would like to start the app from scratch without my data, you can delete the db.sqlite file and all files inside ./application/migrations/
(Do not delete the init file)
If you do perform this - please make sure to:

Run Migrations ...
```bash
python manage.py makemigrations
```
```bash
python manage.py migrate
```
to ensure that the app works properly after the wipe.

To add the Petition committee after a wipe you can use the shell to add a new user:

```bash
python manage.py shell
```
and run the following command:

```
from application.models import User

committee = User.objects.create_user(
    username="admin@petition.parliament.sr",
    email="admin@petition.parliament.sr",
    password="2025%shangrila",
    date_of_birth="1970-01-01",
    role="committee"
)
```
(Django ensures that the password is hashed once inputted.)


# Vite + React Frontend

Please navigate to the frontend folder
```bash
cd frontend
```
and install dependencies
```bash
npm install
```
You can start the dev server
```bash
npm run dev
```
or you can build the server and preview the files
```bash
npm run build
```
```bash
npm run preview
```
in case the Django server is on a different ip/port - please edit the .env files in the front end.

By default Vite runs on http://127.0.0.1:5173