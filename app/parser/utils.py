import os

import requests
import lxml.html
from PIL import Image

# Python 2/3 compatibility
from builtins import str
import six

from . import logger


def with_http(url):
    '''
      Insurres that url has 'http://' prefix (added if it was missed).

      Parameters
      ----------
      url  <str>  URL

      Return: <str>
    '''

    assert isinstance(url, str) 

    if not url.startswith('http'):
        logger.debug('Used \'http://\' autocompletion')
        return 'http://' + url

    return url


def page_html(url):
    ''' 
      Gets the HTML content of the webpage

      Parameters
      ----------
      url  <str>  Webpage URL 
    '''

    url = with_http(url)

    assert isinstance(url, str) 
    assert url.startswith('http')

    page = requests.get(url).text

    return lxml.html.fromstring(page)


def xpath_str_or_none(html, xpath): 
    ''' 
      XPath pstprocessor. Converts result to str. 
      If convertion result is empty string - will be returned None.

      Parameters
      ----------
      html   <lxml.html.HtmlElement>  Webpage content
      xpath  <str>                    XPath (must returns the value, not list)

      Return: <str> or None
    '''

    assert isinstance(html, lxml.html.HtmlElement)
    assert isinstance(xpath, str) 

    result = str(html.xpath(xpath))

    return result if len(result) != 0 else None


def download_image(url): 
    '''
      Downloads image from the web. 

      Parameters
      ----------
      url  <str>  Image url

      Return: PIL.Image
    '''

    assert isinstance(url, str)

    response = requests.get(url)

    # TODO: Check HTTP code

    return Image.open(six.BytesIO(response.content))