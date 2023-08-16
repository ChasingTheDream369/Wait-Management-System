import os
from flask import Blueprint
from flask import jsonify, request,make_response
from models import *
from flask_cors import cross_origin
from macros import *
bp = Blueprint('customer_image',__name__,)


'''
    
    We first check if the image url has the '.' in it and if the count of '.'
    is greater than 1 then it is an invalid url and if the image is not in the 
    allowed extensions of being a jpg, png or gif then we again retrun a 404 and
    then we read the image data by finding the image by its id in the backend and 
    once we find it out we return the response back to the frontend and if we are
    not able to find it we send a 404.
            
            Route: /image
            
            Methods : GET
                
                id : integer (image id) 
                
            Returns:
            
                Example:
                    Image data returned if the image is at the backend.
                    If not then a 404 error message is given telling that no image found.
                    
'''
@bp.route('/image', methods=['GET'])
@cross_origin()
def image():
    # check if given input are valid or not
    data = request.args.get('image')
    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})
    if '.' not in data:
        return jsonify({'code': 400, 'message': "invalid params"})
    if data.count('.') > 1:
        return jsonify({'code': 400, 'message': "invalid params"})
    if data.split(".")[1] not in ALLOWED_EXTENSIONS:
        return jsonify({'code': 400, 'message': "invalid params"})
    # read the image and return it back to front-end
    file_dir = os.path.join(basedir, IMAGE_FOLDER)
    try:
        image_data = open(os.path.join(file_dir, '%s' % data), "rb").read()
        response = make_response(image_data)
        return response
    except:
        return jsonify({'code': 404, 'message': "no image found"})
