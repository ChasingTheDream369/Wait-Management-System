from flask import Blueprint
from flask import  jsonify, request,session
from models import *
import os
import uuid
from macros import *
bp = Blueprint('manager_image',__name__,)

'''
   Manger upload image for item / restaurants, check if img file type match or not,
   use uuid generate random name for it and download it to image folder

        Route : /image

        Method : POST
            file : file (Image file itself)


        Returns:
            Example:
                {
                    "img_url":"http://127.0.0.1:5000/image?image=1.jpg"
                }
'''

@bp.route('/image', methods=['POST'])
def upload_image():
    # check session
    staff_id = session.get('staff_id')
    staff_role = session.get('role')
    if not staff_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not staff_role:
        return jsonify({'code': 400, 'message': "invalid params"})
    # only manager has access to see information
    if staff_role != "manager":
        return jsonify({'code': 404, 'message': "this staff is not manager"}) 
        
    file = request.files['file']
    img_url = ''
    if file and allowed_file(file.filename):
        file_name_suffix = file.filename.rsplit('.', 1)[-1]
        file_name = str(uuid.uuid4()) + '.' + file_name_suffix
        file_path = os.path.join(basedir, IMAGE_FOLDER)
        file.save(os.path.join(file_path, file_name))
        img_url = f'http://127.0.0.1:5000/image?image={file_name}'
        return jsonify({'img_url': img_url})
    else:
        return jsonify({'code': 404, 'message': "Img not exist or type not match."})

###################################################################################################
#                                  HELPER FUNCTIONS                                               #
###################################################################################################

# Check whether the filebane is in the allowed extensions.
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[-1] in ALLOWED_EXTENSIONS
