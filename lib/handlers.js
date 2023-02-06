
var _data = require('./data');

var handlers = {};

//Users
handlers.users = (data, callback) => {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

//container for the user submethods
handlers._users = {};

//users post
handlers._users.post = (data, callback) => {
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length < 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length < 0 ? data.payload.lastName.trim() : false;
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length < 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        _data.read('users', phone, (err, data) => {
            if (err) {
                var hashedPassword = helpers.hash(password);
                if (hashedPassword) {
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    }

                    //store the user
                    _data.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not create the new user' });
                        }
                    });

                } else {
                    callback(500, { 'Error': 'Could not hash password' });
                }


            } else {
                callback(400, { 'Error': 'A user with that number already exists' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required fileds' });
    }
};

//users get
handlers._users.get = (data, callback) => {

};

//users put
handlers._users.put = (data, callback) => {

};

//users delete
handlers._users.delete = (data, callback) => {

};


module.exports = handlers;