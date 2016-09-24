var JsOV = (function(){
    var _GLOBAL_;

    var Validations={
        "RegEx":function(regex,value){
            var regEx=new RegExp(regex);
            return regEx.test(value);
        }
    };

    function isEmpty(obj) {
        // null and undefined are "empty"
        if (obj == null)
            return true;

        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) return false;
        }
        return true;
    }

    function checkValidation(instance,validation,required){
            if(required && isEmpty(instance))
            {
                return false;
            }
            if(validation && typeof validation ==='function' ){
                return validation(instance,_GLOBAL_);
            }
            else if(validation && typeof validation === 'object'){
                for (var key in validation){
                    if(Validations.hasOwnProperty(key) && typeof Validations[key] === 'function'){
                        return Validations[key](validation[key],instance);
                    }
                }
            }
        return true;
    };

    function checkError(obj){
        var invalid=0;
        if(obj.hasOwnProperty('valid') && obj.hasOwnProperty('_message'))
        {
            if(!obj.valid){
                invalid++;
            }
        }
        else{
            for(var prop in obj){
                if(obj[prop].hasOwnProperty('valid') && obj[prop].hasOwnProperty('_message')){
                    if(!obj[prop].valid){
                        invalid++;
                    }

                }else{
                        invalid+=checkError(obj[prop]);
                }
            }
        }
        return invalid;
    };

    function getType(attr) {
      return ({}).toString.call(attr).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };

    function toType(str){
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    //----------JsOV Utilities Ends-----------------//
    function validateArray(schemaArr, instanceArr){
            var validArr=[], zeroSchema = {};
            var zeroInstance = instanceArr[0];
            if(zeroInstance === undefined) {
                return validArr;
            }
            if(schemaArr.dataType === 'Object'){
                zeroSchema.type = schemaArr.dataType;
                zeroSchema.data = schemaArr.data[0];
            }
            else{
                zeroSchema = schemaArr.data[0];
            }

            var arrLength = instanceArr.length;
            for(var j=0; j<arrLength; j++) {
                var d;
                d = validate(zeroSchema, instanceArr[j]);
                validArr.push(d);
            }
            return validArr;
    };

    function validate(schema, instance) {

        var Dummy,
            n,
            isValid,
            subSchemaType,
            schemaType = schema.type.toLowerCase();

        if (isEmpty(instance) && schema.defaultVal) {
            Dummy={
                valid: true,
                _message: schema._message || '',
                value: schema.defaultVal
            };
        }
        else if( schemaType !== getType(instance) ) {
            console && console.log("Type Mismatch", [schema, instance]);
        } 
        else {
            switch(schemaType){
                case 'array':
                    Dummy = validateArray(schema, instance);
                    n = checkError(Dummy);
                    Dummy.valid = checkValidation(instance, schema.validation, schema.required) && !n ? true : false;
                    Dummy._message = schema._message || '';
                    
                break;

                case 'object':
                    Dummy={};
                    for(var i in schema.data) {
                        if(schema.data.hasOwnProperty(i)) {
                            subSchemaType = schema.data[i].type.toLowerCase();
                            if(!instance.hasOwnProperty(i)) {
                                if(schema.data[i].required){
                                    if(schema.data[i].defaultVal){
                                        Dummy[i]={
                                            value : schema.data[i].defaultVal,
                                            valid: true,
                                            _message: schema._message || ''
                                        };
                                    } else {
                                        Dummy[i]={
                                            _message : "Property Not found, Required",
                                            valid: false
                                        };
                                    }
                                }
                                else{
                                    continue;
                                }
                            }
                            else if (isEmpty(instance[i]) && schema.data[i].defaultVal) {
                                Dummy[i]={
                                    value : schema.data[i].defaultVal,
                                    valid: true,
                                    _message: schema._message || ''
                                };
                            }
                            else if( subSchemaType !== getType(instance[i]) ) {
                                console && console.error("Type Mismatch", [schema, instance]);
                            }
                            else {
                                switch(subSchemaType){
                                    //Special Handling for arrays
                                    case 'array':
                                        Dummy[i] = validateArray(schema.data[i], instance[i]);
                                        n = checkError(Dummy[i]);
                                        Dummy[i].valid = checkValidation(instance[i], schema.data[i].validation, schema.data[i].required) && !n ? true : false;
                                        Dummy[i]._message = schema.data[i]._message || '';
                                        
                                    break;
                                    //Special Handling for nested objects
                                    case 'object':
                                        Dummy[i] = validate(schema.data[i], instance[i]);
                                    break;

                                    default:
                                        Dummy[i]={
                                            value: instance[i],
                                            valid: checkValidation(instance[i], schema.data[i].validation, schema.data[i].required),
                                            _message: schema.data[i]._message || ''
                                        };
                                }
                            }
                        }
                    }
                    n = checkError(Dummy);
                    Dummy.valid = checkValidation(instance,schema.validation,schema.required) && !n ? true : false;
                    Dummy._message = schema._message || '';
                break;

                default:
                    Dummy={
                        value: instance,
                        valid: checkValidation(instance,schema.validation,schema.required),
                        _message: schema._message || ''
                    };
            }
        }
        return Dummy;
    };

    var JsOVInner={

        schemaValidator :function(Schema, Obj){
            _GLOBAL_=Obj;
            return validate(Schema, _GLOBAL_ );
        },

        generateSchema : function(obj,required){
            var Dummy = {},
                v = {}, o={},
                objType = getType(obj), propType;

            switch(objType){
                case 'object':
                    for(var i in obj){
                        propType = getType(obj[i]);
                        
                        switch(propType){
                            case 'array':
                                v=this.generateSchema(obj[i][0],required);
                                o[i] = {
                                    type: 'Array',
                                    required: required,
                                    validation: '',
                                    dataType: v.type,
                                    data: (v.type==='Object'||v.type==='Array') ? v.data : v
                                };
                            break;

                            case 'object':
                                o[i] = this.generateSchema(obj[i],required);
                            break;

                            default :
                                o[i] = {
                                    type: toType(propType),
                                    required: required,
                                    validation: ''
                                };
                        }
                    }

                    Dummy = {
                        type:'Object',
                        required:required,
                        validation:'',
                        data: o,
                    };
                break;
                
                case 'array':
                    v=this.generateSchema(obj[0],required);
                    Dummy = {
                        type: 'Array',
                        required: required,
                        validation: '',
                        dataType: v.type,
                        data: (v.type==='Object'||v.type==='Array') ? v.data : v 
                    };
                break;

                default :
                    Dummy = {
                        type: toType(objType),
                        required :required,
                        validation:''
                    };
            }
            return Dummy;
        },

        addCustomValidations: function(key,callback){
            Validations[key]=callback;
        }
    };

    return JsOVInner;
}());

if(typeof module === 'object'){
    module.exports=JsOV;
}