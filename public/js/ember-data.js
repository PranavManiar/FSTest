/*!
 * @overview  Ember Data
 * @copyright Copyright 2011-2014 Tilde Inc. and contributors.
 *            Portions Copyright 2011 LivingSocial Inc.
 * @license   Licensed under MIT license (see license.js)
 * @version   1.0.0-beta.5
 */


(function() {
var define, requireModule;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requireModule = function(name) {
    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    var mod, deps, callback, reified , exports;

    mod = registry[name];

    if (!mod) {
      throw new Error("Module '" + name + "' not found.");
    }

    deps = mod.deps;
    callback = mod.callback;
    reified = [];
    exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(deps[i]));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;
  };
})();
(function() {
/**
  @module ember-data
*/

/**
  All Ember Data methods and functions are defined inside of this namespace.

  @class DS
  @static
*/
var DS;
if ('undefined' === typeof DS) {
  /**
    @property VERSION
    @type String
    @default '1.0.0-beta.5'
    @static
  */
  DS = Ember.Namespace.create({
    VERSION: '1.0.0-beta.5'
  });

  if ('undefined' !== typeof window) {
    window.DS = DS;
  }

  if (Ember.libraries) {
    Ember.libraries.registerCoreLibrary('Ember Data', DS.VERSION);
  }
}

})();



(function() {
var get = Ember.get, set = Ember.set, isNone = Ember.isNone;

// Simple dispatcher to support overriding the aliased
// method in subclasses.
function aliasMethod(methodName) {
  return function() {
    return this[methodName].apply(this, arguments);
  };
}

/**
  In Ember Data a Serializer is used to serialize and deserialize
  records when they are transfered in and out of an external source.
  This process involves normalizing property names, transforming
  attribute values and serializeing relationships.

  For maximum performance Ember Data recomends you use the
  [RESTSerializer](DS.RESTSerializer.html) or one of its subclasses.

  `JSONSerializer` is useful for simpler or legacy backends that may
  not support the http://jsonapi.org/ spec.

  @class JSONSerializer
  @namespace DS
*/
DS.JSONSerializer = Ember.Object.extend({
  /**
    The primaryKey is used when serializing and deserializing
    data. Ember Data always uses the `id` propery to store the id of
    the record. The external source may not always follow this
    convention. In these cases it is usesful to override the
    primaryKey property to match the primaryKey of your external
    store.

    Example

    ```javascript
    App.ApplicationSerializer = DS.JSONSerializer.extend({
      primaryKey: '_id'
    });
    ```

    @property primaryKey
    @type {String}
    @default 'id'
  */
  primaryKey: 'id',

  /**
   Given a subclass of `DS.Model` and a JSON object this method will
   iterate through each attribute of the `DS.Model` and invoke the
   `DS.Transform#deserialize` method on the matching property of the
   JSON object.  This method is typically called after the
   serializer's `normalize` method.

   @method applyTransforms
   @private
   @param {subclass of DS.Model} type
   @param {Object} data The data to transform
   @return {Object} data The transformed data object
  */
  applyTransforms: function(type, data) {
    type.eachTransformedAttribute(function(key, type) {
      var transform = this.transformFor(type);
      data[key] = transform.deserialize(data[key]);
    }, this);

    return data;
  },

  /**
    Normalizes a part of the JSON payload returned by
    the server. You should override this method, munge the hash
    and call super if you have generic normalization to do.

    It takes the type of the record that is being normalized
    (as a DS.Model class), the property where the hash was
    originally found, and the hash to normalize.

    You can use this method, for example, to normalize underscored keys to camelized
    or other general-purpose normalizations.

    Example

    ```javascript
    App.ApplicationSerializer = DS.JSONSerializer.extend({
      normalize: function(type, hash) {
        var fields = Ember.get(type, 'fields');
        fields.forEach(function(field) {
          var payloadField = Ember.String.underscore(field);
          if (field === payloadField) { return; }

          hash[field] = hash[payloadField];
          delete hash[payloadField];
        });
        return this._super.apply(this, arguments);
      }
    });
    ```

    @method normalize
    @param {subclass of DS.Model} type
    @param {Object} hash
    @return {Object}
  */
  normalize: function(type, hash) {
    if (!hash) { return hash; }

    this.applyTransforms(type, hash);
    return hash;
  },

  // SERIALIZE
  /**
    Called when a record is saved in order to convert the
    record into JSON.

    By default, it creates a JSON object with a key for
    each attribute and belongsTo relationship.

    For example, consider this model:

    ```javascript
    App.Comment = DS.Model.extend({
      title: DS.attr(),
      body: DS.attr(),

      author: DS.belongsTo('user')
    });
    ```

    The default serialization would create a JSON object like:

    ```javascript
    {
      "title": "Rails is unagi",
      "body": "Rails? Omakase? O_O",
      "author": 12
    }
    ```

    By default, attributes are passed through as-is, unless
    you specified an attribute type (`DS.attr('date')`). If
    you specify a transform, the JavaScript value will be
    serialized when inserted into the JSON hash.

    By default, belongs-to relationships are converted into
    IDs when inserted into the JSON hash.

    ## IDs

    `serialize` takes an options hash with a single option:
    `includeId`. If this option is `true`, `serialize` will,
    by default include the ID in the JSON object it builds.

    The adapter passes in `includeId: true` when serializing
    a record for `createRecord`, but not for `updateRecord`.

    ## Customization

    Your server may expect a different JSON format than the
    built-in serialization format.

    In that case, you can implement `serialize` yourself and
    return a JSON hash of your choosing.

    ```javascript
    App.PostSerializer = DS.JSONSerializer.extend({
      serialize: function(post, options) {
        var json = {
          POST_TTL: post.get('title'),
          POST_BDY: post.get('body'),
          POST_CMS: post.get('comments').mapProperty('id')
        }

        if (options.includeId) {
          json.POST_ID_ = post.get('id');
        }

        return json;
      }
    });
    ```

    ## Customizing an App-Wide Serializer

    If you want to define a serializer for your entire
    application, you'll probably want to use `eachAttribute`
    and `eachRelationship` on the record.

    ```javascript
    App.ApplicationSerializer = DS.JSONSerializer.extend({
      serialize: function(record, options) {
        var json = {};

        record.eachAttribute(function(name) {
          json[serverAttributeName(name)] = record.get(name);
        })

        record.eachRelationship(function(name, relationship) {
          if (relationship.kind === 'hasMany') {
            json[serverHasManyName(name)] = record.get(name).mapBy('id');
          }
        });

        if (options.includeId) {
          json.ID_ = record.get('id');
        }

        return json;
      }
    });

    function serverAttributeName(attribute) {
      return attribute.underscore().toUpperCase();
    }

    function serverHasManyName(name) {
      return serverAttributeName(name.singularize()) + "_IDS";
    }
    ```

    This serializer will generate JSON that looks like this:

    ```javascript
    {
      "TITLE": "Rails is omakase",
      "BODY": "Yep. Omakase.",
      "COMMENT_IDS": [ 1, 2, 3 ]
    }
    ```

    ## Tweaking the Default JSON

    If you just want to do some small tweaks on the default JSON,
    you can call super first and make the tweaks on the returned
    JSON.

    ```javascript
    App.PostSerializer = DS.JSONSerializer.extend({
      serialize: function(record, options) {
        var json = this._super.apply(this, arguments);

        json.subject = json.title;
        delete json.title;

        return json;
      }
    });
    ```

    @method serialize
    @param {subclass of DS.Model} record
    @param {Object} options
    @return {Object} json
  */
  serialize: function(record, options) {
    var json = {};

    if (options && options.includeId) {
      var id = get(record, 'id');

      if (id) {
        json[get(this, 'primaryKey')] = id;
      }
    }

    record.eachAttribute(function(key, attribute) {
      this.serializeAttribute(record, json, key, attribute);
    }, this);

    record.eachRelationship(function(key, relationship) {
      if (relationship.kind === 'belongsTo') {
        this.serializeBelongsTo(record, json, relationship);
      } else if (relationship.kind === 'hasMany') {
        this.serializeHasMany(record, json, relationship);
      }
    }, this);

    return json;
  },

  /**
   `serializeAttribute` can be used to customize how `DS.attr`
   properties are serialized

   For example if you wanted to ensure all you attributes were always
   serialized as properties on an `attributes` object you could
   write:

   ```javascript
   App.ApplicationSerializer = DS.JSONSerializer.extend({
     serializeAttribute: function(record, json, key, attributes) {
       json.attributes = json.attributes || {};
       this._super(record, json.attributes, key, attributes);
     }
   });
   ```

   @method serializeAttribute
   @param {DS.Model} record
   @param {Object} json
   @param {String} key
   @param {Object} attribute
  */
  serializeAttribute: function(record, json, key, attribute) {
    var attrs = get(this, 'attrs');
    var value = get(record, key), type = attribute.type;

    if (type) {
      var transform = this.transformFor(type);
      value = transform.serialize(value);
    }

    // if provided, use the mapping provided by `attrs` in
    // the serializer
    key = attrs && attrs[key] || (this.keyForAttribute ? this.keyForAttribute(key) : key);

    json[key] = value;
  },

  /**
   `serializeBelongsTo` can be used to customize how `DS.belongsTo`
   properties are serialized.

   Example

   ```javascript
   App.PostSerializer = DS.JSONSerializer.extend({
     serializeBelongsTo: function(record, json, relationship) {
       var key = relationship.key;

       var belongsTo = get(record, key);

       key = this.keyForRelationship ? this.keyForRelationship(key, "belongsTo") : key;

       json[key] = Ember.isNone(belongsTo) ? belongsTo : belongsTo.toJSON();
     }
   });
   ```

   @method serializeBelongsTo
   @param {DS.Model} record
   @param {Object} json
   @param {Object} relationship
  */
  serializeBelongsTo: function(record, json, relationship) {
    var key = relationship.key;

    var belongsTo = get(record, key);

    key = this.keyForRelationship ? this.keyForRelationship(key, "belongsTo") : key;

    if (isNone(belongsTo)) {
      json[key] = belongsTo;
    } else {
      json[key] = get(belongsTo, 'id');
    }

    if (relationship.options.polymorphic) {
      this.serializePolymorphicType(record, json, relationship);
    }
  },

  /**
   `serializeHasMany` can be used to customize how `DS.hasMany`
   properties are serialized.

   Example

   ```javascript
   App.PostSerializer = DS.JSONSerializer.extend({
     serializeHasMany: function(record, json, relationship) {
       var key = relationship.key;
       if (key === 'comments') {
         return;
       } else {
         this._super.apply(this, arguments);
       }
     }
   });
   ```

   @method serializeHasMany
   @param {DS.Model} record
   @param {Object} json
   @param {Object} relationship
  */
  serializeHasMany: function(record, json, relationship) {
    var key = relationship.key;

    var relationshipType = DS.RelationshipChange.determineRelationshipType(record.constructor, relationship);

    if (relationshipType === 'manyToNone' || relationshipType === 'manyToMany') {
      json[key] = get(record, key).mapBy('id');
      // TODO support for polymorphic manyToNone and manyToMany relationships
    }
  },

  /**
    You can use this method to customize how polymorphic objects are
    serialized. Objects are considered to be polymorphic if
    `{polymorphic: true}` is pass as the second argument to the
    `DS.belongsTo` function.

    Example

    ```javascript
    App.CommentSerializer = DS.JSONSerializer.extend({
      serializePolymorphicType: function(record, json, relationship) {
        var key = relationship.key,
            belongsTo = get(record, key);
        key = this.keyForAttribute ? this.keyForAttribute(key) : key;
        json[key + "_type"] = belongsTo.constructor.typeKey;
      }
    });
   ```

    @method serializePolymorphicType
    @param {DS.Model} record
    @param {Object} json
    @param {Object} relationship
  */
  serializePolymorphicType: Ember.K,

  // EXTRACT

  /**
    The `extract` method is used to deserialize payload data from the
    server. By default the `JSONSerializer` does not push the records
    into the store. However records that subclass `JSONSerializer`
    such as the `RESTSerializer` may push records into the store as
    part of the extract call.

    This method deletegates to a more specific extract method based on
    the `requestType`.

    Example

    ```javascript
    var get = Ember.get;
    socket.on('message', function(message) {
      var modelName = message.model;
      var data = message.data;
      var type = store.modelFor(modelName);
      var serializer = store.serializerFor(type.typeKey);
      var record = serializer.extract(store, type, data, get(data, 'id'), 'single');
      store.push(modelName, record);
    });
    ```

    @method extract
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} payload
    @param {String or Number} id
    @param {String} requestType
    @return {Object} json The deserialized payload
  */
  extract: function(store, type, payload, id, requestType) {
    this.extractMeta(store, type, payload);

    var specificExtract = "extract" + requestType.charAt(0).toUpperCase() + requestType.substr(1);
    return this[specificExtract](store, type, payload, id, requestType);
  },

  /**
    `extractFindAll` is a hook into the extract method used when a
    call is made to `DS.Store#findAll`. By default this method is an
    alias for [extractArray](#method_extractArray).

    @method extractFindAll
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} payload
    @return {Array} array An array of deserialized objects
  */
  extractFindAll: aliasMethod('extractArray'),
  /**
    `extractFindQuery` is a hook into the extract method used when a
    call is made to `DS.Store#findQuery`. By default this method is an
    alias for [extractArray](#method_extractArray).

    @method extractFindQuery
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} payload
    @return {Array} array An array of deserialized objects
  */
  extractFindQuery: aliasMethod('extractArray'),
  /**
    `extractFindMany` is a hook into the extract method used when a
    call is made to `DS.Store#findMany`. By default this method is
    alias for [extractArray](#method_extractArray).

    @method extractFindMany
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} payload
    @return {Array} array An array of deserialized objects
  */
  extractFindMany: aliasMethod('extractArray'),
  /**
    `extractFindHasMany` is a hook into the extract method used when a
    call is made to `DS.Store#findHasMany`. By default this method is
    alias for [extractArray](#method_extractArray).

    @method extractFindHasMany
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} payload
    @return {Array} array An array of deserialized objects
  */
  extractFindHasMany: aliasMethod('extractArray'),

  /**
    `extractCreateRecord` is a hook into the extract method used when a
    call is made to `DS.Store#createRecord`. By default this method is
    alias for [extractSave](#method_extractSave).

    @method extractCreateRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} payload
    @return {Object} json The deserialized payload
  */
  extractCreateRecord: aliasMethod('extractSave'),
  /**
    `extractUpdateRecord` is a hook into the extract method used when
    a call is made to `DS.Store#update`. By default this method is alias
    for [extractSave](#method_extractSave).

    @method extractUpdateRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} payload
    @return {Object} json The deserialized payload
  */
  extractUpdateRecord: aliasMethod('extractSave'),
  /**
    `extractDeleteRecord` is a hook into the extract method used when
    a call is made to `DS.Store#deleteRecord`. By default this method is
    alias for [extractSave](#method_extractSave).

    @method extractDeleteRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} payload
    @return {Object} json The deserialized payload
  */
  extractDeleteRecord: aliasMethod('extractSave'),

  /**
    `extractFind` is a hook into the extract method used when
    a call is made to `DS.Store#find`. By default this method is
    alias for [extractSingle](#method_extractSingle).

    @method extractFind
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} payload
    @return {Object} json The deserialized payload
  */
  extractFind: aliasMethod('extractSingle'),
  /**
    `extractFindBelongsTo` is a hook into the extract method used when
    a call is made to `DS.Store#findBelongsTo`. By default this method is
    alias for [extractSingle](#method_extractSingle).

    @method extractFindBelongsTo
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} payload
    @return {Object} json The deserialized payload
  */
  extractFindBelongsTo: aliasMethod('extractSingle'),
  /**
    `extractSave` is a hook into the extract method used when a call
    is made to `DS.Model#save`. By default this method is alias
    for [extractSingle](#method_extractSingle).

    @method extractSave
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} payload
    @return {Object} json The deserialized payload
  */
  extractSave: aliasMethod('extractSingle'),

  /**
    `extractSingle` is used to deserialize a single record returned
    from the adapter.

    Example

    ```javascript
    App.PostSerializer = DS.JSONSerializer.extend({
      extractSingle: function(store, type, payload) {
        payload.comments = payload._embedded.comment;
        delete payload._embedded;

        return this._super(store, type, payload);
      },
    });
    ```

    @method extractSingle
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} payload
    @return {Object} json The deserialized payload
  */
  extractSingle: function(store, type, payload) {
    return this.normalize(type, payload);
  },

  /**
    `extractArray` is used to deserialize an array of records
    returned from the adapter.

    Example

    ```javascript
    App.PostSerializer = DS.JSONSerializer.extend({
      extractArray: function(store, type, payload) {
        return payload.map(function(json) {
          return this.extractSingle(json);
        }, this);
      }
    });
    ```

    @method extractArray
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} payload
    @return {Array} array An array of deserialized objects
  */
  extractArray: function(store, type, payload) {
    return this.normalize(type, payload);
  },

  /**
    `extractMeta` is used to deserialize any meta information in the
    adapter payload. By default Ember Data expects meta information to
    be located on the `meta` property of the payload object.

    Example

    ```javascript
    App.PostSerializer = DS.JSONSerializer.extend({
      extractMeta: function(store, type, payload) {
        if (payload && payload._pagination) {
          store.metaForType(type, payload._pagination);
          delete payload._pagination;
        }
      }
    });
    ```

    @method extractMeta
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {Object} payload
  */
  extractMeta: function(store, type, payload) {
    if (payload && payload.meta) {
      store.metaForType(type, payload.meta);
      delete payload.meta;
    }
  },

  /**
   `keyForAttribute` can be used to define rules for how to convert an
   attribute name in your model to a key in your JSON.

   Example

   ```javascript
   App.ApplicationSerializer = DS.RESTSerializer.extend({
     keyForAttribute: function(attr) {
       return Ember.String.underscore(attr).toUpperCase();
     }
   });
   ```

   @method keyForAttribute
   @param {String} key
   @return {String} normalized key
  */


  /**
   `keyForRelationship` can be used to define a custom key when
   serializeing relationship properties. By default `JSONSerializer`
   does not provide an implementation of this method.

   Example

    ```javascript
    App.PostSerializer = DS.JSONSerializer.extend({
      keyForRelationship: function(key, relationship) {
         return 'rel_' + Ember.String.underscore(key);
      }
    });
    ```

   @method keyForRelationship
   @param {String} key
   @param {String} relationship type
   @return {String} normalized key
  */

  // HELPERS

  /**
   @method transformFor
   @private
   @param {String} attributeType
   @param {Boolean} skipAssertion
   @return {DS.Transform} transform
  */
  transformFor: function(attributeType, skipAssertion) {
    var transform = this.container.lookup('transform:' + attributeType);
    Ember.assert("Unable to find transform for '" + attributeType + "'", skipAssertion || !!transform);
    return transform;
  }
});

})();



(function() {
/**
  @module ember-data
*/
var get = Ember.get, capitalize = Ember.String.capitalize, underscore = Ember.String.underscore, DS = window.DS ;

/**
  Extend `Ember.DataAdapter` with ED specific code.

  @class DebugAdapter
  @namespace DS
  @extends Ember.DataAdapter
  @private
*/
DS.DebugAdapter = Ember.DataAdapter.extend({
  getFilters: function() {
    return [
      { name: 'isNew', desc: 'New' },
      { name: 'isModified', desc: 'Modified' },
      { name: 'isClean', desc: 'Clean' }
    ];
  },

  detect: function(klass) {
    return klass !== DS.Model && DS.Model.detect(klass);
  },

  columnsForType: function(type) {
    var columns = [{ name: 'id', desc: 'Id' }], count = 0, self = this;
    get(type, 'attributes').forEach(function(name, meta) {
        if (count++ > self.attributeLimit) { return false; }
        var desc = capitalize(underscore(name).replace('_', ' '));
        columns.push({ name: name, desc: desc });
    });
    return columns;
  },

  getRecords: function(type) {
    return this.get('store').all(type);
  },

  getRecordColumnValues: function(record) {
    var self = this, count = 0,
        columnValues = { id: get(record, 'id') };

    record.eachAttribute(function(key) {
      if (count++ > self.attributeLimit) {
        return false;
      }
      var value = get(record, key);
      columnValues[key] = value;
    });
    return columnValues;
  },

  getRecordKeywords: function(record) {
    var keywords = [], keys = Ember.A(['id']);
    record.eachAttribute(function(key) {
      keys.push(key);
    });
    keys.forEach(function(key) {
      keywords.push(get(record, key));
    });
    return keywords;
  },

  getRecordFilterValues: function(record) {
    return {
      isNew: record.get('isNew'),
      isModified: record.get('isDirty') && !record.get('isNew'),
      isClean: !record.get('isDirty')
    };
  },

  getRecordColor: function(record) {
    var color = 'black';
    if (record.get('isNew')) {
      color = 'green';
    } else if (record.get('isDirty')) {
      color = 'blue';
    }
    return color;
  },

  observeRecord: function(record, recordUpdated) {
    var releaseMethods = Ember.A(), self = this,
        keysToObserve = Ember.A(['id', 'isNew', 'isDirty']);

    record.eachAttribute(function(key) {
      keysToObserve.push(key);
    });

    keysToObserve.forEach(function(key) {
      var handler = function() {
        recordUpdated(self.wrapRecord(record));
      };
      Ember.addObserver(record, key, handler);
      releaseMethods.push(function() {
        Ember.removeObserver(record, key, handler);
      });
    });

    var release = function() {
      releaseMethods.forEach(function(fn) { fn(); } );
    };

    return release;
  }

});

})();



(function() {
/**
  The `DS.Transform` class is used to serialize and deserialize model
  attributes when they are saved or loaded from an
  adapter. Subclassing `DS.Transform` is useful for creating custom
  attributes. All subclasses of `DS.Transform` must implement a
  `serialize` and a `deserialize` method.

  Example

  ```javascript
  App.RawTransform = DS.Transform.extend({
    deserialize: function(serialized) {
      return serialized;
    },
    serialize: function(deserialized) {
      return deserialized;
    }
  });
  ```

  Usage

  ```javascript
  var attr = DS.attr;
  App.Requirement = DS.Model.extend({
    name: attr('string'),
    optionsArray: attr('raw')
  });
  ```

  @class Transform
  @namespace DS
 */
DS.Transform = Ember.Object.extend({
  /**
    When given a deserialized value from a record attribute this
    method must return the serialized value.

    Example

    ```javascript
    serialize: function(deserialized) {
      return Ember.isEmpty(deserialized) ? null : Number(deserialized);
    }
    ```

    @method serialize
    @param deserialized The deserialized value
    @return The serialized value
  */
  serialize: Ember.required(),

  /**
    When given a serialize value from a JSON object this method must
    return the deserialized value for the record attribute.

    Example

    ```javascript
    deserialize: function(serialized) {
      return empty(serialized) ? null : Number(serialized);
    }
    ```

    @method deserialize
    @param serialized The serialized value
    @return The deserialized value
  */
  deserialize: Ember.required()

});

})();



(function() {

/**
  The `DS.BooleanTransform` class is used to serialize and deserialize
  boolean attributes on Ember Data record objects. This transform is
  used when `boolean` is passed as the type parameter to the
  [DS.attr](../../data#method_attr) function.

  Usage

  ```javascript
  var attr = DS.attr;
  App.User = DS.Model.extend({
    isAdmin: attr('boolean'),
    name: attr('string'),
    email: attr('string')
  });
  ```

  @class BooleanTransform
  @extends DS.Transform
  @namespace DS
 */
DS.BooleanTransform = DS.Transform.extend({
  deserialize: function(serialized) {
    var type = typeof serialized;

    if (type === "boolean") {
      return serialized;
    } else if (type === "string") {
      return serialized.match(/^true$|^t$|^1$/i) !== null;
    } else if (type === "number") {
      return serialized === 1;
    } else {
      return false;
    }
  },

  serialize: function(deserialized) {
    return Boolean(deserialized);
  }
});

})();



(function() {
/**
  The `DS.DateTransform` class is used to serialize and deserialize
  date attributes on Ember Data record objects. This transform is used
  when `date` is passed as the type parameter to the
  [DS.attr](../../data#method_attr) function.

  ```javascript
  var attr = DS.attr;
  App.Score = DS.Model.extend({
    value: attr('number'),
    player: DS.belongsTo('player'),
    date: attr('date')
  });
  ```

  @class DateTransform
  @extends DS.Transform
  @namespace DS
 */
DS.DateTransform = DS.Transform.extend({

  deserialize: function(serialized) {
    var type = typeof serialized;

    if (type === "string") {
      return new Date(Ember.Date.parse(serialized));
    } else if (type === "number") {
      return new Date(serialized);
    } else if (serialized === null || serialized === undefined) {
      // if the value is not present in the data,
      // return undefined, not null.
      return serialized;
    } else {
      return null;
    }
  },

  serialize: function(date) {
    if (date instanceof Date) {
      var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      var pad = function(num) {
        return num < 10 ? "0"+num : ""+num;
      };

      var utcYear = date.getUTCFullYear(),
          utcMonth = date.getUTCMonth(),
          utcDayOfMonth = date.getUTCDate(),
          utcDay = date.getUTCDay(),
          utcHours = date.getUTCHours(),
          utcMinutes = date.getUTCMinutes(),
          utcSeconds = date.getUTCSeconds();


      var dayOfWeek = days[utcDay];
      var dayOfMonth = pad(utcDayOfMonth);
      var month = months[utcMonth];

      return dayOfWeek + ", " + dayOfMonth + " " + month + " " + utcYear + " " +
             pad(utcHours) + ":" + pad(utcMinutes) + ":" + pad(utcSeconds) + " GMT";
    } else {
      return null;
    }
  } 

});

})();



(function() {
var empty = Ember.isEmpty;
/**
  The `DS.NumberTransform` class is used to serialize and deserialize
  numeric attributes on Ember Data record objects. This transform is
  used when `number` is passed as the type parameter to the
  [DS.attr](../../data#method_attr) function.

  Usage

  ```javascript
  var attr = DS.attr;
  App.Score = DS.Model.extend({
    value: attr('number'),
    player: DS.belongsTo('player'),
    date: attr('date')
  });
  ```

  @class NumberTransform
  @extends DS.Transform
  @namespace DS
 */
DS.NumberTransform = DS.Transform.extend({

  deserialize: function(serialized) {
    return empty(serialized) ? null : Number(serialized);
  },

  serialize: function(deserialized) {
    return empty(deserialized) ? null : Number(deserialized);
  }
});

})();



(function() {
var none = Ember.isNone;

/**
  The `DS.StringTransform` class is used to serialize and deserialize
  string attributes on Ember Data record objects. This transform is
  used when `string` is passed as the type parameter to the
  [DS.attr](../../data#method_attr) function.

  Usage

  ```javascript
  var attr = DS.attr;
  App.User = DS.Model.extend({
    isAdmin: attr('boolean'),
    name: attr('string'),
    email: attr('string')
  });
  ```

  @class StringTransform
  @extends DS.Transform
  @namespace DS
 */
DS.StringTransform = DS.Transform.extend({

  deserialize: function(serialized) {
    return none(serialized) ? null : String(serialized);
  },

  serialize: function(deserialized) {
    return none(deserialized) ? null : String(deserialized);
  }

});

})();



(function() {

})();



(function() {
/**
  @module ember-data
*/

var set = Ember.set;

/*
  This code registers an injection for Ember.Application.

  If an Ember.js developer defines a subclass of DS.Store on their application,
  this code will automatically instantiate it and make it available on the
  router.

  Additionally, after an application's controllers have been injected, they will
  each have the store made available to them.

  For example, imagine an Ember.js application with the following classes:

  App.Store = DS.Store.extend({
    adapter: 'custom'
  });

  App.PostsController = Ember.ArrayController.extend({
    // ...
  });

  When the application is initialized, `App.Store` will automatically be
  instantiated, and the instance of `App.PostsController` will have its `store`
  property set to that instance.

  Note that this code will only be run if the `ember-application` package is
  loaded. If Ember Data is being used in an environment other than a
  typical application (e.g., node.js where only `ember-runtime` is available),
  this code will be ignored.
*/

Ember.onLoad('Ember.Application', function(Application) {
  Application.initializer({
    name: "store",

    initialize: function(container, application) {
      application.register('store:main', application.Store || DS.Store);
      application.register('serializer:_default', DS.JSONSerializer);
      application.register('serializer:_rest', DS.RESTSerializer);
      application.register('adapter:_rest', DS.RESTAdapter);

      // Eagerly generate the store so defaultStore is populated.
      // TODO: Do this in a finisher hook
      container.lookup('store:main');
    }
  });

  Application.initializer({
    name: "transforms",
    before: "store",

    initialize: function(container, application) {
      application.register('transform:boolean', DS.BooleanTransform);
      application.register('transform:date', DS.DateTransform);
      application.register('transform:number', DS.NumberTransform);
      application.register('transform:string', DS.StringTransform);
    }
  });

  Application.initializer({
    name: "dataAdapter",
    before: "store",

    initialize: function(container, application) {
      application.register('dataAdapter:main', DS.DebugAdapter);
    }
  });

  Application.initializer({
    name: "injectStore",
    before: "store",

    initialize: function(container, application) {
      application.inject('controller', 'store', 'store:main');
      application.inject('route', 'store', 'store:main');
      application.inject('serializer', 'store', 'store:main');
      application.inject('dataAdapter', 'store', 'store:main');
    }
  });

});

})();



(function() {
/**
  @module ember-data
*/

/**
  Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>

  © 2011 Colin Snover <http://zetafleet.com>

  Released under MIT license.

  @class Date
  @namespace Ember
  @static
*/
Ember.Date = Ember.Date || {};

var origParse = Date.parse, numericKeys = [ 1, 4, 5, 6, 7, 10, 11 ];

/**
  @method parse
  @param date
*/
Ember.Date.parse = function (date) {
    var timestamp, struct, minutesOffset = 0;

    // ES5 §15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
    // before falling back to any implementation-specific date parsing, so that’s what we do, even if native
    // implementations could be faster
    //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
    if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
        // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
        for (var i = 0, k; (k = numericKeys[i]); ++i) {
            struct[k] = +struct[k] || 0;
        }

        // allow undefined days and months
        struct[2] = (+struct[2] || 1) - 1;
        struct[3] = +struct[3] || 1;

        if (struct[8] !== 'Z' && struct[9] !== undefined) {
            minutesOffset = struct[10] * 60 + struct[11];

            if (struct[9] === '+') {
                minutesOffset = 0 - minutesOffset;
            }
        }

        timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
    }
    else {
        timestamp = origParse ? origParse(date) : NaN;
    }

    return timestamp;
};

if (Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.Date) {
  Date.parse = Ember.Date.parse;
}

})();



(function() {

})();



(function() {
/**
  @module ember-data
*/

var get = Ember.get, set = Ember.set;

/**
  A record array is an array that contains records of a certain type. The record
  array materializes records as needed when they are retrieved for the first
  time. You should not create record arrays yourself. Instead, an instance of
  `DS.RecordArray` or its subclasses will be returned by your application's store
  in response to queries.

  @class RecordArray
  @namespace DS
  @extends Ember.ArrayProxy
  @uses Ember.Evented
*/

DS.RecordArray = Ember.ArrayProxy.extend(Ember.Evented, {
  /**
    The model type contained by this record array.

    @property type
    @type DS.Model
  */
  type: null,

  /**
    The array of client ids backing the record array. When a
    record is requested from the record array, the record
    for the client id at the same index is materialized, if
    necessary, by the store.

    @property content
    @private
    @type Ember.Array
  */
  content: null,

  /**
    The flag to signal a `RecordArray` is currently loading data.

    Example

    ```javascript
    var people = store.all(App.Person);
    people.get('isLoaded'); // true
    ```

    @property isLoaded
    @type Boolean
  */
  isLoaded: false,
  /**
    The flag to signal a `RecordArray` is currently loading data.

    Example

    ```javascript
    var people = store.all(App.Person);
    people.get('isUpdating'); // false
    people.update();
    people.get('isUpdating'); // true
    ```

    @property isUpdating
    @type Boolean
  */
  isUpdating: false,

  /**
    The store that created this record array.

    @property store
    @private
    @type DS.Store
  */
  store: null,

  /**
    Retrieves an object from the content by index.

    @method objectAtContent
    @private
    @param {Number} index
    @return {DS.Model} record
  */
  objectAtContent: function(index) {
    var content = get(this, 'content');

    return content.objectAt(index);
  },

  /**
    Used to get the latest version of all of the records in this array
    from the adapter.

    Example

    ```javascript
    var people = store.all(App.Person);
    people.get('isUpdating'); // false
    people.update();
    people.get('isUpdating'); // true
    ```

    @method update
  */
  update: function() {
    if (get(this, 'isUpdating')) { return; }

    var store = get(this, 'store'),
        type = get(this, 'type');

    store.fetchAll(type, this);
  },

  /**
    Adds a record to the `RecordArray`.

    @method addRecord
    @private
    @param {DS.Model} record
  */
  addRecord: function(record) {
    get(this, 'content').addObject(record);
  },

  /**
    Removes a record to the `RecordArray`.

    @method removeRecord
    @private
    @param {DS.Model} record
  */
  removeRecord: function(record) {
    get(this, 'content').removeObject(record);
  },

  /**
    Saves all of the records in the `RecordArray`.

    Example

    ```javascript
    var messages = store.all(App.Message);
    messages.forEach(function(message) {
      message.set('hasBeenSeen', true);
    });
    messages.save();
    ```

    @method save
    @return {DS.PromiseArray} promise
  */
  save: function() {
    var promiseLabel = "DS: RecordArray#save " + get(this, 'type');
    var promise = Ember.RSVP.all(this.invoke("save"), promiseLabel).then(function(array) {
      return Ember.A(array);
    }, null, "DS: RecordArray#save apply Ember.NativeArray");

    return DS.PromiseArray.create({ promise: promise });
  }
});

})();



(function() {
/**
  @module ember-data
*/

var get = Ember.get;

/**
  Represents a list of records whose membership is determined by the
  store. As records are created, loaded, or modified, the store
  evaluates them to determine if they should be part of the record
  array.

  @class FilteredRecordArray
  @namespace DS
  @extends DS.RecordArray
*/
DS.FilteredRecordArray = DS.RecordArray.extend({
  /**
    The filterFunction is a function used to test records from the store to
    determine if they should be part of the record array.

    Example

    ```javascript
    var allPeople = store.all('person');
    allPeople.mapBy('name'); // ["Tom Dale", "Yehuda Katz", "Trek Glowacki"]

    var people = store.filter('person', function(person) {
      if (person.get('name').match(/Katz$/)) { return true; }
    });
    people.mapBy('name'); // ["Yehuda Katz"]

    var notKatzFilter = function(person) {
      return !person.get('name').match(/Katz$/);
    };
    people.set('filterFunction', notKatzFilter);
    people.mapBy('name'); // ["Tom Dale", "Trek Glowacki"]
    ```

    @method filterFunction
    @param {DS.Model} record
    @return {Boolean} `true` if the record should be in the array
  */
  filterFunction: null,
  isLoaded: true,

  replace: function() {
    var type = get(this, 'type').toString();
    throw new Error("The result of a client-side filter (on " + type + ") is immutable.");
  },

  /**
    @method updateFilter
    @private
  */
  updateFilter: Ember.observer(function() {
    var manager = get(this, 'manager');
    manager.updateFilter(this, get(this, 'type'), get(this, 'filterFunction'));
  }, 'filterFunction')
});

})();



(function() {
/**
  @module ember-data
*/

var get = Ember.get, set = Ember.set;

/**
  Represents an ordered list of records whose order and membership is
  determined by the adapter. For example, a query sent to the adapter
  may trigger a search on the server, whose results would be loaded
  into an instance of the `AdapterPopulatedRecordArray`.

  @class AdapterPopulatedRecordArray
  @namespace DS
  @extends DS.RecordArray
*/
DS.AdapterPopulatedRecordArray = DS.RecordArray.extend({
  query: null,

  replace: function() {
    var type = get(this, 'type').toString();
    throw new Error("The result of a server query (on " + type + ") is immutable.");
  },

  /**
    @method load
    @private
    @param {Array} data
  */
  load: function(data) {
    var store = get(this, 'store'),
        type = get(this, 'type'),
        records = store.pushMany(type, data),
        meta = store.metadataFor(type);

    this.setProperties({
      content: Ember.A(records),
      isLoaded: true,
      meta: meta
    });

    // TODO: does triggering didLoad event should be the last action of the runLoop?
    Ember.run.once(this, 'trigger', 'didLoad');
  }
});

})();



(function() {
/**
  @module ember-data
*/

var get = Ember.get, set = Ember.set;
var map = Ember.EnumerableUtils.map;

/**
  A `ManyArray` is a `RecordArray` that represents the contents of a has-many
  relationship.

  The `ManyArray` is instantiated lazily the first time the relationship is
  requested.

  ### Inverses

  Often, the relationships in Ember Data applications will have
  an inverse. For example, imagine the following models are
  defined:

  ```javascript
  App.Post = DS.Model.extend({
    comments: DS.hasMany('comment')
  });

  App.Comment = DS.Model.extend({
    post: DS.belongsTo('post')
  });
  ```

  If you created a new instance of `App.Post` and added
  a `App.Comment` record to its `comments` has-many
  relationship, you would expect the comment's `post`
  property to be set to the post that contained
  the has-many.

  We call the record to which a relationship belongs the
  relationship's _owner_.

  @class ManyArray
  @namespace DS
  @extends DS.RecordArray
*/
DS.ManyArray = DS.RecordArray.extend({
  init: function() {
    this._super.apply(this, arguments);
    this._changesToSync = Ember.OrderedSet.create();
  },

  /**
    The property name of the relationship

    @property {String} name
    @private
  */
  name: null,

  /**
    The record to which this relationship belongs.

    @property {DS.Model} owner
    @private
  */
  owner: null,

  /**
    `true` if the relationship is polymorphic, `false` otherwise.

    @property {Boolean} isPolymorphic
    @private
  */
  isPolymorphic: false,

  // LOADING STATE

  isLoaded: false,

  /**
    Used for async `hasMany` arrays
    to keep track of when they will resolve.

    @property {Ember.RSVP.Promise} promise
    @private
  */
  promise: null,

  /**
    @method loadingRecordsCount
    @param {Number} count
    @private
  */
  loadingRecordsCount: function(count) {
    this.loadingRecordsCount = count;
  },

  /**
    @method loadedRecord
    @private
  */
  loadedRecord: function() {
    this.loadingRecordsCount--;
    if (this.loadingRecordsCount === 0) {
      set(this, 'isLoaded', true);
      this.trigger('didLoad');
    }
  },

  /**
    @method fetch
    @private
  */
  fetch: function() {
    var records = get(this, 'content'),
        store = get(this, 'store'),
        owner = get(this, 'owner'),
        resolver = Ember.RSVP.defer("DS: ManyArray#fetch " + get(this, 'type'));

    var unloadedRecords = records.filterProperty('isEmpty', true);
    store.fetchMany(unloadedRecords, owner, resolver);
  },

  // Overrides Ember.Array's replace method to implement
  replaceContent: function(index, removed, added) {
    // Map the array of record objects into an array of  client ids.
    added = map(added, function(record) {
      Ember.assert("You cannot add '" + record.constructor.typeKey + "' records to this relationship (only '" + this.type.typeKey + "' allowed)", !this.type || record instanceof this.type);
      return record;
    }, this);

    this._super(index, removed, added);
  },

  arrangedContentDidChange: function() {
    Ember.run.once(this, 'fetch');
  },

  arrayContentWillChange: function(index, removed, added) {
    var owner = get(this, 'owner'),
        name = get(this, 'name');

    if (!owner._suspendedRelationships) {
      // This code is the first half of code that continues inside
      // of arrayContentDidChange. It gets or creates a change from
      // the child object, adds the current owner as the old
      // parent if this is the first time the object was removed
      // from a ManyArray, and sets `newParent` to null.
      //
      // Later, if the object is added to another ManyArray,
      // the `arrayContentDidChange` will set `newParent` on
      // the change.
      for (var i=index; i<index+removed; i++) {
        var record = get(this, 'content').objectAt(i);

        var change = DS.RelationshipChange.createChange(owner, record, get(this, 'store'), {
          parentType: owner.constructor,
          changeType: "remove",
          kind: "hasMany",
          key: name
        });

        this._changesToSync.add(change);
      }
    }

    return this._super.apply(this, arguments);
  },

  arrayContentDidChange: function(index, removed, added) {
    this._super.apply(this, arguments);

    var owner = get(this, 'owner'),
        name = get(this, 'name'),
        store = get(this, 'store');

    if (!owner._suspendedRelationships) {
      // This code is the second half of code that started in
      // `arrayContentWillChange`. It gets or creates a change
      // from the child object, and adds the current owner as
      // the new parent.
      for (var i=index; i<index+added; i++) {
        var record = get(this, 'content').objectAt(i);

        var change = DS.RelationshipChange.createChange(owner, record, store, {
          parentType: owner.constructor,
          changeType: "add",
          kind:"hasMany",
          key: name
        });
        change.hasManyName = name;

        this._changesToSync.add(change);
      }

      // We wait until the array has finished being
      // mutated before syncing the OneToManyChanges created
      // in arrayContentWillChange, so that the array
      // membership test in the sync() logic operates
      // on the final results.
      this._changesToSync.forEach(function(change) {
        change.sync();
      });

      this._changesToSync.clear();
    }
  },

  /**
    Create a child record within the owner

    @method createRecord
    @private
    @param {Object} hash
    @return {DS.Model} record
  */
  createRecord: function(hash) {
    var owner = get(this, 'owner'),
        store = get(owner, 'store'),
        type = get(this, 'type'),
        record;

    Ember.assert("You cannot add '" + type.typeKey + "' records to this polymorphic relationship.", !get(this, 'isPolymorphic'));

    record = store.createRecord.call(store, type, hash);
    this.pushObject(record);

    return record;
  }

});

})();



(function() {
/**
  @module ember-data
*/

})();



(function() {
/*globals Ember*/
/*jshint eqnull:true*/
/**
  @module ember-data
*/

var get = Ember.get, set = Ember.set;
var once = Ember.run.once;
var isNone = Ember.isNone;
var forEach = Ember.EnumerableUtils.forEach;
var indexOf = Ember.EnumerableUtils.indexOf;
var map = Ember.EnumerableUtils.map;
var resolve = Ember.RSVP.resolve;
var copy = Ember.copy;

// Implementors Note:
//
//   The variables in this file are consistently named according to the following
//   scheme:
//
//   * +id+ means an identifier managed by an external source, provided inside
//     the data provided by that source. These are always coerced to be strings
//     before being used internally.
//   * +clientId+ means a transient numerical identifier generated at runtime by
//     the data store. It is important primarily because newly created objects may
//     not yet have an externally generated id.
//   * +reference+ means a record reference object, which holds metadata about a
//     record, even if it has not yet been fully materialized.
//   * +type+ means a subclass of DS.Model.

// Used by the store to normalize IDs entering the store.  Despite the fact
// that developers may provide IDs as numbers (e.g., `store.find(Person, 1)`),
// it is important that internally we use strings, since IDs may be serialized
// and lose type information.  For example, Ember's router may put a record's
// ID into the URL, and if we later try to deserialize that URL and find the
// corresponding record, we will not know if it is a string or a number.
var coerceId = function(id) {
  return id == null ? null : id+'';
};

/**
  The store contains all of the data for records loaded from the server.
  It is also responsible for creating instances of `DS.Model` that wrap
  the individual data for a record, so that they can be bound to in your
  Handlebars templates.

  Define your application's store like this:

  ```javascript
  MyApp.Store = DS.Store.extend();
  ```

  Most Ember.js applications will only have a single `DS.Store` that is
  automatically created by their `Ember.Application`.

  You can retrieve models from the store in several ways. To retrieve a record
  for a specific id, use `DS.Store`'s `find()` method:

  ```javascript
  var person = store.find('person', 123);
  ```

  If your application has multiple `DS.Store` instances (an unusual case), you can
  specify which store should be used:

  ```javascript
  var person = store.find(App.Person, 123);
  ```

  By default, the store will talk to your backend using a standard
  REST mechanism. You can customize how the store talks to your
  backend by specifying a custom adapter:

  ```javascript
   MyApp.store = DS.Store.create({
     adapter: 'MyApp.CustomAdapter'
   });
   ```

  You can learn more about writing a custom adapter by reading the `DS.Adapter`
  documentation.

  @class Store
  @namespace DS
  @extends Ember.Object
*/
DS.Store = Ember.Object.extend({

  /**
    @method init
    @private
  */
  init: function() {
    // internal bookkeeping; not observable
    this.typeMaps = {};
    this.recordArrayManager = DS.RecordArrayManager.create({
      store: this
    });
    this._relationshipChanges = {};
    this._pendingSave = [];
  },

  /**
    The adapter to use to communicate to a backend server or other persistence layer.

    This can be specified as an instance, class, or string.

    If you want to specify `App.CustomAdapter` as a string, do:

    ```js
    adapter: 'custom'
    ```

    @property adapter
    @default DS.RESTAdapter
    @type {DS.Adapter|String}
  */
  adapter: '_rest',

  /**
    Returns a JSON representation of the record using a custom
    type-specific serializer, if one exists.

    The available options are:

    * `includeId`: `true` if the record's ID should be included in
      the JSON representation

    @method serialize
    @private
    @param {DS.Model} record the record to serialize
    @param {Object} options an options hash
  */
  serialize: function(record, options) {
    return this.serializerFor(record.constructor.typeKey).serialize(record, options);
  },

  /**
    This property returns the adapter, after resolving a possible
    string key.

    If the supplied `adapter` was a class, or a String property
    path resolved to a class, this property will instantiate the
    class.

    This property is cacheable, so the same instance of a specified
    adapter class should be used for the lifetime of the store.

    @property defaultAdapter
    @private
    @returns DS.Adapter
  */
  defaultAdapter: Ember.computed('adapter', function() {
    var adapter = get(this, 'adapter');

    Ember.assert('You tried to set `adapter` property to an instance of `DS.Adapter`, where it should be a name or a factory', !(adapter instanceof DS.Adapter));

    if (typeof adapter === 'string') {
      adapter = this.container.lookup('adapter:' + adapter) || this.container.lookup('adapter:application') || this.container.lookup('adapter:_rest');
    }

    if (DS.Adapter.detect(adapter)) {
      adapter = adapter.create({ container: this.container });
    }

    return adapter;
  }),

  // .....................
  // . CREATE NEW RECORD .
  // .....................

  /**
    Create a new record in the current store. The properties passed
    to this method are set on the newly created record.

    To create a new instance of `App.Post`:

    ```js
    store.createRecord('post', {
      title: "Rails is omakase"
    });
    ```

    @method createRecord
    @param {String} type
    @param {Object} properties a hash of properties to set on the
      newly created record.
    @returns {DS.Model} record
  */
  createRecord: function(type, properties) {
    type = this.modelFor(type);

    properties = copy(properties) || {};

    // If the passed properties do not include a primary key,
    // give the adapter an opportunity to generate one. Typically,
    // client-side ID generators will use something like uuid.js
    // to avoid conflicts.

    if (isNone(properties.id)) {
      properties.id = this._generateId(type);
    }

    // Coerce ID to a string
    properties.id = coerceId(properties.id);

    var record = this.buildRecord(type, properties.id);

    // Move the record out of its initial `empty` state into
    // the `loaded` state.
    record.loadedData();

    // Set the properties specified on the record.
    record.setProperties(properties);

    return record;
  },

  /**
    If possible, this method asks the adapter to generate an ID for
    a newly created record.

    @method _generateId
    @private
    @param {String} type
    @returns {String} if the adapter can generate one, an ID
  */
  _generateId: function(type) {
    var adapter = this.adapterFor(type);

    if (adapter && adapter.generateIdForRecord) {
      return adapter.generateIdForRecord(this);
    }

    return null;
  },

  // .................
  // . DELETE RECORD .
  // .................

  /**
    For symmetry, a record can be deleted via the store.

    Example

    ```javascript
    var post = store.createRecord('post', {
      title: "Rails is omakase"
    });

    store.deletedRecord(post);
    ```

    @method deleteRecord
    @param {DS.Model} record
  */
  deleteRecord: function(record) {
    record.deleteRecord();
  },

  /**
    For symmetry, a record can be unloaded via the store. Only
    non-dirty records can be unloaded.

    Example

    ```javascript
    store.find('post', 1).then(function(post) {
      store.unloadRecord(post);
    });
    ```

    @method unloadRecord
    @param {DS.Model} record
  */
  unloadRecord: function(record) {
    record.unloadRecord();
  },

  // ................
  // . FIND RECORDS .
  // ................

  /**
    This is the main entry point into finding records. The first parameter to
    this method is the model's name as a string.

    ---

    To find a record by ID, pass the `id` as the second parameter:

    ```javascript
    store.find('person', 1);
    ```

    The `find` method will always return a **promise** that will be resolved
    with the record. If the record was already in the store, the promise will
    be resolved immediately. Otherwise, the store will ask the adapter's `find`
    method to find the necessary data.

    The `find` method will always resolve its promise with the same object for
    a given type and `id`.

    ---

    To find all records for a type, call `find` with no additional parameters:

    ```javascript
    store.find('person');
    ```

    This will ask the adapter's `findAll` method to find the records for the
    given type, and return a promise that will be resolved once the server
    returns the values.

    ---

    To find a record by a query, call `find` with a hash as the second
    parameter:

    ```javascript
    store.find(App.Person, { page: 1 });
    ```

    This will ask the adapter's `findQuery` method to find the records for
    the query, and return a promise that will be resolved once the server
    responds.

    @method find
    @param {String or subclass of DS.Model} type
    @param {Object|String|Integer|null} id
    @return {Promise} promise
  */
  find: function(type, id) {
    if (id === undefined) {
      return this.findAll(type);
    }

    // We are passed a query instead of an id.
    if (Ember.typeOf(id) === 'object') {
      return this.findQuery(type, id);
    }

    return this.findById(type, coerceId(id));
  },

  /**
    This method returns a record for a given type and id combination.

    @method findById
    @private
    @param {String or subclass of DS.Model} type
    @param {String|Integer} id
    @return {Promise} promise
  */
  findById: function(type, id) {
    type = this.modelFor(type);

    var record = this.recordForId(type, id);

    var promise = this.fetchRecord(record) || resolve(record, "DS: Store#findById " + type + " with id: " + id);
    return promiseObject(promise);
  },

  /**
    This method makes a series of requests to the adapter's `find` method
    and returns a promise that resolves once they are all loaded.

    @private
    @method findByIds
    @param {String} type
    @param {Array} ids
    @returns {Promise} promise
  */
  findByIds: function(type, ids) {
    var store = this;
    var promiseLabel = "DS: Store#findByIds " + type;
    return promiseArray(Ember.RSVP.all(map(ids, function(id) {
      return store.findById(type, id);
    })).then(Ember.A, null, "DS: Store#findByIds of " + type + " complete"));
  },

  /**
    This method is called by `findById` if it discovers that a particular
    type/id pair hasn't been loaded yet to kick off a request to the
    adapter.

    @method fetchRecord
    @private
    @param {DS.Model} record
    @returns {Promise} promise
  */
  fetchRecord: function(record) {
    if (isNone(record)) { return null; }
    if (record._loadingPromise) { return record._loadingPromise; }
    if (!get(record, 'isEmpty')) { return null; }

    var type = record.constructor,
        id = get(record, 'id');

    var adapter = this.adapterFor(type);

    Ember.assert("You tried to find a record but you have no adapter (for " + type + ")", adapter);
    Ember.assert("You tried to find a record but your adapter (for " + type + ") does not implement 'find'", adapter.find);

    var promise = _find(adapter, this, type, id);
    record.loadingData(promise);
    return promise;
  },

  /**
    Get a record by a given type and ID without triggering a fetch.

    This method will synchronously return the record if it's available.
    Otherwise, it will return null.

    ```js
    var post = store.getById('post', 1);
    ```

    @method getById
    @param {String or subclass of DS.Model} type
    @param {String|Integer} id
    @param {DS.Model} record
  */
  getById: function(type, id) {
    if (this.hasRecordForId(type, id)) {
      return this.recordForId(type, id);
    } else {
      return null;
    }
  },

  /**
    This method is called by the record's `reload` method.

    This method calls the adapter's `find` method, which returns a promise. When
    **that** promise resolves, `reloadRecord` will resolve the promise returned
    by the record's `reload`.

    @method reloadRecord
    @private
    @param {DS.Model} record
    @return {Promise} promise
  */
  reloadRecord: function(record) {
    var type = record.constructor,
        adapter = this.adapterFor(type),
        id = get(record, 'id');

    Ember.assert("You cannot reload a record without an ID", id);
    Ember.assert("You tried to reload a record but you have no adapter (for " + type + ")", adapter);
    Ember.assert("You tried to reload a record but your adapter does not implement `find`", adapter.find);

    return _find(adapter, this, type, id);
  },

  /**
    This method takes a list of records, groups the records by type,
    converts the records into IDs, and then invokes the adapter's `findMany`
    method.

    The records are grouped by type to invoke `findMany` on adapters
    for each unique type in records.

    It is used both by a brand new relationship (via the `findMany`
    method) or when the data underlying an existing relationship
    changes.

    @method fetchMany
    @private
    @param {Array} records
    @param {DS.Model} owner
    @param {Resolver} resolver
  */
  fetchMany: function(records, owner, resolver) {
    if (!records.length) { return; }

    // Group By Type
    var recordsByTypeMap = Ember.MapWithDefault.create({
      defaultValue: function() { return Ember.A(); }
    });

    forEach(records, function(record) {
      recordsByTypeMap.get(record.constructor).push(record);
    });

    forEach(recordsByTypeMap, function(type, records) {
      var ids = records.mapProperty('id'),
          adapter = this.adapterFor(type);

      Ember.assert("You tried to load many records but you have no adapter (for " + type + ")", adapter);
      Ember.assert("You tried to load many records but your adapter does not implement `findMany`", adapter.findMany);

      resolver.resolve(_findMany(adapter, this, type, ids, owner));
    }, this);
  },

  /**
    Returns true if a record for a given type and ID is already loaded.

    @method hasRecordForId
    @param {String or subclass of DS.Model} type
    @param {String|Integer} id
    @returns {Boolean}
  */
  hasRecordForId: function(type, id) {
    id = coerceId(id);
    type = this.modelFor(type);
    return !!this.typeMapFor(type).idToRecord[id];
  },

  /**
    Returns id record for a given type and ID. If one isn't already loaded,
    it builds a new record and leaves it in the `empty` state.

    @method recordForId
    @private
    @param {String or subclass of DS.Model} type
    @param {String|Integer} id
    @returns {DS.Model} record
  */
  recordForId: function(type, id) {
    type = this.modelFor(type);

    id = coerceId(id);

    var record = this.typeMapFor(type).idToRecord[id];

    if (!record) {
      record = this.buildRecord(type, id);
    }

    return record;
  },

  /**
    @method findMany
    @private
    @param {DS.Model} owner
    @param {Array} records
    @param {String or subclass of DS.Model} type
    @param {Resolver} resolver
    @return {DS.ManyArray} records
  */
  findMany: function(owner, records, type, resolver) {
    type = this.modelFor(type);

    records = Ember.A(records);

    var unloadedRecords = records.filterProperty('isEmpty', true),
        manyArray = this.recordArrayManager.createManyArray(type, records);

    forEach(unloadedRecords, function(record) {
      record.loadingData();
    });

    manyArray.loadingRecordsCount = unloadedRecords.length;

    if (unloadedRecords.length) {
      forEach(unloadedRecords, function(record) {
        this.recordArrayManager.registerWaitingRecordArray(record, manyArray);
      }, this);

      this.fetchMany(unloadedRecords, owner, resolver);
    } else {
      if (resolver) { resolver.resolve(); }
      manyArray.set('isLoaded', true);
      Ember.run.once(manyArray, 'trigger', 'didLoad');
    }

    return manyArray;
  },

  /**
    If a relationship was originally populated by the adapter as a link
    (as opposed to a list of IDs), this method is called when the
    relationship is fetched.

    The link (which is usually a URL) is passed through unchanged, so the
    adapter can make whatever request it wants.

    The usual use-case is for the server to register a URL as a link, and
    then use that URL in the future to make a request for the relationship.

    @method findHasMany
    @private
    @param {DS.Model} owner
    @param {any} link
    @param {String or subclass of DS.Model} type
    @param {Resolver} resolver
    @return {DS.ManyArray}
  */
  findHasMany: function(owner, link, relationship, resolver) {
    var adapter = this.adapterFor(owner.constructor);

    Ember.assert("You tried to load a hasMany relationship but you have no adapter (for " + owner.constructor + ")", adapter);
    Ember.assert("You tried to load a hasMany relationship from a specified `link` in the original payload but your adapter does not implement `findHasMany`", adapter.findHasMany);

    var records = this.recordArrayManager.createManyArray(relationship.type, Ember.A([]));
    resolver.resolve(_findHasMany(adapter, this, owner, link, relationship));
    return records;
  },

  /**
    @method findBelongsTo
    @private
    @param {DS.Model} owner
    @param {any} link
    @param {Relationship} relationship
    @param {Resolver} resolver
  */
  findBelongsTo: function(owner, link, relationship, resolver) {
    var adapter = this.adapterFor(owner.constructor);

    Ember.assert("You tried to load a belongsTo relationship but you have no adapter (for " + owner.constructor + ")", adapter);
    Ember.assert("You tried to load a belongsTo relationship from a specified `link` in the original payload but your adapter does not implement `findBelongsTo`", adapter.findBelongsTo);

    resolver.resolve(_findBelongsTo(adapter, this, owner, link, relationship));
  },

  /**
    This method delegates a query to the adapter. This is the one place where
    adapter-level semantics are exposed to the application.

    Exposing queries this way seems preferable to creating an abstract query
    language for all server-side queries, and then require all adapters to
    implement them.

    This method returns a promise, which is resolved with a `RecordArray`
    once the server returns.

    @method findQuery
    @private
    @param {String or subclass of DS.Model} type
    @param {any} query an opaque query to be used by the adapter
    @return {Promise} promise
  */
  findQuery: function(type, query) {
    type = this.modelFor(type);

    var array = this.recordArrayManager
      .createAdapterPopulatedRecordArray(type, query);

    var adapter = this.adapterFor(type),
        promiseLabel = "DS: Store#findQuery " + type,
        resolver = Ember.RSVP.defer(promiseLabel);

    Ember.assert("You tried to load a query but you have no adapter (for " + type + ")", adapter);
    Ember.assert("You tried to load a query but your adapter does not implement `findQuery`", adapter.findQuery);

    resolver.resolve(_findQuery(adapter, this, type, query, array));

    return promiseArray(resolver.promise);
  },

  /**
    This method returns an array of all records adapter can find.
    It triggers the adapter's `findAll` method to give it an opportunity to populate
    the array with records of that type.

    @method findAll
    @private
    @param {String or subclass of DS.Model} type
    @return {DS.AdapterPopulatedRecordArray}
  */
  findAll: function(type) {
    type = this.modelFor(type);

    return this.fetchAll(type, this.all(type));
  },

  /**
    @method fetchAll
    @private
    @param {DS.Model} type
    @param {DS.RecordArray} array
    @returns {Promise} promise
  */
  fetchAll: function(type, array) {
    var adapter = this.adapterFor(type),
        sinceToken = this.typeMapFor(type).metadata.since;

    set(array, 'isUpdating', true);

    Ember.assert("You tried to load all records but you have no adapter (for " + type + ")", adapter);
    Ember.assert("You tried to load all records but your adapter does not implement `findAll`", adapter.findAll);

    return promiseArray(_findAll(adapter, this, type, sinceToken));
  },

  /**
    @method didUpdateAll
    @param {DS.Model} type
  */
  didUpdateAll: function(type) {
    var findAllCache = this.typeMapFor(type).findAllCache;
    set(findAllCache, 'isUpdating', false);
  },

  /**
    This method returns a filtered array that contains all of the known records
    for a given type.

    Note that because it's just a filter, it will have any locally
    created records of the type.

    Also note that multiple calls to `all` for a given type will always
    return the same RecordArray.

    Example

    ```javascript
    var local_posts = store.all(App.Post);
    ```

    @method all
    @param {String or subclass of DS.Model} type
    @return {DS.RecordArray}
  */
  all: function(type) {
    type = this.modelFor(type);

    var typeMap = this.typeMapFor(type),
        findAllCache = typeMap.findAllCache;

    if (findAllCache) { return findAllCache; }

    var array = this.recordArrayManager.createRecordArray(type);

    typeMap.findAllCache = array;
    return array;
  },


  /**
    This method unloads all of the known records for a given type.

    ```javascript
    store.unloadAll(App.Post);
    ```

    @method unloadAll
    @param {String or subclass of DS.Model} type
  */
  unloadAll: function(type) {
    type = this.modelFor(type);

    var typeMap = this.typeMapFor(type),
        records = typeMap.records, record;

    while(record = records.pop()) {
      record.unloadRecord();
    }

    typeMap.findAllCache = null;
  },

  /**
    Takes a type and filter function, and returns a live RecordArray that
    remains up to date as new records are loaded into the store or created
    locally.

    The callback function takes a materialized record, and returns true
    if the record should be included in the filter and false if it should
    not.

    The filter function is called once on all records for the type when
    it is created, and then once on each newly loaded or created record.

    If any of a record's properties change, or if it changes state, the
    filter function will be invoked again to determine whether it should
    still be in the array.

    Optionally you can pass a query which will be triggered at first. The
    results returned by the server could then appear in the filter if they
    match the filter function.

    Example

    ```javascript
    store.filter(App.Post, {unread: true}, function(post) {
      return post.get('unread');
    }).then(function(unreadPosts) {
      unreadPosts.get('length'); // 5
      var unreadPost = unreadPosts.objectAt(0);
      unreadPosts.set('unread', false);
      unreadPosts.get('length'); // 4
    });
    ```

    @method filter
    @param {String or subclass of DS.Model} type
    @param {Object} query optional query
    @param {Function} filter
    @return {DS.PromiseArray}
  */
  filter: function(type, query, filter) {
    var promise;

    // allow an optional server query
    if (arguments.length === 3) {
      promise = this.findQuery(type, query);
    } else if (arguments.length === 2) {
      filter = query;
    }

    type = this.modelFor(type);

    var array = this.recordArrayManager
      .createFilteredRecordArray(type, filter);
    promise = promise || resolve(array);

    return promiseArray(promise.then(function() {
      return array;
    }, null, "DS: Store#filter of " + type));
  },

  /**
    This method returns if a certain record is already loaded
    in the store. Use this function to know beforehand if a find()
    will result in a request or that it will be a cache hit.

     Example

    ```javascript
    store.recordIsLoaded(App.Post, 1); // false
    store.find(App.Post, 1).then(function() {
      store.recordIsLoaded(App.Post, 1); // true
    });
    ```

    @method recordIsLoaded
    @param {String or subclass of DS.Model} type
    @param {string} id
    @return {boolean}
  */
  recordIsLoaded: function(type, id) {
    if (!this.hasRecordForId(type, id)) { return false; }
    return !get(this.recordForId(type, id), 'isEmpty');
  },

  /**
    This method returns the metadata for a specific type.

    @method metadataFor
    @param {String or subclass of DS.Model} type
    @return {object}
  */
  metadataFor: function(type) {
    type = this.modelFor(type);
    return this.typeMapFor(type).metadata;
  },

  // ............
  // . UPDATING .
  // ............

  /**
    If the adapter updates attributes or acknowledges creation
    or deletion, the record will notify the store to update its
    membership in any filters.
    To avoid thrashing, this method is invoked only once per

    run loop per record.

    @method dataWasUpdated
    @private
    @param {Class} type
    @param {DS.Model} record
  */
  dataWasUpdated: function(type, record) {
    this.recordArrayManager.recordDidChange(record);
  },

  // ..............
  // . PERSISTING .
  // ..............

  /**
    This method is called by `record.save`, and gets passed a
    resolver for the promise that `record.save` returns.

    It schedules saving to happen at the end of the run loop.

    @method scheduleSave
    @private
    @param {DS.Model} record
    @param {Resolver} resolver
  */
  scheduleSave: function(record, resolver) {
    record.adapterWillCommit();
    this._pendingSave.push([record, resolver]);
    once(this, 'flushPendingSave');
  },

  /**
    This method is called at the end of the run loop, and
    flushes any records passed into `scheduleSave`

    @method flushPendingSave
    @private
  */
  flushPendingSave: function() {
    var pending = this._pendingSave.slice();
    this._pendingSave = [];

    forEach(pending, function(tuple) {
      var record = tuple[0], resolver = tuple[1],
          adapter = this.adapterFor(record.constructor),
          operation;

      if (get(record, 'isNew')) {
        operation = 'createRecord';
      } else if (get(record, 'isDeleted')) {
        operation = 'deleteRecord';
      } else {
        operation = 'updateRecord';
      }

      resolver.resolve(_commit(adapter, this, operation, record));
    }, this);
  },

  /**
    This method is called once the promise returned by an
    adapter's `createRecord`, `updateRecord` or `deleteRecord`
    is resolved.

    If the data provides a server-generated ID, it will
    update the record and the store's indexes.

    @method didSaveRecord
    @private
    @param {DS.Model} record the in-flight record
    @param {Object} data optional data (see above)
  */
  didSaveRecord: function(record, data) {
    if (data) {
      // normalize relationship IDs into records
      data = normalizeRelationships(this, record.constructor, data, record);

      this.updateId(record, data);
    }

    record.adapterDidCommit(data);
  },

  /**
    This method is called once the promise returned by an
    adapter's `createRecord`, `updateRecord` or `deleteRecord`
    is rejected with a `DS.InvalidError`.

    @method recordWasInvalid
    @private
    @param {DS.Model} record
    @param {Object} errors
  */
  recordWasInvalid: function(record, errors) {
    record.adapterDidInvalidate(errors);
  },

  /**
    This method is called once the promise returned by an
    adapter's `createRecord`, `updateRecord` or `deleteRecord`
    is rejected (with anything other than a `DS.InvalidError`).

    @method recordWasError
    @private
    @param {DS.Model} record
  */
  recordWasError: function(record) {
    record.adapterDidError();
  },

  /**
    When an adapter's `createRecord`, `updateRecord` or `deleteRecord`
    resolves with data, this method extracts the ID from the supplied
    data.

    @method updateId
    @private
    @param {DS.Model} record
    @param {Object} data
  */
  updateId: function(record, data) {
    var oldId = get(record, 'id'),
        id = coerceId(data.id);

    Ember.assert("An adapter cannot assign a new id to a record that already has an id. " + record + " had id: " + oldId + " and you tried to update it with " + id + ". This likely happened because your server returned data in response to a find or update that had a different id than the one you sent.", oldId === null || id === oldId);

    this.typeMapFor(record.constructor).idToRecord[id] = record;

    set(record, 'id', id);
  },

  /**
    Returns a map of IDs to client IDs for a given type.

    @method typeMapFor
    @private
    @param type
    @return {Object} typeMap
  */
  typeMapFor: function(type) {
    var typeMaps = get(this, 'typeMaps'),
        guid = Ember.guidFor(type),
        typeMap;

    typeMap = typeMaps[guid];

    if (typeMap) { return typeMap; }

    typeMap = {
      idToRecord: {},
      records: [],
      metadata: {}
    };

    typeMaps[guid] = typeMap;

    return typeMap;
  },

  // ................
  // . LOADING DATA .
  // ................

  /**
    This internal method is used by `push`.

    @method _load
    @private
    @param {String or subclass of DS.Model} type
    @param {Object} data
    @param {Boolean} partial the data should be merged into
      the existing data, not replace it.
  */
  _load: function(type, data, partial) {
    var id = coerceId(data.id),
        record = this.recordForId(type, id);

    record.setupData(data, partial);
    this.recordArrayManager.recordDidChange(record);

    return record;
  },

  /**
    Returns a model class for a particular key. Used by
    methods that take a type key (like `find`, `createRecord`,
    etc.)

    @method modelFor
    @param {String or subclass of DS.Model} key
    @returns {subclass of DS.Model}
  */
  modelFor: function(key) {
    var factory;


    if (typeof key === 'string') {
      var normalizedKey = this.container.normalize('model:' + key);

      factory = this.container.lookupFactory(normalizedKey);
      if (!factory) { throw new Ember.Error("No model was found for '" + key + "'"); }
      factory.typeKey = normalizedKey.split(':', 2)[1];
    } else {
      // A factory already supplied.
      factory = key;
    }

    factory.store = this;
    return factory;
  },

  /**
    Push some data for a given type into the store.

    This method expects normalized data:

    * The ID is a key named `id` (an ID is mandatory)
    * The names of attributes are the ones you used in
      your model's `DS.attr`s.
    * Your relationships must be:
      * represented as IDs or Arrays of IDs
      * represented as model instances
      * represented as URLs, under the `links` key

    For this model:

    ```js
    App.Person = DS.Model.extend({
      firstName: DS.attr(),
      lastName: DS.attr(),

      children: DS.hasMany('person')
    });
    ```

    To represent the children as IDs:

    ```js
    {
      id: 1,
      firstName: "Tom",
      lastName: "Dale",
      children: [1, 2, 3]
    }
    ```

    To represent the children relationship as a URL:

    ```js
    {
      id: 1,
      firstName: "Tom",
      lastName: "Dale",
      links: {
        children: "/people/1/children"
      }
    }
    ```

    If you're streaming data or implementing an adapter,
    make sure that you have converted the incoming data
    into this form.

    This method can be used both to push in brand new
    records, as well as to update existing records.

    @method push
    @param {String or subclass of DS.Model} type
    @param {Object} data
    @returns {DS.Model} the record that was created or
      updated.
  */
  push: function(type, data, _partial) {
    // _partial is an internal param used by `update`.
    // If passed, it means that the data should be
    // merged into the existing data, not replace it.

    Ember.assert("You must include an `id` in a hash passed to `push`", data.id != null);

    type = this.modelFor(type);

    // normalize relationship IDs into records
    data = normalizeRelationships(this, type, data);

    this._load(type, data, _partial);

    return this.recordForId(type, data.id);
  },

  /**
    Push some raw data into the store.

    The data will be automatically deserialized using the
    serializer for the `type` param.

    This method can be used both to push in brand new
    records, as well as to update existing records.

    You can push in more than one type of object at once.
    All objects should be in the format expected by the
    serializer.

    ```js
    App.ApplicationSerializer = DS.ActiveModelSerializer;

    var pushData = {
      posts: [
        {id: 1, post_title: "Great post", comment_ids: [2]}
      ],
      comments: [
        {id: 2, comment_body: "Insightful comment"}
      ]
    }

    store.pushPayload('post', pushData);
    ```

    @method pushPayload
    @param {String} type
    @param {Object} payload
    @return {DS.Model} the record that was created or updated.
  */
  pushPayload: function (type, payload) {
    var serializer;
    if (!payload) {
      payload = type;
      serializer = defaultSerializer(this.container);
      Ember.assert("You cannot use `store#pushPayload` without a type unless your default serializer defines `pushPayload`", serializer.pushPayload);
    } else {
      serializer = this.serializerFor(type);
    }
    serializer.pushPayload(this, payload);
  },

  update: function(type, data) {
    Ember.assert("You must include an `id` in a hash passed to `update`", data.id != null);

    return this.push(type, data, true);
  },

  /**
    If you have an Array of normalized data to push,
    you can call `pushMany` with the Array, and it will
    call `push` repeatedly for you.

    @method pushMany
    @param {String or subclass of DS.Model} type
    @param {Array} datas
    @return {Array}
  */
  pushMany: function(type, datas) {
    return map(datas, function(data) {
      return this.push(type, data);
    }, this);
  },

  /**
    If you have some metadata to set for a type
    you can call `metaForType`.

    @method metaForType
    @param {String or subclass of DS.Model} type
    @param {Object} metadata
  */
  metaForType: function(type, metadata) {
    type = this.modelFor(type);

    Ember.merge(this.typeMapFor(type).metadata, metadata);
  },

  /**
    Build a brand new record for a given type, ID, and
    initial data.

    @method buildRecord
    @private
    @param {subclass of DS.Model} type
    @param {String} id
    @param {Object} data
    @returns {DS.Model} record
  */
  buildRecord: function(type, id, data) {
    var typeMap = this.typeMapFor(type),
        idToRecord = typeMap.idToRecord;

    Ember.assert('The id ' + id + ' has already been used with another record of type ' + type.toString() + '.', !id || !idToRecord[id]);

    // lookupFactory should really return an object that creates
    // instances with the injections applied
    var record = type._create({
      id: id,
      store: this,
      container: this.container
    });

    if (data) {
      record.setupData(data);
    }

    // if we're creating an item, this process will be done
    // later, once the object has been persisted.
    if (id) {
      idToRecord[id] = record;
    }

    typeMap.records.push(record);

    return record;
  },

  // ...............
  // . DESTRUCTION .
  // ...............

  /**
    When a record is destroyed, this un-indexes it and
    removes it from any record arrays so it can be GCed.

    @method dematerializeRecord
    @private
    @param {DS.Model} record
  */
  dematerializeRecord: function(record) {
    var type = record.constructor,
        typeMap = this.typeMapFor(type),
        id = get(record, 'id');

    record.updateRecordArrays();

    if (id) {
      delete typeMap.idToRecord[id];
    }

    var loc = indexOf(typeMap.records, record);
    typeMap.records.splice(loc, 1);
  },

  // ........................
  // . RELATIONSHIP CHANGES .
  // ........................

  addRelationshipChangeFor: function(childRecord, childKey, parentRecord, parentKey, change) {
    var clientId = childRecord.clientId,
        parentClientId = parentRecord ? parentRecord : parentRecord;
    var key = childKey + parentKey;
    var changes = this._relationshipChanges;
    if (!(clientId in changes)) {
      changes[clientId] = {};
    }
    if (!(parentClientId in changes[clientId])) {
      changes[clientId][parentClientId] = {};
    }
    if (!(key in changes[clientId][parentClientId])) {
      changes[clientId][parentClientId][key] = {};
    }
    changes[clientId][parentClientId][key][change.changeType] = change;
  },

  removeRelationshipChangeFor: function(clientRecord, childKey, parentRecord, parentKey, type) {
    var clientId = clientRecord.clientId,
        parentClientId = parentRecord ? parentRecord.clientId : parentRecord;
    var changes = this._relationshipChanges;
    var key = childKey + parentKey;
    if (!(clientId in changes) || !(parentClientId in changes[clientId]) || !(key in changes[clientId][parentClientId])){
      return;
    }
    delete changes[clientId][parentClientId][key][type];
  },

  relationshipChangePairsFor: function(record){
    var toReturn = [];

    if( !record ) { return toReturn; }

    //TODO(Igor) What about the other side
    var changesObject = this._relationshipChanges[record.clientId];
    for (var objKey in changesObject){
      if(changesObject.hasOwnProperty(objKey)){
        for (var changeKey in changesObject[objKey]){
          if(changesObject[objKey].hasOwnProperty(changeKey)){
            toReturn.push(changesObject[objKey][changeKey]);
          }
        }
      }
    }
    return toReturn;
  },

  // ......................
  // . PER-TYPE ADAPTERS
  // ......................

  /**
    Returns the adapter for a given type.

    @method adapterFor
    @private
    @param {subclass of DS.Model} type
    @returns DS.Adapter
  */
  adapterFor: function(type) {
    var container = this.container, adapter;

    if (container) {
      adapter = container.lookup('adapter:' + type.typeKey) || container.lookup('adapter:application');
    }

    return adapter || get(this, 'defaultAdapter');
  },

  // ..............................
  // . RECORD CHANGE NOTIFICATION .
  // ..............................

  /**
    Returns an instance of the serializer for a given type. For
    example, `serializerFor('person')` will return an instance of
    `App.PersonSerializer`.

    If no `App.PersonSerializer` is found, this method will look
    for an `App.ApplicationSerializer` (the default serializer for
    your entire application).

    If no `App.ApplicationSerializer` is found, it will fall back
    to an instance of `DS.JSONSerializer`.

    @method serializerFor
    @private
    @param {String} type the record to serialize
    @return {DS.Serializer}
  */
  serializerFor: function(type) {
    type = this.modelFor(type);
    var adapter = this.adapterFor(type);

    return serializerFor(this.container, type.typeKey, adapter && adapter.defaultSerializer);
  }
});

function normalizeRelationships(store, type, data, record) {
  type.eachRelationship(function(key, relationship) {
    // A link (usually a URL) was already provided in
    // normalized form
    if (data.links && data.links[key]) {
      if (record && relationship.options.async) { record._relationships[key] = null; }
      return;
    }

    var kind = relationship.kind,
        value = data[key];

    if (value == null) { return; }

    if (kind === 'belongsTo') {
      deserializeRecordId(store, data, key, relationship, value);
    } else if (kind === 'hasMany') {
      deserializeRecordIds(store, data, key, relationship, value);
      addUnsavedRecords(record, key, value);
    }
  });

  return data;
}

function deserializeRecordId(store, data, key, relationship, id) {
  if (isNone(id) || id instanceof DS.Model) {
    return;
  }

  var type;

  if (typeof id === 'number' || typeof id === 'string') {
    type = typeFor(relationship, key, data);
    data[key] = store.recordForId(type, id);
  } else if (typeof id === 'object') {
    // polymorphic
    data[key] = store.recordForId(id.type, id.id);
  }
}

function typeFor(relationship, key, data) {
  if (relationship.options.polymorphic) {
    return data[key + "Type"];
  } else {
    return relationship.type;
  }
}

function deserializeRecordIds(store, data, key, relationship, ids) {
  for (var i=0, l=ids.length; i<l; i++) {
    deserializeRecordId(store, ids, i, relationship, ids[i]);
  }
}

// If there are any unsaved records that are in a hasMany they won't be
// in the payload, so add them back in manually.
function addUnsavedRecords(record, key, data) {
  if(record) {
    data.pushObjects(record.get(key).filterBy('isNew'));
  }
}

// Delegation to the adapter and promise management
/**
  A `PromiseArray` is an object that acts like both an `Ember.Array`
  and a promise. When the promise is resolved the the resulting value
  will be set to the `PromiseArray`'s `content` property. This makes
  it easy to create data bindings with the `PromiseArray` that will be
  updated when the promise resolves.

  For more information see the [Ember.PromiseProxyMixin
  documentation](/api/classes/Ember.PromiseProxyMixin.html).

  Example

  ```javascript
  var promiseArray = DS.PromiseArray.create({
    promise: $.getJSON('/some/remote/data.json')
  });

  promiseArray.get('length'); // 0

  promiseArray.then(function() {
    promiseArray.get('length'); // 100
  });
  ```

  @class PromiseArray
  @namespace DS
  @extends Ember.ArrayProxy
  @uses Ember.PromiseProxyMixin
*/
DS.PromiseArray = Ember.ArrayProxy.extend(Ember.PromiseProxyMixin);
/**
  A `PromiseObject` is an object that acts like both an `Ember.Object`
  and a promise. When the promise is resolved the the resulting value
  will be set to the `PromiseObject`'s `content` property. This makes
  it easy to create data bindings with the `PromiseObject` that will
  be updated when the promise resolves.

  For more information see the [Ember.PromiseProxyMixin
  documentation](/api/classes/Ember.PromiseProxyMixin.html).

  Example

  ```javascript
  var promiseObject = DS.PromiseObject.create({
    promise: $.getJSON('/some/remote/data.json')
  });

  promiseObject.get('name'); // null

  promiseObject.then(function() {
    promiseObject.get('name'); // 'Tomster'
  });
  ```

  @class PromiseObject
  @namespace DS
  @extends Ember.ObjectProxy
  @uses Ember.PromiseProxyMixin
*/
DS.PromiseObject = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

function promiseObject(promise) {
  return DS.PromiseObject.create({ promise: promise });
}

function promiseArray(promise) {
  return DS.PromiseArray.create({ promise: promise });
}

function isThenable(object) {
  return object && typeof object.then === 'function';
}

function serializerFor(container, type, defaultSerializer) {
  return container.lookup('serializer:'+type) ||
                 container.lookup('serializer:application') ||
                 container.lookup('serializer:' + defaultSerializer) ||
                 container.lookup('serializer:_default');
}

function defaultSerializer(container) {
  return container.lookup('serializer:application') ||
         container.lookup('serializer:_default');
}

function serializerForAdapter(adapter, type) {
  var serializer = adapter.serializer,
      defaultSerializer = adapter.defaultSerializer,
      container = adapter.container;

  if (container && serializer === undefined) {
    serializer = serializerFor(container, type.typeKey, defaultSerializer);
  }

  if (serializer === null || serializer === undefined) {
    serializer = {
      extract: function(store, type, payload) { return payload; }
    };
  }

  return serializer;
}

function _find(adapter, store, type, id) {
  var promise = adapter.find(store, type, id),
      serializer = serializerForAdapter(adapter, type);

  return resolve(promise, "DS: Handle Adapter#find of " + type + " with id: " + id).then(function(payload) {
    Ember.assert("You made a request for a " + type.typeKey + " with id " + id + ", but the adapter's response did not have any data", payload);
    payload = serializer.extract(store, type, payload, id, 'find');

    return store.push(type, payload);
  }, function(error) {
    var record = store.getById(type, id);
    record.notFound();
    throw error;
  }, "DS: Extract payload of '" + type + "'");
}

function _findMany(adapter, store, type, ids, owner) {
  var promise = adapter.findMany(store, type, ids, owner),
      serializer = serializerForAdapter(adapter, type);

  return resolve(promise, "DS: Handle Adapter#findMany of " + type).then(function(payload) {
    payload = serializer.extract(store, type, payload, null, 'findMany');

    Ember.assert("The response from a findMany must be an Array, not " + Ember.inspect(payload), Ember.typeOf(payload) === 'array');

    store.pushMany(type, payload);
  }, null, "DS: Extract payload of " + type);
}

function _findHasMany(adapter, store, record, link, relationship) {
  var promise = adapter.findHasMany(store, record, link, relationship),
      serializer = serializerForAdapter(adapter, relationship.type);

  return resolve(promise, "DS: Handle Adapter#findHasMany of " + record + " : " + relationship.type).then(function(payload) {
    payload = serializer.extract(store, relationship.type, payload, null, 'findHasMany');

    Ember.assert("The response from a findHasMany must be an Array, not " + Ember.inspect(payload), Ember.typeOf(payload) === 'array');

    var records = store.pushMany(relationship.type, payload);
    record.updateHasMany(relationship.key, records);
  }, null, "DS: Extract payload of " + record + " : hasMany " + relationship.type);
}

function _findBelongsTo(adapter, store, record, link, relationship) {
  var promise = adapter.findBelongsTo(store, record, link, relationship),
      serializer = serializerForAdapter(adapter, relationship.type);

  return resolve(promise, "DS: Handle Adapter#findBelongsTo of " + record + " : " + relationship.type).then(function(payload) {
    payload = serializer.extract(store, relationship.type, payload, null, 'findBelongsTo');

    var record = store.push(relationship.type, payload);
    record.updateBelongsTo(relationship.key, record);
    return record;
  }, null, "DS: Extract payload of " + record + " : " + relationship.type);
}

function _findAll(adapter, store, type, sinceToken) {
  var promise = adapter.findAll(store, type, sinceToken),
      serializer = serializerForAdapter(adapter, type);

  return resolve(promise, "DS: Handle Adapter#findAll of " + type).then(function(payload) {
    payload = serializer.extract(store, type, payload, null, 'findAll');

    Ember.assert("The response from a findAll must be an Array, not " + Ember.inspect(payload), Ember.typeOf(payload) === 'array');

    store.pushMany(type, payload);
    store.didUpdateAll(type);
    return store.all(type);
  }, null, "DS: Extract payload of findAll " + type);
}

function _findQuery(adapter, store, type, query, recordArray) {
  var promise = adapter.findQuery(store, type, query, recordArray),
      serializer = serializerForAdapter(adapter, type);

  return resolve(promise, "DS: Handle Adapter#findQuery of " + type).then(function(payload) {
    payload = serializer.extract(store, type, payload, null, 'findQuery');

    Ember.assert("The response from a findQuery must be an Array, not " + Ember.inspect(payload), Ember.typeOf(payload) === 'array');

    recordArray.load(payload);
    return recordArray;
  }, null, "DS: Extract payload of findQuery " + type);
}

function _commit(adapter, store, operation, record) {
  var type = record.constructor,
      promise = adapter[operation](store, type, record),
      serializer = serializerForAdapter(adapter, type);

  Ember.assert("Your adapter's '" + operation + "' method must return a promise, but it returned " + promise, isThenable(promise));

  return promise.then(function(payload) {
    if (payload) { payload = serializer.extract(store, type, payload, get(record, 'id'), operation); }
    store.didSaveRecord(record, payload);
    return record;
  }, function(reason) {
    if (reason instanceof DS.InvalidError) {
      store.recordWasInvalid(record, reason.errors);
    } else {
      store.recordWasError(record, reason);
    }

    throw reason;
  }, "DS: Extract and notify about " + operation + " completion of " + record);
}

})();



(function() {
/**
  @module ember-data
*/

var get = Ember.get, set = Ember.set;
/*
  This file encapsulates the various states that a record can transition
  through during its lifecycle.
*/
/**
  ### State

  Each record has a `currentState` property that explicitly tracks what
  state a record is in at any given time. For instance, if a record is
  newly created and has not yet been sent to the adapter to be saved,
  it would be in the `root.loaded.created.uncommitted` state.  If a
  record has had local modifications made to it that are in the
  process of being saved, the record would be in the
  `root.loaded.updated.inFlight` state. (These state paths will be
  explained in more detail below.)

  Events are sent by the record or its store to the record's
  `currentState` property. How the state reacts to these events is
  dependent on which state it is in. In some states, certain events
  will be invalid and will cause an exception to be raised.

  States are hierarchical and every state is a substate of the
  `RootState`. For example, a record can be in the
  `root.deleted.uncommitted` state, then transition into the
  `root.deleted.inFlight` state. If a child state does not implement
  an event handler, the state manager will attempt to invoke the event
  on all parent states until the root state is reached. The state
  hierarchy of a record is described in terms of a path string. You
  can determine a record's current state by getting the state's
  `stateName` property:

  ```javascript
  record.get('currentState.stateName');
  //=> "root.created.uncommitted"
   ```

  The hierarchy of valid states that ship with ember data looks like
  this:

  ```text
  * root
    * deleted
      * saved
      * uncommitted
      * inFlight
    * empty
    * loaded
      * created
        * uncommitted
        * inFlight
      * saved
      * updated
        * uncommitted
        * inFlight
    * loading
  ```

  The `DS.Model` states are themselves stateless. What we mean is
  that, the hierarchical states that each of *those* points to is a
  shared data structure. For performance reasons, instead of each
  record getting its own copy of the hierarchy of states, each record
  points to this global, immutable shared instance. How does a state
  know which record it should be acting on? We pass the record
  instance into the state's event handlers as the first argument.

  The record passed as the first parameter is where you should stash
  state about the record if needed; you should never store data on the state
  object itself.

  ### Events and Flags

  A state may implement zero or more events and flags.

  #### Events

  Events are named functions that are invoked when sent to a record. The
  record will first look for a method with the given name on the
  current state. If no method is found, it will search the current
  state's parent, and then its grandparent, and so on until reaching
  the top of the hierarchy. If the root is reached without an event
  handler being found, an exception will be raised. This can be very
  helpful when debugging new features.

  Here's an example implementation of a state with a `myEvent` event handler:

  ```javascript
  aState: DS.State.create({
    myEvent: function(manager, param) {
      console.log("Received myEvent with", param);
    }
  })
  ```

  To trigger this event:

  ```javascript
  record.send('myEvent', 'foo');
  //=> "Received myEvent with foo"
  ```

  Note that an optional parameter can be sent to a record's `send()` method,
  which will be passed as the second parameter to the event handler.

  Events should transition to a different state if appropriate. This can be
  done by calling the record's `transitionTo()` method with a path to the
  desired state. The state manager will attempt to resolve the state path
  relative to the current state. If no state is found at that path, it will
  attempt to resolve it relative to the current state's parent, and then its
  parent, and so on until the root is reached. For example, imagine a hierarchy
  like this:

      * created
        * uncommitted <-- currentState
        * inFlight
      * updated
        * inFlight

  If we are currently in the `uncommitted` state, calling
  `transitionTo('inFlight')` would transition to the `created.inFlight` state,
  while calling `transitionTo('updated.inFlight')` would transition to
  the `updated.inFlight` state.

  Remember that *only events* should ever cause a state transition. You should
  never call `transitionTo()` from outside a state's event handler. If you are
  tempted to do so, create a new event and send that to the state manager.

  #### Flags

  Flags are Boolean values that can be used to introspect a record's current
  state in a more user-friendly way than examining its state path. For example,
  instead of doing this:

  ```javascript
  var statePath = record.get('stateManager.currentPath');
  if (statePath === 'created.inFlight') {
    doSomething();
  }
  ```

  You can say:

  ```javascript
  if (record.get('isNew') && record.get('isSaving')) {
    doSomething();
  }
  ```

  If your state does not set a value for a given flag, the value will
  be inherited from its parent (or the first place in the state hierarchy
  where it is defined).

  The current set of flags are defined below. If you want to add a new flag,
  in addition to the area below, you will also need to declare it in the
  `DS.Model` class.


   * [isEmpty](DS.Model.html#property_isEmpty)
   * [isLoading](DS.Model.html#property_isLoading)
   * [isLoaded](DS.Model.html#property_isLoaded)
   * [isDirty](DS.Model.html#property_isDirty)
   * [isSaving](DS.Model.html#property_isSaving)
   * [isDeleted](DS.Model.html#property_isDeleted)
   * [isNew](DS.Model.html#property_isNew)
   * [isValid](DS.Model.html#property_isValid)

  @namespace DS
  @class RootState
*/

var hasDefinedProperties = function(object) {
  // Ignore internal property defined by simulated `Ember.create`.
  var names = Ember.keys(object);
  var i, l, name;
  for (i = 0, l = names.length; i < l; i++ ) {
    name = names[i];
    if (object.hasOwnProperty(name) && object[name]) { return true; }
  }

  return false;
};

var didSetProperty = function(record, context) {
  if (context.value === context.originalValue) {
    delete record._attributes[context.name];
    record.send('propertyWasReset', context.name);
  } else if (context.value !== context.oldValue) {
    record.send('becomeDirty');
  }

  record.updateRecordArraysLater();
};

// Implementation notes:
//
// Each state has a boolean value for all of the following flags:
//
// * isLoaded: The record has a populated `data` property. When a
//   record is loaded via `store.find`, `isLoaded` is false
//   until the adapter sets it. When a record is created locally,
//   its `isLoaded` property is always true.
// * isDirty: The record has local changes that have not yet been
//   saved by the adapter. This includes records that have been
//   created (but not yet saved) or deleted.
// * isSaving: The record has been committed, but
//   the adapter has not yet acknowledged that the changes have
//   been persisted to the backend.
// * isDeleted: The record was marked for deletion. When `isDeleted`
//   is true and `isDirty` is true, the record is deleted locally
//   but the deletion was not yet persisted. When `isSaving` is
//   true, the change is in-flight. When both `isDirty` and
//   `isSaving` are false, the change has persisted.
// * isError: The adapter reported that it was unable to save
//   local changes to the backend. This may also result in the
//   record having its `isValid` property become false if the
//   adapter reported that server-side validations failed.
// * isNew: The record was created on the client and the adapter
//   did not yet report that it was successfully saved.
// * isValid: No client-side validations have failed and the
//   adapter did not report any server-side validation failures.

// The dirty state is a abstract state whose functionality is
// shared between the `created` and `updated` states.
//
// The deleted state shares the `isDirty` flag with the
// subclasses of `DirtyState`, but with a very different
// implementation.
//
// Dirty states have three child states:
//
// `uncommitted`: the store has not yet handed off the record
//   to be saved.
// `inFlight`: the store has handed off the record to be saved,
//   but the adapter has not yet acknowledged success.
// `invalid`: the record has invalid information and cannot be
//   send to the adapter yet.
var DirtyState = {
  initialState: 'uncommitted',

  // FLAGS
  isDirty: true,

  // SUBSTATES

  // When a record first becomes dirty, it is `uncommitted`.
  // This means that there are local pending changes, but they
  // have not yet begun to be saved, and are not invalid.
  uncommitted: {
    // EVENTS
    didSetProperty: didSetProperty,

    propertyWasReset: function(record, name) {
      var stillDirty = false;

      for (var prop in record._attributes) {
        stillDirty = true;
        break;
      }

      if (!stillDirty) { record.send('rolledBack'); }
    },

    pushedData: Ember.K,

    becomeDirty: Ember.K,

    willCommit: function(record) {
      record.transitionTo('inFlight');
    },

    reloadRecord: function(record, resolve) {
      resolve(get(record, 'store').reloadRecord(record));
    },

    rolledBack: function(record) {
      record.transitionTo('loaded.saved');
    },

    becameInvalid: function(record) {
      record.transitionTo('invalid');
    },

    rollback: function(record) {
      record.rollback();
    }
  },

  // Once a record has been handed off to the adapter to be
  // saved, it is in the 'in flight' state. Changes to the
  // record cannot be made during this window.
  inFlight: {
    // FLAGS
    isSaving: true,

    // EVENTS
    didSetProperty: didSetProperty,
    becomeDirty: Ember.K,
    pushedData: Ember.K,

    // TODO: More robust semantics around save-while-in-flight
    willCommit: Ember.K,

    didCommit: function(record) {
      var dirtyType = get(this, 'dirtyType');

      record.transitionTo('saved');
      record.send('invokeLifecycleCallbacks', dirtyType);
    },

    becameInvalid: function(record) {
      record.transitionTo('invalid');
      record.send('invokeLifecycleCallbacks');
    },

    becameError: function(record) {
      record.transitionTo('uncommitted');
      record.triggerLater('becameError', record);
    }
  },

  // A record is in the `invalid` state when its client-side
  // invalidations have failed, or if the adapter has indicated
  // the the record failed server-side invalidations.
  invalid: {
    // FLAGS
    isValid: false,

    // EVENTS
    deleteRecord: function(record) {
      record.transitionTo('deleted.uncommitted');
      record.clearRelationships();
    },

    didSetProperty: function(record, context) {
      get(record, 'errors').remove(context.name);

      didSetProperty(record, context);
    },

    becomeDirty: Ember.K,

    rolledBack: function(record) {
      get(record, 'errors').clear();
    },

    becameValid: function(record) {
      record.transitionTo('uncommitted');
    },

    invokeLifecycleCallbacks: function(record) {
      record.triggerLater('becameInvalid', record);
    }
  }
};

// The created and updated states are created outside the state
// chart so we can reopen their substates and add mixins as
// necessary.

function deepClone(object) {
  var clone = {}, value;

  for (var prop in object) {
    value = object[prop];
    if (value && typeof value === 'object') {
      clone[prop] = deepClone(value);
    } else {
      clone[prop] = value;
    }
  }

  return clone;
}

function mixin(original, hash) {
  for (var prop in hash) {
    original[prop] = hash[prop];
  }

  return original;
}

function dirtyState(options) {
  var newState = deepClone(DirtyState);
  return mixin(newState, options);
}

var createdState = dirtyState({
  dirtyType: 'created',

  // FLAGS
  isNew: true
});

createdState.uncommitted.rolledBack = function(record) {
  record.transitionTo('deleted.saved');
};

var updatedState = dirtyState({
  dirtyType: 'updated'
});

createdState.uncommitted.deleteRecord = function(record) {
  record.clearRelationships();
  record.transitionTo('deleted.saved');
};

createdState.uncommitted.rollback = function(record) {
  DirtyState.uncommitted.rollback.apply(this, arguments);
  record.transitionTo('deleted.saved');
};

updatedState.uncommitted.deleteRecord = function(record) {
  record.transitionTo('deleted.uncommitted');
  record.clearRelationships();
};

var RootState = {
  // FLAGS
  isEmpty: false,
  isLoading: false,
  isLoaded: false,
  isDirty: false,
  isSaving: false,
  isDeleted: false,
  isNew: false,
  isValid: true,

  // DEFAULT EVENTS

  // Trying to roll back if you're not in the dirty state
  // doesn't change your state. For example, if you're in the
  // in-flight state, rolling back the record doesn't move
  // you out of the in-flight state.
  rolledBack: Ember.K,

  propertyWasReset: Ember.K,

  // SUBSTATES

  // A record begins its lifecycle in the `empty` state.
  // If its data will come from the adapter, it will
  // transition into the `loading` state. Otherwise, if
  // the record is being created on the client, it will
  // transition into the `created` state.
  empty: {
    isEmpty: true,

    // EVENTS
    loadingData: function(record, promise) {
      record._loadingPromise = promise;
      record.transitionTo('loading');
    },

    loadedData: function(record) {
      record.transitionTo('loaded.created.uncommitted');

      record.suspendRelationshipObservers(function() {
        record.notifyPropertyChange('data');
      });
    },

    pushedData: function(record) {
      record.transitionTo('loaded.saved');
      record.triggerLater('didLoad');
    }
  },

  // A record enters this state when the store askes
  // the adapter for its data. It remains in this state
  // until the adapter provides the requested data.
  //
  // Usually, this process is asynchronous, using an
  // XHR to retrieve the data.
  loading: {
    // FLAGS
    isLoading: true,

    exit: function(record) {
      record._loadingPromise = null;
    },

    // EVENTS
    pushedData: function(record) {
      record.transitionTo('loaded.saved');
      record.triggerLater('didLoad');
      set(record, 'isError', false);
    },

    becameError: function(record) {
      record.triggerLater('becameError', record);
    },

    notFound: function(record) {
      record.transitionTo('empty');
    }
  },

  // A record enters this state when its data is populated.
  // Most of a record's lifecycle is spent inside substates
  // of the `loaded` state.
  loaded: {
    initialState: 'saved',

    // FLAGS
    isLoaded: true,

    // SUBSTATES

    // If there are no local changes to a record, it remains
    // in the `saved` state.
    saved: {
      setup: function(record) {
        var attrs = record._attributes,
            isDirty = false;

        for (var prop in attrs) {
          if (attrs.hasOwnProperty(prop)) {
            isDirty = true;
            break;
          }
        }

        if (isDirty) {
          record.adapterDidDirty();
        }
      },

      // EVENTS
      didSetProperty: didSetProperty,

      pushedData: Ember.K,

      becomeDirty: function(record) {
        record.transitionTo('updated.uncommitted');
      },

      willCommit: function(record) {
        record.transitionTo('updated.inFlight');
      },

      reloadRecord: function(record, resolve) {
        resolve(get(record, 'store').reloadRecord(record));
      },

      deleteRecord: function(record) {
        record.transitionTo('deleted.uncommitted');
        record.clearRelationships();
      },

      unloadRecord: function(record) {
        // clear relationships before moving to deleted state
        // otherwise it fails
        record.clearRelationships();
        record.transitionTo('deleted.saved');
      },

      didCommit: function(record) {
        record.send('invokeLifecycleCallbacks', get(record, 'lastDirtyType'));
      },

      // loaded.saved.notFound would be triggered by a failed
      // `reload()` on an unchanged record
      notFound: Ember.K

    },

    // A record is in this state after it has been locally
    // created but before the adapter has indicated that
    // it has been saved.
    created: createdState,

    // A record is in this state if it has already been
    // saved to the server, but there are new local changes
    // that have not yet been saved.
    updated: updatedState
  },

  // A record is in this state if it was deleted from the store.
  deleted: {
    initialState: 'uncommitted',
    dirtyType: 'deleted',

    // FLAGS
    isDeleted: true,
    isLoaded: true,
    isDirty: true,

    // TRANSITIONS
    setup: function(record) {
      record.updateRecordArrays();
    },

    // SUBSTATES

    // When a record is deleted, it enters the `start`
    // state. It will exit this state when the record
    // starts to commit.
    uncommitted: {

      // EVENTS

      willCommit: function(record) {
        record.transitionTo('inFlight');
      },

      rollback: function(record) {
        record.rollback();
      },

      becomeDirty: Ember.K,
      deleteRecord: Ember.K,

      rolledBack: function(record) {
        record.transitionTo('loaded.saved');
      }
    },

    // After a record starts committing, but
    // before the adapter indicates that the deletion
    // has saved to the server, a record is in the
    // `inFlight` substate of `deleted`.
    inFlight: {
      // FLAGS
      isSaving: true,

      // EVENTS

      // TODO: More robust semantics around save-while-in-flight
      willCommit: Ember.K,
      didCo