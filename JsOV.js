var _GLOBAL_;

var Validations={

    "RegEx":function(regex,value){
        var regEx=new RegExp(regex);
        return regEx.test(value);
    }
};

//----------JsOV Utilities Starts-----------------//

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

var getType = function(attr) {
    return Object.prototype.toString.call(attr);
};

var checkValidation=function(instance,validation,required){
        if(required&&isEmpty(instance))
        {
            return false;
        }
        if(validation && typeof validation==='function' ){
            return validation(instance,_GLOBAL_);
        }
        else if(validation && typeof validation==='object'){
            for (var key in validation){
                if(Validations.hasOwnProperty(key)&&typeof Validations[key]==='function'){
                    return Validations[key](validation[key],instance);
                }
            }
        }

        return true;

};



var addFields=function(obj,isValid,message){
    obj.valid=isValid;
    obj._message=message||'';

    return obj;
};

var checkError=function(obj){
    var invalid=0;
    if(obj.hasOwnProperty('valid')&&obj.hasOwnProperty('_message'))
    {
        if(!obj.valid){
            invalid++;
        }
    }
    else{
        for(var prop in obj){
            if(obj[prop].hasOwnProperty('valid')&&obj[prop].hasOwnProperty('_message')){
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

//----------JsOV Utilities Ends-----------------//

var Types={
    'String':"[object String]",
    'Object':"[object Object]",
    'Array':"[object Array]",
    'Number':"[object Number]",
    'Boolean':"[object Boolean]",
    'Date': "[object Date]",
    'RegExp' : "[object RegExp]"
};

var JsOV={

    jsOVSchemaValidator :function(Schema, Obj){

       _GLOBAL_=Obj;
       var jsv={};
       var validateArray=function(schemaArr, instanceArr){
                var validArr=[];
                var zeroSchema = {};
                var zeroInstance = instanceArr[0];
                if(zeroInstance === undefined) {
                    return validArr;
                }


                if(Types[schemaArr.dataType]==getType({})){
                    zeroSchema.type=schemaArr.dataType;
                    zeroSchema.data=schemaArr.data[0];
                }
                else{
                    zeroSchema=schemaArr.data[0];
                }

                var j, arrLength = instanceArr.length;
                for(j=0; j<arrLength; j ++) {
                    var d;
                    d=validate(zeroSchema, instanceArr[j]);
                    validArr.push(d);
                }

            // var Vld=checkValidation(instance,schema.validation,schema.required);
                return validArr;
        };

        var validate = function(schema, instance) {

            var Dummy,n,isValid;
            var errors = 0;

            var addError = function(msg, attrs) {
                console.error(msg, attrs);
                errors += 1;
            };

            if (isEmpty(instance)&&schema.defaultVal) {
                Dummy={};
                Dummy.value=schema.defaultVal;
                Dummy.addFields(Dummy,true,schema._message);
            }

            else if( Types[schema.type] !== getType(instance) ) {
                addError("Type Mismatch", [schema, instance]);
            }
            else if(Types[schema.type]==getType("")||Types[schema.type]==getType(1)||Types[schema.type]==getType(true)){
                Dummy={};
                Dummy.value=instance;
                Dummy=addFields(Dummy,checkValidation(instance,schema.validation,schema.required),schema._message);

            }
            else if(Types[schema.type]==getType([])){
                Dummy=[];
                Dummy=validateArray(schema, instance);
                n=checkError(Dummy);
                isValid=checkValidation(instance,schema.validation,schema.required)&&!n ? true : false;
                Dummy=addFields(Dummy,isValid,schema._message);
                
            }

            else {
                Dummy={};
                for(var i in schema.data) {
                    if(schema.data.hasOwnProperty(i)) {

                        if(!instance.hasOwnProperty(i)) {
                            if(schema.data[i].required){
                                if(schema.data[i].defaultVal){
                                    Dummy[i]={};
                                    Dummy[i].value=schema.data[i].defaultVal;
                                    Dummy[i]=addFields(Dummy[i],true,schema._message);
                                } else {
                                    Dummy[i]={};
                                    Dummy[i]._message="Property Not found, Required";
                                    Dummy[i].valid=false;
                                }
                            }
                            else{
                                continue;
                            }
                        }
                        if (isEmpty(instance[i])&&schema.data[i].defaultVal) {
                            Dummy[i]={};
                            Dummy[i].value=schema.data[i].defaultVal;
                            Dummy[i]=addFields(Dummy[i],true,schema._message);
                        }
                        else if( Types[schema.data[i].type] !== getType(instance[i]) ) {
                            addError("Type Mismatch", [schema, instance]);
                        }
                        else if(Types[schema.data[i].type]==getType("")||Types[schema.data[i].type]==getType(1)||Types[schema.data[i].type] ==getType(true)){
                            
                            Dummy[i]={};
                            Dummy[i].value=instance[i];
                            Dummy[i]=addFields(Dummy[i],checkValidation(instance[i],schema.data[i].validation,schema.data[i].required),schema.data[i]._message);

                        }
                        //Special Handling for arrays
                        else if( Types[schema.data[i].type] === getType([]) ) {
                            Dummy[i]=[];
                            Dummy[i]=validateArray(schema.data[i], instance[i]);
                            n=checkError(Dummy[i]);
                            isValid=checkValidation(instance[i],schema.data[i].validation,schema.data[i].required)&&!n ? true : false;
                            Dummy[i]=addFields(Dummy[i],isValid,schema.data[i]._message);
                            
                        }
                        //Special Handling for nested objects
                        else if( Types[schema.data[i].type] === getType({}) ) {
                            Dummy[i]={};
                            Dummy[i]=validate(schema.data[i], instance[i]);
                            n=checkError(Dummy[i]);
                            isValid=checkValidation(instance[i],schema.data[i].validation,schema.data[i].required)&&!n ? true : false;
                            Dummy[i]=addFields(Dummy[i],isValid,schema.data[i]._message);
                            
                                
                        }

                    }

                }
                n=checkError(Dummy);
                isValid=checkValidation(instance,schema.validation,schema.required)&&!n ? true : false;
                // Dummy.message='hello';
                Dummy=addFields(Dummy,isValid,schema._message);
            }

            return Dummy;

        };

        return validate(Schema, _GLOBAL_ );

    },

    generateSchema : function(obj,required){
            var Dummy={},v={};
            var getType = function(attr) {
                return Object.prototype.toString.call(attr);
            };
            if(getType(obj)==="[object Object]"){
                Dummy.type='Object';
                Dummy.required=required;
                Dummy.validation='';
                var o={};
                for(var i in obj){
                    o[i]={};
                    if(getType(obj[i])==="[object String]"){
                        o[i].type='String';
                        o[i].required=required;
                        o[i].validation='';
                    }
                    else if(getType(obj[i])==="[object Number]"){
                        o[i].type='Number';
                        o[i].required=required;
                        o[i].validation='';
                    }
                    else if(getType(obj[i])==="[object Boolean]"){
                        o[i].type='Boolean';
                        o[i].required=required;
                        o[i].validation='';
                    }
                    else if(getType(obj[i])==="[object Array]"){
                        o[i].type='Array';
                        o[i].required=required;
                        o[i].validation='';
                        v={};
                        v=this.generate(obj[i][0],required);
                        o[i].dataType=v.type;
                        o[i].data=[];
                        if(v.type==='Object'||v.type==='Array'){
                        o[i].data.push(v.data);
                        }else{
                           o[i].data.push(v);
                        }

                    }
                    else if(getType(obj[i])==="[object Object]"){
                        v={};
                        v=this.generate(obj[i],required);
                        o[i]=v;

                    }

                }
                Dummy.data={};
                Dummy.data=o;

            }
            else if(getType(obj)==="[object Array]")
            {
                Dummy.type='Array';
                Dummy.required=required;
                Dummy.validation='';
                v={};
                v=this.generate(obj[0],required);
                Dummy.dataType=v.type;
                Dummy.data=[];
                Dummy.data.push(v);
            }
            else if(getType(obj)==="[object String]"){
                Dummy.type='String';
                Dummy.required=required;
                Dummy.validation='';
            }
            else if(getType(obj)==="[object Number]"){
                Dummy.type='Number';
                Dummy.required=required;
                Dummy.validation='';
            }
            else if(getType(obj)==="[object Boolean]"){
                Dummy.type='Boolean';
                Dummy.required=required;
                Dummy.validation='';
            }

            return Dummy;
        },

        addCustomValidations:function(key,callback){
            Validations[key]=callback;
        }

};

if(typeof module === 'object'){
    module.exports=JsOV;
}


