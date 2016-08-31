import json
import datetime
from logbook import Logger
from flask import request, render_template as render

from . import app
from .sessions import gen_session_key, create_box, \
                      set_session_boxes, get_session_statuses
from .parser import parse_page

logger = Logger('SERVER')


@app.route('/', methods=['GET'])
def page():  
    return render('parser.html')

@app.route('/parse', methods=['POST'])
def parse():  
    request_data = json.loads(request.get_data().decode())
    urls = set(request_data['url[]'])

    if request_data['begin_at'] != 'None':
        begin_at = datetime.datetime.strptime(request_data['begin_at'],
                                              '%m/%d/%Y %I:%M %p')

        if (datetime.datetime.now() > begin_at): 
            logger.warning('Parsing begining time is in the past (skiped)')
            return ('Parsing begining time is in the past', 416)

        delay = (begin_at - datetime.datetime.now()).seconds

        logger.debug('Recieved async task (delay = {} s)'.format(delay))
    else: 
        logger.debug('Recieved sync task')
        delay = 0

    if len(request_data['url[]']) < len(urls): 
        pass # TODO: Flash

    session_key = gen_session_key()
    boxes = {}

    for url in urls: 
        boxes[url] = create_box(session_key, url)
        parse_page.apply_async(args=[url, boxes[url]], countdown=delay)

    set_session_boxes(session_key, boxes)

    return json.dumps({
        'session': session_key
    })

@app.route('/status/<session_key>', methods=['GET'])
def session(session_key): 
    return json.dumps(get_session_statuses(session_key))

@app.route('/static/<file>')
def root(file):
    return app.send_static_file(file)