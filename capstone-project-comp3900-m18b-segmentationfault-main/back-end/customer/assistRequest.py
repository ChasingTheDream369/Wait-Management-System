from flask import Blueprint
from flask import jsonify, request
from exts import db
from models import *
from macros import *
bp = Blueprint('customer_assist',__name__,)

'''
    
    If the method is GET, check t_id is existing or not and check table is valid or not. Get table's assistance status.
    If the method is POST, check t_id is existing or not and check table is valid or not. Set table's assistance status to be true.

            Route: /assist_request
            
            Methods : GET
            
                t_id: int ("Table id")

            
            Returns:
                Example:
                    {
                      "code": 200,
                      "data": {
                        "needAssist: true"
                      }
                    }

            Methods : POST
            
                t_id: int ("Table id")

            
            Returns:
                Example:
                    {
                      "code": 200,
                    }
'''

# get / update assitance field for given table
@bp.route('/assist_request', methods=['POST','GET'])
def assist_request():
    # get request, which get the assistance (True, False)
    if request.method == "GET":
        t_id = request.args.get('t_id')
        if not t_id:
            return jsonify({'code': 400, 'message': "invalid params"})
        # check if t_id valid or not
        if not Table.query.filter(Table.id == t_id).first():
            return jsonify({'code': 404, 'message': "table id does not exist"})
        # check if given table is using or not
        if Table.query.filter(Table.id == t_id).first().status != USING:
            return jsonify({'code': 404, 'message': "no customer use this table"})
        table = Table.query.filter(Table.id == t_id).first()
        if table.valid_table == False:
            return jsonify({'code': 400, 'message': "table does not exist"})
        return jsonify({'code': 200, "data":{"needAssist":table.need_assist}})
    # post request, change the table's assistance to be True
    if request.method == "POST":
        data = request.get_json()
        if not data:
            return jsonify({'code': 400, 'message': "invalid params"})
        if 't_id' not in list(data.keys()) or not data['t_id']:
            return jsonify({'code': 400, 'message': "invalid params"})
        # check if t_id valid or not
        if not Table.query.filter(Table.id == data['t_id']).first():
            return jsonify({'code': 404, 'message': "table id does not exist"})
        # check if given table is using or not
        if Table.query.filter(Table.id == data['t_id']).first().status != USING:
            return jsonify({'code': 404, 'message': "no customer use this table"})
        table = Table.query.filter(Table.id == data['t_id']).first()
        if table.valid_table == False:
            return jsonify({'code': 400, 'message': "table does not exist"})
        # update given table's assistance filed    
        Table.query.filter(Table.id == data['t_id']).update({"need_assist":True})
        db.session.commit()
        return jsonify({'code': 200})