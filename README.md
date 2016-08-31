# test-parser


## Install

1. `virtualenv -p python3 venv && ./venv/bin/pip3 install -r requirements.txt`
2. `cd app/frontend && npm install && gulp build`


## Run  

1. `python3 manage.py runserver`
2. `celery -A app/parser worker`
