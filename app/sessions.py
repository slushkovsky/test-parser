import json
import random
import string
from redis import StrictRedis

redis = StrictRedis()


def set_status(box, progress, status, extra_info={}):
    '''
      Updates parsing status.

      Parameters
      ----------
      box        <str>   Key for store status
      progress   <int>   Current parsing progress (in percents)
      status     <str>   Current status description (message)
      exta_info  <dict>  Any additional status information
    '''

    assert isinstance(box,        str )
    assert isinstance(progress,   int )
    assert isinstance(status,     str )
    assert isinstance(extra_info, dict)

    info = {
        'progress': '{}%'.format(progress),
        'status': status,
        'finished': progress == 100
    }

    info.update(extra_info)

    redis.set(box, json.dumps(info))

def set_result(box, title, h1, img):
    '''
      Updates parsing status with results. 

      Parameters
      ----------
      box    <str>  Key for store status
      title  <str>  Parsed content of a title on a webpage
      h1     <str>  Parsed content of the first h1 tag on a webpage
      img    <str>  Path to a static clone of a first image on a webpage  
    '''

    assert isinstance(title, str)
    assert isinstance(h1,    str)
    assert isinstance(img,   str)

    set_status(box, progress=100, status='Finished', extra_info={
        'result': {
            'title': title,
            'h1': h1,
            'img': img
        }
    })

def gen_session_key(key_len=16):
    '''
      Session key generator.

      Paremeters
      ----------
      key_len  <int|16>  Length of the generated key
    '''

    assert isinstance(key_len, int)

    while True: 
        key = ''.join([random.choice(string.hexdigits) for _ in range(key_len)])
            
        if not redis.get(key): 
            return key


def create_box(session_key, url): 
    '''
      Generates redis key to store URL parsing results and writes 
      initiall status.

      Parameters
      ----------
      session_key  <str>  Key of the session that contains this parsing
      url          <str>  URL for parse

      Return: <str>
    '''

    assert isinstance(session_key, str)
    assert isinstance(url, str)

    key = session_key + url.replace('https', 'http').replace('http://', '')

    set_status(key, 0, 'Started')

    return key

def set_session_boxes(session_key, boxes): 
    '''
      Saves info about session URL's and thair output keys

      Parameters
      ----------
      session_key  <str>   Key of the session 
      boxes        <dict>  Dictionary with `url:out_key` records
    '''

    assert isinstance(session_key, str )
    assert isinstance(boxes,       dict)
    assert all([isinstance(k, str) and isinstance(v, str) 
        for k, v in boxes.items()])

    redis.set(session_key, json.dumps(boxes)) 

def get_session_boxes(session_key): 
    '''
      Loads information about session parsers and thair output boxes

      Parameters
      ----------
      session_key  <str>  Key of the session 

      Return: <dict> with `url:out_key` records 
    '''

    assert isinstance(session_key, str)

    return json.loads(redis.get(session_key).decode())

def get_session_statuses(session_key): 
    '''
      Loads all session parsings statuses. 

      Parameters
      ----------
      session_key  <str>  Key of the session 

      Return: <dict> with records `url:dict`
    '''

    assert isinstance(session_key, str)

    boxes = get_session_boxes(session_key)

    return {url: json.loads(redis.get(key).decode()) 
        for url, key in boxes.items()}