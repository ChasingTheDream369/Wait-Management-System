from flask import Blueprint
from flask import  jsonify, request,session
from exts import db
from models import *
from sqlalchemy import text
from macros import *
bp = Blueprint('manager_table',__name__,)



'''
   Get new table details and restaurant_id, if system is free and table 
   name not clash with existing table, then we create new table record in database

        Route : /tables

        Method : POST
            r_id : int (Restaurant id) 
            name : str (Table name)   
            capacity : int (Table maximum capacity)

        
        Returns:
            Example:
                {
                    "code":200
                }
'''

# create table
@bp.route('/tables', methods = ['POST'])
def add_tables():
    # check if given inputs are valid or not
    data = request.get_json()
    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'r_id' not in list(data.keys()) or not data['r_id']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'name' not in list(data.keys()) or not data['name']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'capacity' not in list(data.keys()) or not data['capacity']:
        return jsonify({'code': 400, 'message': "invalid params"})
    # check if given capcity exceed 12 or not
    if data['capacity'] > 12:
        return jsonify({'code': 400, 'message': "you have exceed the maximum capacity you could set"})
    if not Restaurant.query.filter(Restaurant.id == data['r_id']):
        return jsonify({'code': 404, 'message': "restaurant does not exist"})
    # not allow add tables when some customer using 
    if len(Table.query.filter(Table.r_id == data['r_id']).all()) != len(Table.query.filter(Table.r_id == data['r_id'],Table.status == EMPTY).all()):
        return jsonify({'code': 404, 'message': "some customer is in your restaurant now, you could add this table when restaurant is free"})
    # not allow add tables when some customer queuing
    if len(Queue.query.filter(Queue.r_id == data['r_id']).all()) != 0:
        return jsonify({'code': 404, 'message': "some customer is queuing for tables now, you could add this table when restaurant is free"})
    # table names in a restaurant must be unique
    sql = "select * from `table` where binary name =:para and r_id =:para2 and valid_table = 1 "
    table_tar = db.session.execute(text(sql),{'para':data['name'],'para2':data['r_id']}).fetchone()
    if table_tar is not None:
        return jsonify({'code': 404, 'message': "table name already exist"})
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
 
 
    # create new table
    table = Table(name = data['name'], capacity = data['capacity'],r_id = data['r_id'])
    db.session.add(table)
    db.session.commit()
    return jsonify({'code': 200})


'''
   delete given table, set it's valid_table attributes to be FALSE

        Route : /tables/<id>

        Method : DELETE
            id : int (Table id)
        
        Returns:
            Example:
                {
                    "code":200
                }
'''

# delte table
@bp.route('/tables/<id>', methods=['DELETE'])
def delete_tables(id):

    table = Table.query.filter_by(id=id).first()
    if not table:
        return jsonify({'code': 404, 'message': "table does not exist"})
    r_id = table.r_id

    # not allow delete tables when some customer using 
    if len(Table.query.filter(Table.r_id == r_id).all()) != len(Table.query.filter(Table.r_id == r_id,Table.status == EMPTY).all()):
        return jsonify({'code': 404, 'message': "some customer is in your restaurant now, you could delete this table when restaurant is free"})
    # not allow delete tables when some customer queuing
    if len(Queue.query.filter(Queue.r_id == r_id).all()) != 0:
        return jsonify({'code': 404, 'message': "some customer is queuing for tables now, you could delete this table when restaurant is free"})
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

    # delete table
    Table.query.filter_by(id=id).update({"valid_table": False})
    db.session.commit()
    
    return jsonify({'code': 200})


'''
   Get table new infotmations, check if that clash with existing tables in restaurant,
   if not then we update table info in databse

        Route : /tables

        Method : PUT
            r_id : str (Restaurant id) 
            t_id : int (Table id)
            name : str (Table new name)
            capacity : int (Table new capacity)
        
        Returns:
            Example:
                {
                    "code":200
                }
'''

# update table
@bp.route('/tables', methods=['PUT'])
def update_tables():
    data = request.get_json()
    #params checks
    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})   
    if 'r_id' not in list(data.keys()) or not data['r_id']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 't_id' not in list(data.keys()) or not data['t_id']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'name' not in list(data.keys()) or not data['name']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'capacity' not in list(data.keys()) or not data['capacity']:
        return jsonify({'code': 400, 'message': "invalid params"})
    # check if given capcity exceed 12 or not
    if data['capacity'] > 12:
        return jsonify({'code': 400, 'message': "You have exceed the maximum capacity you could set."})

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

    if not Table.query.filter_by(id = data['t_id']).first():
        return jsonify({'code': 400, 'message': "Updating table does not exist"})
    if Table.query.filter_by(id = data['t_id']).first().r_id != data['r_id']:
        return jsonify({'code': 400, 'message': "Table id does not belong to given restaurant id"})

    # not allow update tables when some customer using 
    if len(Table.query.filter(Table.r_id == data['r_id']).all()) != len(Table.query.filter(Table.r_id == data['r_id'],Table.status == EMPTY).all()):
        return jsonify({'code': 404, 'message': "Some customer is in your restaurant now, you could update this table when restaurant is free."})
    # not allow update tables when some customer queuing
    if len(Queue.query.filter(Queue.r_id == data['r_id']).all()) != 0:
        return jsonify({'code': 404, 'message': "Some customer is queuing for tables now, you could update this table when restaurant is free."})
    # table names in a restaurant must be unique
    sql = "select * from `table` where binary name =:para and r_id =:para2 and valid_table = 1 "
    table_tar = db.session.execute(text(sql),{'para':data['name'],'para2':data['r_id']}).fetchone()
    if table_tar is not None and table_tar.id != data['t_id']:
        return jsonify({'code': 404, 'message': "Table name already exist."}) 
    # update table
    Table.query.filter_by(id = data['t_id']).update({'name':data['name'],'capacity':data['capacity']})
    db.session.commit()
    
    return jsonify({'code': 200})