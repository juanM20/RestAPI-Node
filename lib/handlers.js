
var _data = require('./data');
var helpers = require('./helpers');

var handlers = {};

handlers.ping = (data, callback) => {
    callback(200);
};

handlers.notFound = (data, callback) => {
    callback(404);
};

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
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
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
// Require data: phone
// optional data: none
// @TODO only let an authenticated user acces their object. Don't let them acces anyone
handlers._users.get = (data, callback) => {
    // Check that the phone number is valid
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        //lookup the user
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                //Remove the hashed password from the user object before returning it to the req
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

//users put
handlers._users.put = (data, callback) => {

    // Check for the required field
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    // Check for the optional fields
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone) {
        if (firstName || lastName || password) {
            // Lookup the user
            _data.read('users', phone, (err, userData) => {
                if (!err && userData) {
                    // Update the fields necessary
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    //Store the new updates 
                    _data.update('users', phone, userData, (err) => {
                        if (!err) {
                            callback(200);
                        }
                        else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not update the user' });
                        }
                    })
                }
                else {
                    callback(400, { 'Error': 'The specified user does not exist' });
                }
            });
        }
        else {
            callback(400, { 'Error': 'Missing fields to update' });
        }
    }
    else {
        callback(400, { 'Error': 'Missing required fileds' });
    }
};

//users delete
handlers._users.delete = (data, callback) => {
    // Check that the phone number is valid
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        //lookup the user
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                //Remove the hashed password from the user object before returning it to the req
                _data.delete('users', phone, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, { 'Error': 'Could not delete the specified user' });
                    }
                });
            } else {
                callback(404, { 'Error': 'Could not find the specified user' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }

};


module.exports = handlers;