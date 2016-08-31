import os
import re
import inspect  

from celery import Celery
from logbook import Logger
from usefutils import free_path

# Python 2/3 compatibility
from builtins import str
from six.moves.urllib.parse import urljoin

logger = Logger('PARSER') # Required in utils

from ..sessions import set_status, set_result 
from .utils import page_html, download_image, with_http
from .parsers import parse_title_text, parse_first_h1_text, \
                     parse_first_img_src

IMG_SAVE_DIR = 'app/static'

celery = Celery('tasks', backend='amqp', broker='amqp://')


@celery.task
def parse_page(url, out_box):
    '''
      Parsed webpage: 
        1. Title
        2. First h1 tags content
        3. First image

      Parsing results stores through `session.set_status` and 
      `sessions.set_result` methods.

      Parameters
      ----------
      url      <str>  URL to be parsed
      out_box  <str>  Storage key for store status and results
    '''

    url = with_http(url)

    assert isinstance(url,     str)
    assert isinstance(out_box, str)
    assert url.startswith('http')

    def step_status(status):
        progress = int(100 * (step_status.curr_calls / step_status.total_calls))
        set_status(out_box, progress, status)
        
        step_status.curr_calls += 1

    step_status.curr_calls = 0;
    step_status.total_calls = len(re.findall('step_status *\(', inspect.getsource(parse_page))) - 1 

    html    = page_html(url);            step_status('Page content downloaded')
    title   = parse_title_text(html);    step_status('Title parsed')
    h1      = parse_first_h1_text(html); step_status('First H1 parsed')
    img_src = parse_first_img_src(html); step_status('First image parsed')

    if img_src is not None: 
        if not img_src.startswith('http'):
            logger.debug('Used urljoin for static resource: {!r}'.format(img_src))
            img_src = urljoin(url, img_src)

        img = download_image(img_src); step_status('Image downloaded')

        save_path = free_path(IMG_SAVE_DIR, ext='.png')
        img.save(save_path)

        img_src = '/static/' + os.path.relpath(save_path, IMG_SAVE_DIR)

    if h1 is None: 
        h1 = 'Not found'

    if title is None: 
        title = 'Not found'

    set_result(out_box, title, h1, img_src)