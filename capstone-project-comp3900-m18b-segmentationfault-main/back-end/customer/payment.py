from flask import Blueprint
from flask import jsonify, request
from exts import db
from models import *
from macros import *
bp = Blueprint('customer_payment',__name__,)

'''
    
    Firstly make sure that the customer exists or not and then that all the orders by the 
    customers have been completed, then we make sure whether the table is valid or not 
    and set it to cleaning after the payment has been done and retrun the 200 status indicating
    a success.
            
            Route: /payment
            
            Methods : GET
                
                customer_id : integer (Customer Id) 
                
            Returns:
            
                Example:
                    {
                      "code": 200
                    }  

                    
'''
@bp.route('/payment', methods=['GET'])
def payment():
    # get customer id
    data = request.args.get('customer_id')
    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})
    # check if customer exist or not
    if not Customer.query.filter_by(id=data).first():
        return jsonify({'code': 404, 'message': "customer id does not exist"})
    
    customer = Customer.query.filter_by(id=data).first()
    # check if all of order of customer have been completed or not
    for order in customer.r_orders:
        if order.status != COMPLETED:
            return jsonify({'code': 400, 'message': "orders not completed"})
    
    table = Table.query.filter_by(id = customer.t_id).first()
    # check if table has been delete or not
    if table.valid_table == False:
        return jsonify({'code': 400, 'message': "table does not exist"})
    table.status = CLEANING
    db.session.commit()
    
    return jsonify({'code': 200})

