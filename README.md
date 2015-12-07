# Javascript Object Validator(JsOV)
## How to use JsOV for validations

In its simlplest essence, Javascript Object Validator(JsOV) can be used as
```javascript
var result=JsOV.schemaValidator(Schema,Obj);
```

The above function `schemaValidator` takes two arguments, the `Schema` of the object you want to validate and the `Object` itself.
For example lets consider an object
```javascript
var Obj={
    'title':'abc',
    'variations':[{
        'title':'p1',
        'message':'m1',
        'cta':{
            'type':'DEEP_LINK',
            'actionLink':'abc'
        }
    },
    {
        'title':'p2',
        'message':'m2',
        'cta':{
            'type':'EXTERNAL',
            'actionLink':'https://jsv.com'
        }
    }]
};
```
And the schema for the above object is
```javascript
var Schema = {
    'type': 'Object',
    'reuired': true,
    'message': 'Perfectoo',
    'data': {
        'title': {
            'type': 'String',
            'validation': {
                'RegEx': 'abc'
            }
        },
        'variations': {
            'type': 'Array',
            'reuired': true,
            'validation': function(data) {
                if (data.length > 1)
                    return true;
                else
                    return false;
            },
            'dataType': 'Object',
            'data': [{
                'title': {
                    'type': 'String',
                    'required': true
                },
                'message': {
                    'type': 'String',
                    'required': true
                },
                'cta': {
                    'type': 'Object',
                    'validation': function(cta) {
                        if (cta.actionlink === 'abc')
                            return true;
                        else
                            return false;
                    },
                    'required': true,
                    'data': {
                        'type': {
                            'type': 'String',
                            'required': true,
                            'validation': function(type) {
                                if (type === 'DEEP_LINK' || type === 'EXTERNAL_URL')
                                    return true;
                                else
                                    return false;
                            }
                        },
                        'actionLink': {
                            'type': 'String',
                            'required': true
                        }
                    }
                }
            }]
        }
    }
};
```
Now validate function will take these two arguments and will return the following output
```javascript
var result = {
    "title": {
        "value": "abc",
        "valid": true,
        "message": ""
    },
    "variations": [{
        "title": {
            "value": "p1",
            "valid": true,
            "message": ""
        },
        "message": "",
        "cta": {
            "type": {
                "value": "DEEP_LINK",
                "valid": true,
                "message": ""
            },
            "actionLink": {
                "message": "",
                "valid": true,
                "value": 'abc'
            },
            "valid": true,
            "message": ""
        },
        "valid": true
    }, {
        "title": {
            "value": "p2",
            "valid": true,
            "message": ""
        },
        "message": "",
        "cta": {
            "type": {
                "value": "EXTERNAL",
                "valid": false,
                "message": ""
            },
            "actionLink": {
                "message": "",
                "valid": false
            },
            "valid": false,
            "message": "",
            "value": 'https://jsv.com'
        },
        "valid": false
    }],
    "valid": false,
    "message": "Perfectoo"
};
```
As you can see the resultant object gives you capability to drill down to any level to know whether that property is true or false. Plus not only that, if the outcome of a property is false, this information is bubbled up to all its parents upto the object level.e.g
```javascript
result.variations[0].valid //true
result.variations[1].valid //false
result.variations.valid//false
result.valid//false
```

To get the value of a property
```javascript
result.variations[0].title.value //p1
```

If there is an message you want to add to a property (like in case of error messages)
```javascript
result.message //Perfectoo
```
All this sounds good, but what about the pain you are going to incur while creating the Schema. 
Below is your Answer

## Schema Generator to your Rescue !!
So what does it take to generate your Schema.
```javascript
var Schema=JsOV.generateSchema(Obj,true);
JSON.stringify(Schema,null,"\t");
```
Yeah, that's it and you are ready with your boilerplate Schema. The first argument is your Object for which you need to generate schema and the second object is whether you want all your fields to be required or not. E.g
```javascript
var Obj={
    "name":"ABCD",
    "address":{
        "street":"Coder's street",
        "city":"Gotham"
    }
};
```
And your output will be (After using JSON.Stringify)

```javascript
{
	"type": "Object",
	"required": true,
	"validation": "",
	"data": {
		"name": {
			"type": "String",
			"required": true,
			"validation": ""
		},
		"address": {
			"type": "Object",
			"required": true,
			"validation": "",
			"data": {
				"street": {
					"type": "String",
					"required": true,
					"validation": ""
				},
				"city": {
					"type": "String",
					"required": true,
					"validation": ""
				}
			}
		}
	}
}
```

### Validations
There are two ways you can add validations
#### Type 1
You can write a custom function to evaluate your property. 
E.g consider an object 
```javascript
var obj={
   'cta':{
            'type':'DEEP_LINK',
            'actionLink':'abc'
        }
}
```
and its schema
```javascript
var Schema = {
    'cta': {
        'type': 'Object',
        'validation': function(cta) { //validation 1
            if (cta.actionlink === 'abc')
                return true;
            else
                return false;
        },
        'required': true,
        'data': {
            'type': {
                'type': 'String',
                'required': true,
                'validation': function(type, global) { //validation 2
                    if (type === 'DEEP_LINK' || type === 'EXTERNAL_URL')
                        return true;
                    else
                        return false;
                }
            },
            'actionLink': {
                'type': 'String',
                'required': true
            }
        }
    }
}
```
 
Here **validation 1** will take  
```javascript
{
	"type": "DEEP_LINK",
	"actionLink": "abc"
}
```
as its argument and **validation 2** will take
```javascript
'DEEP_LINK'
```
NOTE: here as you can see **validation 2**  function has a second argument. Second argument is optional, which provides you your whole object to perform complex validations.

#### Type 2
Using inbuilt validation properties
```javascript
//this will match whether the value of the property aginst the specified regex string
'validation':{
'RegEx':'abc'
}
```

E.g
```javascript
var Schema = {
    "type": "Object",
    "reuired": true,
    "message": "Perfectoo",
    "data": {
        "title": {
            "type": "String",
            "validation": { //Do it this way
                "RegEx": "abc"
            }
        }
    }
}
```
Just Like RegEx there are various kind of validations that are provided by JSV, below is the list

1. RegEx
2.  
3. 
4. 

NOTE: Incase there is any kind of validation that you want to add to the your custom validation to use them reapeatedly in your projet, you can use.

```javascript
/*This function will take two arguments where key is value of the property inside validation object (like here it is 2) and the second argument is the actual vale in original object against the key*/

jsOV.addCustomValidations('MaxLen',function(key,val){
   return val.length < = key; 
});
```
and then to use this
```javascript
var Schema = {
    "type": "Object",
    "reuired": true,
    "message": "Perfectoo",
    "data": {
        "title": {
            "type": "String",
            "validation": { //Do it this way
                "MaxLen": 2
            }
        }
    }
}
```
