from flask import Flask
import config
from exts import db
from customer import cus_bp1,cus_bp2,cus_bp3,cus_bp4,cus_bp5,cus_bp6,cus_bp7
from kitchenWaiter import kw_bp1,kw_bp2,kw_bp3,kw_bp4
from manager import ma_bp1,ma_bp2,ma_bp3,ma_bp4,ma_bp5,ma_bp6,ma_bp7
from flask_migrate import Migrate
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, supports_credentials=True)

app.config.from_object(config)
db.init_app(app)
migrate = Migrate(app, db)
# customer blueprint
app.register_blueprint(cus_bp1)
app.register_blueprint(cus_bp2)
app.register_blueprint(cus_bp3)
app.register_blueprint(cus_bp4)
app.register_blueprint(cus_bp5)
app.register_blueprint(cus_bp6)
app.register_blueprint(cus_bp7)
# kitchen staff & waiter blueprint
app.register_blueprint(kw_bp1)
app.register_blueprint(kw_bp2)
app.register_blueprint(kw_bp3)
app.register_blueprint(kw_bp4)
# manager blueprint
app.register_blueprint(ma_bp1)
app.register_blueprint(ma_bp2)
app.register_blueprint(ma_bp3)
app.register_blueprint(ma_bp4)
app.register_blueprint(ma_bp5)
app.register_blueprint(ma_bp6)
app.register_blueprint(ma_bp7)

if __name__ == '__main__':
    app.run(debug = True)

