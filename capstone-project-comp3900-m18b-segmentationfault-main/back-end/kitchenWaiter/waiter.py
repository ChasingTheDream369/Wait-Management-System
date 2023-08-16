from flask import Blueprint
from flask import jsonify, request,session
from exts import db
from models import *
from macros import *
bp = Blueprint('staff_waiter',__name__,)

'''
    
    After checking r_id, all not empty tables' details will be returned.
            Route: /tablesStaff
            
            Methods : GET

                r_id: int ("Restaurant id")
            
            Returns:
                Example:
                    {
                      "code": 200,
                      "data": {
                        "id": 2,
                        "name": "A2",
                        "need_assist": true,
                        "status": "using"
                      }
                    }
'''

# used to see tables details that are not empty
@bp.route('/tablesStaff', methods = ['GET'])
def get_tables():
    restaurant_id = request.args.get('r_id')
    if not restaurant_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not Restaurant.query.filter_by(id=restaurant_id).first():
        return jsonify({'code': 404, 'message': "restaurant id does not exist"}) 
    
    all_tables = Table.query.filter_by(r_id=restaurant_id, valid_table=True).all()

    Tables = []
    # get all not empty tables details
    for table in all_tables:
        if table.status == USING or table.status == CLEANING:
            Tables.append({'id': table.id, 'name': table.name, 'need_assist': table.need_assist, 'status': table.status})
    
    return jsonify({'code': 200, 'data': Tables})

'''
    
    After checking r_id, table_id, session and valid table, waiter can change cleaning table to
    empty table. In addition, waiter can change tables' assistance status to be false.
            Route: /tablesStaff
            
            Methods : POST

                r_id: int ("Restaurant id")

                table_id: int ("Table id")
            
            Returns:
                Example:
                    {
                      "code": 200
                    }
'''

# used when waiter need to change table status from cleaning to empty and change need assist to false
@bp.route('/updateTable', methods = ['POST'])
def update_table():
    data = request.get_json()
    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'r_id' not in list(data.keys()) or not data['r_id']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'table_id' not in list(data.keys()) or not data['table_id']:
        return jsonify({'code': 400, 'message': "invalid params"})
    
    if not Table.query.filter_by(id=data['table_id']).first():
        return jsonify({'code': 404, 'message': "table id does not exist"})
    if not Restaurant.query.filter_by(id=data['r_id']).first():
        return jsonify({'code': 404, 'message': "restaurant id does not exist"})   

    table = Table.query.filter_by(id = data['table_id']).first() 
    if table.valid_table == False:
        return jsonify({'code': 400, 'message': "table does not exist"})
    # check session
    staff_id = session.get('staff_id')
    staff_role = session.get('role')
    if not staff_id:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not staff_role:
        return jsonify({'code': 400, 'message': "invalid params"})

    if staff_role != "waiter":
        return jsonify({'code': 404, 'message': "this staff is not waiter"}) 
    # change table status from cleaning to empty
    if table.status == CLEANING:
        table.status = EMPTY
        db.session.commit()
    # change table's assistance
    table.need_assist = False
    db.session.commit()
    return jsonify({'code': 200})