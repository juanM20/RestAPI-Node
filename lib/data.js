
var fs = require('fs');
const { validateHeaderValue } = require('http');
var path = require('path');
var helpers = require('./helpers');
var lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = function (dir, file, data, callback) {

    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // Convert data to string
            var stringData = JSON.stringify(data);
            //Write to file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    });
                } else {
                    callback('Error writing to new file');
                }
            });
        } else {
            callback('Could not create new file, it may already exist');
        }
    });
};

lib.read = function (dir, file, callback) {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
        if (!err && data) {
            var parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    });
};


lib.update = function (dir, file, data, callback) {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {

            var stringData = JSON.stringify(data);

            fs.truncate(fileDescriptor, (err) => {
                if (!err) {
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing existing file');
                                }
                            })
                        } else {
                            callback('Error writing to existing file');
                        }
                    })
                } else {
                    callback('Error truncate file');
                }
            });
        } else {
            callback('Could not open the file for updating, it may not exist yet');
        }
    })
};

lib.delete = function (dir, file, callback) {
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    })
}

module.exports = lib;