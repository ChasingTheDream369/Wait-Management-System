import os
from queue import Queue
from flask import Blueprint
from flask import jsonify, request
from exts import db
from models import *
from macros import *
bp = Blueprint('customer_checkIn',__name__,)



'''
    
    Get the customer details and check if the customer details are correct, and if they are
    then create a customer record and add it to the database.

            Route: /checkin
            
            Methods : POST
            
                name: str ("Customer name")

                num_peop: int ("Number of people")

                r_id: int ("Restaurant id")

                t_id: int ("Table id")

            
            Returns:
                Example:
                    {
                      "code": 200,
                      "data": {
                        "id": 3,
                        "name": "customer name",
                        "table_id": 3,
                        "table_name": "A3",
                        "r_id": 1
                      }
                    }
'''

@bp.route('/checkin', methods=['POST'])
def checkin():
    # check if request input are correct or not
    data = request.get_json()
    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'name' not in list(data.keys()) or not data['name']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'num_peop' not in list(data.keys())  or not data['num_peop']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'r_id' not in list(data.keys()) or not data['r_id']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 't_id' not in list(data.keys()) or not data['t_id']:
        return jsonify({'code': 400, 'message': "invalid params"})

    # check if given table exist or not
    if not Table.query.filter_by(id=data['t_id']).first():
        return jsonify({'code': 404, 'message': "table id does not exist"})
    # check if given restaurant exist or not
    if not Restaurant.query.filter_by(id=data['r_id']).first():
        return jsonify({'code': 404, 'message': "restaurant id does not exist"})
    # check if total_customer > 12 or not   
    if data['num_peop'] > 12:
        return jsonify({'code': 400, 'message': "more than 12 people"})

    # check if given table is suitable for customer or not
    checktable = Table.query.filter_by(id=data['t_id']).first()
    if checktable.valid_table == False:
        return jsonify({'code': 400, 'message': "table does not exist"})
    if checktable.status != EMPTY or checktable.capacity < data['num_peop']:
        return jsonify({'code': 400, 'message': "table is not suitable"})
    # add customer check in record to database
    customer = Customer(name=data['name'], num_peop=data['num_peop'], r_id=data['r_id'], t_id=data['t_id'])
    db.session.add(customer)
    checktable.status = USING
    db.session.commit()

    table = Table.query.filter_by(id=customer.t_id).first()

    return jsonify({'code': 200,
                    'data': {'id': customer.id, 'name': customer.name, 'table_id': table.id, 'table_name': table.name, 'r_id' : table.r_id}})


'''
    
    Get the customer details and check if the customer details are correct, and if they are
    then create a queue record and add it to the database.If all tables are empty, this request should be rejected. 
    (Otherwise the customer will be in queue forever).

            Route: /queue
            
            Methods : POST
            
                name: str ("Customer name")

                total_customer: int ("Number of people")

                r_id: int ("Restaurant id")

            
            Returns:
                Example:
                    {
                      "code": 200,
                      "data": {
                        "id": 1,
                        "name": "customer name",
                        "total_customer": 4,
                        "position": 3,
                        "r_id": 14
                      }
                    }
'''

# customer enqueue
@bp.route('/queue', methods=['POST'])
def enqueue():
    # check if given input valid or not
    data = request.get_json()
    if not data:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'name' not in list(data.keys()) or not data['name']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'total_customer' not in list(data.keys()) or not data['total_customer']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if 'r_id' not in list(data.keys()) or not data['r_id']:
        return jsonify({'code': 400, 'message': "invalid params"})
    if not Restaurant.query.filter_by(id=data['r_id']).first():
        return jsonify({'code': 404, 'message': "restaurant id does not exist"})
    if data['total_customer'] > 12:
        return jsonify({'code': 400, 'message': "more than 12 people"})
    tables = Table.query.filter_by(r_id=data['r_id'], valid_table=True).order_by(Table.capacity).all()
    if len(Table.query.filter(Table.r_id == data ['r_id'], Table.status == EMPTY,
                               Table.capacity >=data['total_customer'], Table.valid_table == True).all()) >0:
        return jsonify({'code': 403, 'message': "there is already a available table for customer"})
    result = 0
    for table in tables:
        if table.capacity >= data['total_customer']:
            result = table.capacity
            break
    if result == 0 :
        return jsonify({'code': 404, 'message': "restaurant do not have such table you can sit"})
    # enqueue for this customer
    position = len(Queue.query.filter_by(r_id=data['r_id'],que_type = result).all()) + 1
    queue = Queue(name=data['name'], total_customer=data['total_customer'], r_id=data['r_id'], position=position,que_type = result)
    db.session.add(queue)
    db.session.commit()

    return jsonify({'code': 200, 'data': {'id': queue.id, 'name': queue.name, 'total_customer': queue.total_customer,
                                          'position': queue.position, 'r_id': queue.r_id}})


'''
    
    Get the queue by id, If still in queue, every field except "table_id" should be returned.
    If not in queue (i.e. dequed), customer will automaticly check-in and the information will be updated.

            Route: /queue/<id>
            
            Methods : GET
            
                id: int ("Queue id")

            
            Returns:
                Example:
                    {
                      "code": 200,
                      "data": {
                        "id": 12,
                        "name": "customer name",
                        "total_customer": 4,
                        "position": 13,
                        "r_id": 14
                      }
                    }
'''

# check if there is a available table for some queuing customer
@bp.route('/queue/<id>', methods=['GET'])
def check_queue(id):
    queues = Queue.query.filter_by(id=id).first()
    # check if queue exist
    if not queues:
        return jsonify({'code': 404, 'message': "queue id does not exist"})
    # check if current queuing customer has position 1 in this queue
    if queues.position != 1:        
        return jsonify({'code': 200, 'data': {'id': id, 'name': queues.name, 'total_customer': queues.total_customer,
                                              'position': queues.position, 'r_id': queues.r_id}})

    # check if there is an available table for this queuing customer, if there are many available, choose the one which has minimum capacity
    tables = Table.query.filter(Table.status == EMPTY,Table.r_id == queues.r_id,Table.capacity >= queues.total_customer,Table.valid_table == True).order_by(Table.capacity).first()
    if not tables:        
        return jsonify({'code': 200, 'data': {'id': id, 'name': queues.name, 'total_customer': queues.total_customer,
                                              'position': queues.position, 'r_id': queues.r_id}})
    # check if there are some other queuing customer in this restaurant has high priority for this available tablethan current queuing customer
    queues_count = Queue.query.filter(Queue.r_id == queues.r_id, Queue.que_type <= tables.capacity,Queue.que_type > queues.que_type).all()
    if len(queues_count) != 0:
        
        return jsonify({'code': 200, 'data': {'id': id, 'name': queues.name, 'total_customer': queues.total_customer,
                                              'position': queues.position, 'r_id': queues.r_id}})
    # delete queue information and automatically check in for this customer
    customer = Customer(name=queues.name, num_peop=queues.total_customer, r_id=queues.r_id, t_id=tables.id)
    tables.status = USING
    db.session.commit()
    db.session.add(customer)
    db.session.commit()
    queue_type = queues.que_type
    Queue.query.filter_by(id=id).delete()
    db.session.commit()
    update_queues= Queue.query.filter(Queue.que_type == queue_type ,Queue.r_id == tables.r_id).all()
    # update the remainning queue's postion
    for queue in update_queues:
        queue.position = queue.position - 1
        db.session.commit()

    return jsonify({'code': 200, 'data': {'table_id': tables.id, 'table_name': tables.name, 'customer_id': customer.id,
                                           'customer_name': customer.name, 'r_id': customer.r_id,
                                           'num_peop': customer.num_peop}})

'''
    
    Get the queue id, delete that queue by id and then update the remainning queue's position.

            Route: /queue/<id>
            
            Methods : DELETE
            
                id: int ("Queue id")

            
            Returns:
                Example:
                    {
                      "code": 200
                    }
'''

# customer manually leave queue
@bp.route('/queue/<id>', methods=['DELETE'])
def leave_queue(id):
   # check given input is valid or not
    queues = Queue.query.filter_by(id=id).first()
    if not queues:
        return jsonify({'code': 404, 'message': "queue id does not exist"})
    # delete queue information
    Queue.query.filter_by(id=id).delete()
    qtype = queues.que_type
    r_id = queues.r_id
    db.session.commit()
    update_queues= Queue.query.filter(Queue.que_type == qtype ,Queue.r_id == r_id).all()
    # update the remainning queue's postion
    for queue in update_queues:
        queue.position = queue.position - 1
        db.session.commit()
    return jsonify({'code': 200})

