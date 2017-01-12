

var Connector = require('loopback-connector').Connector;

require('util').inherits(HelloWorldConnector, Connector);



exports.initialize = function initializeDataSource(dataSource, callback) {
    console.log(dataSource.settings);
    dataSource.connector = new HelloWorldConnector(dataSource.settings);
    process.nextTick(function () {
        callback && callback();
    });
};


//constructor
function HelloWorldConnector(dataSourceProps) {
    this.field1 = dataSourceProps.field1;
    this.response = [{"id": 1, "name": "hello"}, {"id": 2, "name": "world"}];
    //Loopback will add all model definitions to _models with the model name as key.
    this._models = {};
}

//to retrieve model properties, we use this._models[model].properties
//to retrieve the id field name, we use this.idName(model).




HelloWorldConnector.prototype.all = function (model, filter, callback) {
    console.log("all method");
    if (filter && filter.where && filter.where.id) { //GET with id operation
        this.response.forEach(function (field) {
            if (filter.where.id === field.id) {
                callback(null, [field]);
                return;
            }
        });
    } else { //GET all operation
        callback(null, this.response);
    }
};

HelloWorldConnector.prototype.create = function (model, data, callback) {
    console.log("create method");
    if (data.id) {
        this.response.push(data);
    } else {
        data.id = this.response.length + 1;
        this.response.push(data);
    }
    callback(null, data.id);
};


HelloWorldConnector.prototype.updateOrCreate = function (model, data, callback) {
    console.log("updateOrCreate");
    var isCreate = true;
    for (var i = 0; i < this.response.length; i++) {
        if (this.response[i].id === data.id) {
            this.response[i].name = data.name;
            isCreate = false;
            callback(null, data);
            return;
        }
    }

    if (isCreate) {
        this.response.push(data);
        callback(null, data);
    }
};



HelloWorldConnector.prototype.updateAttributes = function updateAttrs(model, id, data, callback) {
    console.log("updateAttributes");
    callback(null, data);
};

HelloWorldConnector.prototype.destroyAll = function destroy(model, where, callback) {
    console.log("destroyAll");
    callback(null, []);
};


HelloWorldConnector.prototype.update = function update(model, where, data, callback) {
    console.log("update");
    callback(null, []);
};







HelloWorldConnector.prototype.ping = function (callback) {
    console.log("ping");
    callback(null);
};


HelloWorldConnector.prototype.discoverModelDefinitions = function (options, callback) {
    console.log("discoverModelDefinitions");
    var models=[]
    callback(null, models);
};

HelloWorldConnector.prototype.discoverModelProperties = function (objectName, options, callback) {
    console.log("discoverModelProperties");
    callback(null, [{"name": "name", "type": "string", "length": 100, "required": true}]);
};


HelloWorldConnector.prototype.discoverSchemas = function (objectName, options, callback) {
    this.discoverModelProperties(objectName, options, function (error, response) {
        console.log(response);
        if (error) {
            callback && callback(error);
            return;
        }
        var schema = {
            name: objectName,
            options: {
                idInjection: true, // false - to remove id property
                sObjectName: objectName
            },
            properties: {}
        };

        if (response || response.length !== 0) {
            response.forEach(function (field) {
                var fieldProperties = {};
                Object.keys(field).forEach(function (fieldProperty) {
                    fieldProperties[fieldProperty] = field[fieldProperty];
                });
                schema.properties[field["name"]] = fieldProperties;
            });
        }
        console.log(schema);
        options.visited = options.visited || {};
        if (!options.visited.hasOwnProperty(objectName)) {
            options.visited[objectName] = schema;
        }
        callback && callback(null, options.visited);
    });
}
