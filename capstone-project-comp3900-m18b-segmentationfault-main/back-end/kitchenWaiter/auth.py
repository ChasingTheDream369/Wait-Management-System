from flask import Blueprint
from flask import  jsonify, request,session
from exts import db
from models import *
from flask_cors import cross_origin
import hashlib
import base64
from Crypto.Cipher import PKCS1_v1_5
from Crypto import Random
from Crypto.PublicKey import RSA
from sqlalchemy import text
from macros import *
bp = Blueprint('staff_authen',__name__,)

'''
    
    Get the staff details and check if the staff details are correct, and check staff is existing or not.
    if they are then staff can log in.
            Route: /Login
            
            Methods : POST
            
                name: str ("Staff name")
                password: str ("Staff password")
                position: str ("Staff role")
                r_id: int ("Restaurant id")
            
            Returns:
                Example:
                    {
                      "code": 200,
                      "data": {
                        "id": 3
                      }
                    }
'''

# used when kitchen and waiter want to login
@bp.route('/Login', methods = ['POST'])
@cross_origin()
def login():
    data = request.get_json()
    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'name' not in list(data.keys()) or not data['name']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'password' not in list(data.keys()) or not data['password']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'position' not in list(data.keys()) or not data['position']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'r_id' not in list(data.keys()) or not data['r_id']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not Restaurant.query.filter_by(id=data['r_id']).first():
        return jsonify({'code': 404, 'message': "restaurant id does not exist"})   

    # decrypted the password from front-end
    pass_decrypted = decryption(data['password'], bytes(private_key,'utf-8'))
    # search name from staff table
    sql = "select * from staff where binary user_name =:para"
    staff = db.session.execute(text(sql),{'para':data['name']}).fetchone()
    if staff is None:
        return jsonify({'code': 404, 'message': "staff name does not exist"})
    #staff = Staff.query.filter_by(user_name=data['name']).first()
    if staff.r_id != data['r_id']:
        return jsonify({'code': 404, 'message': "staff restaurant does not match"})
    if staff.role != data['position']:
        return jsonify({'code': 404, 'message': "staff role does not match"})
    received_password = hash_password(pass_decrypted, staff.salt)
    # compare the password after md5 with  password stored in database
    if (staff.password != received_password):
        return jsonify({'code': 400, 'message': "password is wrong"})
    if not staff.login_permission :
        return jsonify({'code': 400, 'message': "you dont have permission to login"})
    # add session     
    
    session['staff_id'] = staff.id
    session['role'] = staff.role
    session.permanent = True

    return jsonify({'code': 200, 'data': {'id': staff.id}})

'''
    
    Staff can log out and their session will be cleared
            Route: /Logout
            
            Methods : GET
            
            Returns:
                Example:
                    {
                      "code": 200
                    }
'''


@bp.route('/Logout',methods = ['GET'])
def logout():
    session.clear()
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
