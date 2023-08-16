import random
from flask import Blueprint
from flask import  jsonify, request,session
from exts import db
from models import *
import hashlib
import base64
from Crypto.Cipher import PKCS1_v1_5
from Crypto import Random
from Crypto.PublicKey import RSA
from sqlalchemy import text
from macros import *
bp = Blueprint('manager_staff',__name__,)

'''
   Get all of the staff for given restaurant including waiter staff, kitchen staff and manager

        Route : /allStaff

        Method : GET
            r_id : int (Category id) 

        
        Returns:
            Example:
                {
                    "code":200

                }
'''

# get all staff information for given restaurant
@bp.route('/allStaff', methods=['GET'])
def get_staffs():
    restaurant_id = request.args.get('r_id',type=int)
    if not restaurant_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not Restaurant.query.filter_by(id=restaurant_id).first():
        return jsonify({'code': 404, 'message': "restaurant id does not exist"}) 

    staffs = Staff.query.filter_by(r_id=restaurant_id,login_permission=True).all()
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

    if Staff.query.filter_by(id=staff_id).first().r_id != restaurant_id:
        return jsonify({'code': 404, 'message': "this manager is not belong to given restaurant"}) 

    all_staffs = []
    # get all staff detail for restaurant
    for staff in staffs:
        if staff.id != staff_id:
            all_staffs.append({'id': staff.id, 'name': staff.user_name, 'role': staff.role})

    return jsonify({'code': 200, 'data': all_staffs})


'''
   Given new staff account information, check if they are valid
   if valid then use private_key to decode password and use MD5 encryption 
   to encode staff password with random salt ,then add a staff record in database

        Route : /addStaff

        Method : POST
            name : str (Staff username)
            password : str (Encoded staff password)
            role : str (Waiter / Kitchen / Manger)
        
        Returns:
            Example:
                {
                    "code": 200,
                    "data": {
                        "id": 23,
                        "name": "asdas",
                        "role": "sadas"
                    }
                }
'''

# manager has access to ad some staffs
@bp.route('/addStaff', methods = ['POST'])
def add_staff():
    data = request.get_json()
    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'name' not in list(data.keys()) or not data['name']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'password' not in list(data.keys()) or not data['password']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'role' not in list(data.keys()) or not data['role']:
        return jsonify({'code': 400, 'message': "invalid params"})
    # decrypted the password from front-end
    pass_decrypted = decryption(data['password'], bytes(private_key,'utf-8')) 
    if len(pass_decrypted) < 8:
        return jsonify({'code': 404, 'message': "password length is less than 8"})
    if not any(character in pass_decrypted for character in DIGITS_CHARACTERS):
        return jsonify({'code': 404, 'message': "password should contain at least one digit"})
    if not any(character in pass_decrypted for character in UPPERCASE_CHARACTERS):
        return jsonify({'code': 404, 'message': "password should contain at least one uppercase alphabet"})
    if not any(character in pass_decrypted for character in LOWERCASE_CHARACTERS):
        return jsonify({'code': 404, 'message': "password should contain at least one lowercase alphabet"})
    if not any(character in pass_decrypted for character in special_characters):
        return jsonify({'code': 404, 'message': "password should contain at least one special character"})

    # not allow add staff when some customer using 
    if len(Table.query.filter(Table.r_id == data['r_id']).all()) != len(Table.query.filter(Table.r_id == data['r_id'],Table.status == EMPTY).all()):
        return jsonify({'code': 404, 'message': "some customer is in your restaurant now, you could add this staff when restaurant is free"})
    # not allow add staff when some customer queuing
    if len(Queue.query.filter(Queue.r_id == data['r_id']).all()) != 0:
        return jsonify({'code': 404, 'message': "some customer is queuing for tables now, you could add this staff when restaurant is free"})

    # random salt
    salt = create_salt(4)
    # md5 encrypted with salt
    received_password = hash_password(pass_decrypted, salt)

    staff_id = session.get('staff_id')
    staff_role = session.get('role')
    # check session
    if not staff_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not staff_role:
        return jsonify({'code': 400, 'message': "invalid params"})

    if staff_role != "manager":
        return jsonify({'code': 404, 'message': "this staff is not manager"}) 

    # check if username has already exist or not
    sql = "select * from staff where binary user_name =:para"
    if db.session.execute(text(sql),{'para':data['name']}).fetchone() :
        return jsonify({'code': 404, 'message': "this username has alerady registed, "})

    # add new staff information to staff table in database
    staff = Staff(user_name=data['name'], password=received_password, role=data['role'],salt=salt,r_id=data['r_id'])
    db.session.add(staff)
    db.session.commit()

    return jsonify({'code': 200, 'data': {'id': staff.id, 'name': staff.user_name, 'role': staff.role}})

'''
   delete given staff in database, set their valid_staff to be FALSE

        Route : /deleteStaff

        Method : POST
            staff_id : int (Staff id)
        
        
        Returns:
            Example:
                {
                    'code': 200
                }
'''

# manager has access to change staff login status
@bp.route('/deleteStaff', methods = ['POST'])
def delete_staff():
    data = request.get_json()
    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'staff_id' not in list(data.keys()) or not data['staff_id']:
        return jsonify({'code': 400, 'message': "invalid params"})
    
    staff_id = session.get('staff_id')
    staff_role = session.get('role')
    # check session
    if not staff_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not staff_role:
        return jsonify({'code': 400, 'message': "invalid params"})

    if staff_role != "manager":
        return jsonify({'code': 404, 'message': "this staff is not manager"}) 
    # check session's restaurant is the same as given staff's restaurant
    if Staff.query.filter_by(id=staff_id).first().r_id != Staff.query.filter_by(id=data['staff_id']).first().r_id:
        return jsonify({'code': 404, 'message': "this manager is not belong to given restaurant"}) 

    r_id = Staff.query.filter_by(id=staff_id).first().r_id

    # not allow add staff when some customer using 
    if len(Table.query.filter(Table.r_id == r_id).all()) != len(Table.query.filter(Table.r_id == r_id,Table.status == EMPTY).all()):
        return jsonify({'code': 404, 'message': "some customer is in your restaurant now, you could delete this staff when restaurant is free"})
    # not allow add staff when some customer queuing
    if len(Queue.query.filter(Queue.r_id == r_id).all()) != 0:
        return jsonify({'code': 404, 'message': "some customer is queuing for tables now, you could detele this staff when restaurant is free"})
        
    # update staff login status to false
    Staff.query.filter_by(id=data['staff_id']).update({"login_permission":False})
    db.session.commit()
    return jsonify({'code': 200})

###################################################################################################
#                                  HELPER FUNCTIONS                                               #
###################################################################################################

# decrypted the password from front-end
def decryption(text_encrypted_base64: str, private_key: bytes): 
    text_encrypted_base64 = text_encrypted_base64.encode('utf-8')
    text_encrypted = base64.b64decode(text_encrypted_base64)
    cipher_private = PKCS1_v1_5.new(RSA.importKey(private_key))
    text_decrypted = cipher_private.decrypt(text_encrypted, Random.new().read)
    text_decrypted = text_decrypted.decode()
    return text_decrypted


# md5 encrypted the password with salt
def hash_password(password, salt):
    hash = hashlib.md5()
    hash.update((password + salt).encode("utf-8"))
    return hash.hexdigest()

# formed salt randomly
def create_salt(length = 4):

    salt = ''
    chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789'

    len_chars = len(chars) - 1
    i = 0
    for i in range(length):
        salt += chars[random.randint(0, len_chars)]
        i= i+1

    return salt
