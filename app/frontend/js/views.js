/*  Initialise and show a view 
 *
 *    Parameters
 *  ----------
 *  name  <String>  View name
 */ 

function selectView(name, initArgs) {
    var viewElement = $('#view-' + name);
    var initFunc = {
        'inputs': initInputsView, 
        'progress': initProgressView 
    }[name];

    if (initArgs === undefined) 
        initArgs = {}

    if (initFunc === undefined) {
        console.error('Unknown view: ' + name);
        return;
    }
    else if (viewElement.length == 0) {
        console.error('Couldn\'t find view \'' + name + '\' DOM element');
        return;
    }

    initFunc(initArgs);

    $('[id|="view"]').hide();
    $('#view-' + name).show();
}