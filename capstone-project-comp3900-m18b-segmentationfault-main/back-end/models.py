from exts import db
from datetime import datetime

class Restaurant(db.Model):
    __tablename__ = "restaurant"
    id = db.Column(db.Integer, primary_key=True)  # primary key
    name = db.Column(db.String(255), nullable=False)  # name of restaurant, can not be null
    address = db.Column(db.String(255), nullable=False)  # address of restaurant, can not be null
    description = db.Column(db.Text, nullable=False)  # description of restaurant, can not be null
    img_url = db.Column(db.String(500), nullable=True,unique=True)  # img_url of restaurant, can be null if not given
    lat = db.Column(db.DECIMAL(10, 5), nullable=False)
    lon = db.Column(db.DECIMAL(10, 5), nullable=False)

    def __repr__(self):
        return f"Restaurant('{self.name}', '{self.address}')"


class Queue(db.Model):
    __tablename__ = "queue"
    id = db.Column(db.Integer, primary_key=True)  # primary key
    name = db.Column(db.String(255), nullable=False)  # name of customer in queue, can not be null
    total_customer = db.Column(db.Integer, nullable=False)  # total numbumer of people
    position = db.Column(db.Integer, nullable=False)  # position customer in queue
    que_type = db.Column(db.Integer,nullable = False) # the table capacity this customer queue in
    r_id = db.Column(db.Integer, db.ForeignKey("restaurant.id"), nullable=False)  # restaurant of queue, forieign key

    r_res = db.relationship("Restaurant", backref="r_queues", lazy=True)  # relation which can access via forieign key

    def __repr__(self):
        return f"Queue('{self.name}', '{self.total_customer}', '{self.position}')"


class Table(db.Model):
    __tablename__ = "table"
    id = db.Column(db.Integer, primary_key=True)  # primary key
    name = db.Column(db.String(255), nullable=False)  # name of table, can not be null
    status = db.Column(db.SmallInteger, nullable=False,default =0)
    capacity = db.Column(db.Integer, nullable=False)  # capacity for a table
    need_assist = db.Column(db.Boolean, nullable=False, default=False)  # assistance , True = need help, False = no request

    r_id = db.Column(db.Integer, db.ForeignKey("restaurant.id"), nullable=False)  # restaurant of table, forieign key
    valid_table = db.Column(db.Boolean, nullable=False, default=True) # the validation of table
    r_res = db.relationship("Restaurant", backref="r_tables", lazy=True)

    def __repr__(self):
        return f"Table('{self.name}', '{self.status}', '{self.capacity}')"


class Staff(db.Model):
    __tablename__ = "staff"
    id = db.Column(db.Integer, primary_key=True)  # primary key
    role = db.Column(db.Enum("kitchen", "waiter", "manager"), nullable=False)
    user_name = db.Column(db.String(255), nullable=False,unique = True)  # login username for staff, can not be null
    password = db.Column(db.String(255), nullable=False)  # login password for staff
    salt = db.Column(db.String(255), nullable=False)  # MD5 encryption tool
    create_time = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow)  # the time staff register for a restaurant
    login_permission = db.Column(db.Boolean, nullable=False, default=True) # the permission of staff 
    r_id = db.Column(db.Integer, db.ForeignKey("restaurant.id"), nullable=False)  # restaurant of staff, forieign key


    r_res = db.relationship("Restaurant", backref="r_staffs", lazy=True)

    def __repr__(self):
        return f"Staff ('{self.user_name}', '{self.role}')"


class Category(db.Model):
    __tablename__ = "category"
    id = db.Column(db.Integer, primary_key=True)  # primary key
    name = db.Column(db.String(255), nullable=False)  # name of category, can not be null
    index = db.Column(db.Integer, nullable=False)  # the index for this category in restaurant
    r_id = db.Column(db.Integer, db.ForeignKey("restaurant.id"), nullable=False)  # restaurant of staff, forieign key
    r_res = db.relationship("Restaurant", backref="r_categories", lazy=True)
    valid_cat = db.Column(db.Boolean, nullable=False, default=True) # the validation of category 
    def __repr__(self):
        return f"Category ('{self.name}')"


class Customer(db.Model):
    __tablename__ = "customer"
    id = db.Column(db.Integer, primary_key=True)  # primary key
    name = db.Column(db.String(255), nullable=False)  # name of customer, can not be null
    num_peop = db.Column(db.Integer, nullable=False)  # number of people
    checkin_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)  # the time customer check in
    r_id = db.Column(db.Integer, db.ForeignKey("restaurant.id"),
                     nullable=False)  # restaurant of customer check in, forieign key
    t_id = db.Column(db.Integer, db.ForeignKey("table.id"), nullable=False)  # table id which customer choose

    r_res = db.relationship("Restaurant", backref="r_customers", lazy=True)
    r_table = db.relationship("Table", backref="r_customers", lazy=True)

    def __repr__(self):
        return f"Customer ('{self.name}', '{self.num_peop}', '{self.checkin_time}')"


class Item(db.Model):
    __tablename__ = "item"
    id = db.Column(db.Integer, primary_key=True)  # primary key
    name = db.Column(db.String(255), nullable=False)  # name of item, can not be null
    price = db.Column(db.DECIMAL(7, 2), nullable=False)  # price of item, can not be null
    description = db.Column(db.Text, nullable=False)  # decription of item
    ingredients = db.Column(db.Text, nullable=False)  # ingredient of item
    stock = db.Column(db.Integer, nullable=False)  # stock of item
    img_url = db.Column(db.String(255), nullable=True)
    speciality = db.Column(db.Boolean, nullable=False, default=False)  # True = Speciality, False = not
    index = db.Column(db.Integer, nullable=False)  # index for a item in a particular category
    r_id = db.Column(db.Integer, db.ForeignKey("restaurant.id"), nullable=False)  # restaurant of item, forieign key
    cat_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=False)
    valid_item = db.Column(db.Boolean, nullable=False, default=True) # the validation of item

    r_res = db.relationship("Restaurant", backref="r_items", lazy=True)
    r_cat = db.relationship("Category", backref="r_items", lazy=True)

    def __repr__(self):
        return f"Item ('{self.name}', '{self.price}', '{self.stock}')"


class Order(db.Model):
    __tablename__ = "order"
    id = db.Column(db.Integer, primary_key=True)  # primary key
    item_id = db.Column(db.Integer, db.ForeignKey("item.id"), nullable=False)  # item id of a order, forieign key
    customer_id = db.Column(db.Integer, db.ForeignKey("customer.id"),
                            nullable=False)  # customer id of a order, forieign key
    quantity = db.Column(db.Integer, nullable=False)  # quantity of this items customer order
    status = db.Column(db.SmallInteger, nullable=False,default = 0)
    cooked_by = db.Column(db.Integer, db.ForeignKey("staff.id"),
                          nullable=True)  # the staff who cook this order , forieign key
    served_by = db.Column(db.Integer, db.ForeignKey("staff.id"),
                          nullable=True)  # the staff who serve this order , forieign key
    creat_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)  # the time order generate
    last_modified = db.Column(db.DateTime, nullable=True)  # the time order change it's status
    r_id = db.Column(db.Integer, db.ForeignKey("restaurant.id"), nullable=False)  # restaurant of staff, forieign key

    r_items = db.relationship("Item", backref="r_orders", lazy=True)
    r_res = db.relationship("Restaurant", backref="r_orders", lazy=True)
    r_customer = db.relationship("Customer", backref="r_orders", lazy=True)
    r_cook = db.relationship("Staff", backref="r_cook_orders", foreign_keys = cooked_by ,lazy=True)
    r_serve = db.relationship("Staff", backref="r_serve_orders", foreign_keys = served_by , lazy=True)



    def __repr__(self):
        return f"Item ('{self.staus}', '{self.quantity}', '{self.item_id}', '{self.customer_id}')"
