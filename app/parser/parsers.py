import lxml.html
from functools import wraps

# Python 2/3 compatibility
from builtins import str

from .utils import xpath_str_or_none

def __parser(f):
    @wraps(f)
    def wrapper(html): 
        assert isinstance(html, lxml.html.HtmlElement)
        return f(html)
    return wrapper

parse_title_text    = __parser(lambda html: xpath_str_or_none(html, 'string(//title)'   ))
parse_first_h1_text = __parser(lambda html: xpath_str_or_none(html, 'string(//h1)'      )) 
parse_first_img_src = __parser(lambda html: xpath_str_or_none(html, 'string(//img/@src)'))
