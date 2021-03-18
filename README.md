# Vue Validator
Vue 3 validator based on [@vue/composition-api](https://github.com/vuejs/composition-api), [@vuelidate/validators](https://vuelidate-next.netlify.app/) and [@vuelidate/core](https://vuelidate-next.netlify.app/).

This package is built to use validation on a generic reactive object,which displays inputs related to its type.
## Usage
This package has one main function: **useValidation**
```
export const useValidation: <FormDataType, FormDataValuesType extends unknown, InputTypes extends GenericInput = GenericInput>(
	inputs: Ref<InputType<FormDataType, InputTypes>> | InputType<FormDataType, InputTypes>,
	formData: Record<keyof FormDataType, FormDataValuesType> | Ref<Record<keyof FormDataType, FormDataValuesType>>,
	checkDirty?: boolean,
	registerAs?: string,
	callbacks?: Partial<{
		onInputChange: <K extends keyof FormDataType = keyof FormDataType>(key: K, value: FormDataType[K]) => void;
		onInputInvalid: <K extends keyof FormDataType = keyof FormDataType>(key: K) => void;
		onInputValid: <K extends keyof FormDataType = keyof FormDataType>(key: K) => void;
	}>) => {
	v: Ref<Validation<ValidationArgs<FormDataType>, Record<keyof FormDataType, FormDataValuesType>>>,
	isInvalid: boolean,
	isInputInvalid: (key: keyof FormDataType, excludeDirty?: boolean) => boolean,
	isInputTouched: (key: keyof FormDataType) => boolean
};
```
It receives a record of generic inputs with these properties: 
```{
export type GenericInput = {
	mandatory: boolean;
	name: string;
	rules: (string | {key: string, func: (value: any) => boolean})[];
	exclude_dirty?: boolean; //To avoid dirty check
}
```
a record of FormDataType, and other attributes: 

**checkDirty: whether to set invalid the form values until they aren't modified - see [The dirty state](https://vuelidate-next.netlify.app/guide.html#the-dirty-state)**

**registerAs: vuelidate registerAs attribute - see [https://vuelidate-next.netlify.app/](https://vuelidate-next.netlify.app/)**

**callbacks: these callbacks, if passed, are toggled for every attribute,**

### The function returns an object containing 
```
{
    v: Vuelidate object containing your form attributes, ready to be touched, see https://vuelidate-next.netlify.app/guide.html#the-dirty-state,
    isInvalid: Vuelidate generic isInvalid object,
    isInputInvalid(key): Function that returns if an input is invalid,
    isInputTouched(key): Function that returns if an input is touched, aka the form attribute has changed.    
}
```

### The library is **NOT** touching the attributes, if you want to apply automatic touch on change, you can use onChange callback like below:
```
const {v, isInvalid, isInputInvalid, isInputTouched} = useValidation<FormData, string | boolean>(inputs, formData, false, undefined, {
    onInputChange(key){
        v.value[key].$touch();
    }
});
```


### List of rules applicable:

**requiredIf:name,value** Sets input required when **$name** has **$value** value;

**requiredIfNot:name,value** Sets input required when **$name** has a value different from **$value**;

**sameAs:name** Input value needs to be same as **$name** value;

**notSameAs:name** Input value needs to be different from **$name** value;

**min:number** Input value needs to be at least **$number** chars long;

**max:number** Input value needs to have less than **$number** chars;

**minValue:number** Input value must be greater than **$number**;

**maxValue:number** Input value must be lower than **$number**;

**date** Input must be a valid date (YYYY-MM-DD);

**datetime** Input must be a valid date (YYYY-MM-DD HH:mm:ss);

**email** Input must be a valid email;

**required** Input is required (same as mandatory: true) in the object model;

**accepted** Input must be === true or === 1;

**full_number** Input must be numeric;

**number** Input must have a number in it;

**char** Input must have a char in it;

**regex:regex** Input must match the regex, es: regex:/^[a-z]+$/;

**minDate:date** Input date must be after or same as **$date** (YYYY-MM-DD);

**maxDate:date** Input date must be before or same as **$date** (YYYY-MM-DD);

**minDatetime:date** Input date must be after or same as **$date** (YYYY-MM-DD HH:mm:ss);

**maxDatetime:date** Input date must be before or same as **$date** (YYYY-MM-DD HH:mm:ss);

**minMonth:date** Input value must be after or equal to **$date** (YY-MM);

**maxMonth:date** Input value must be before or equal to **$date** (YY-MM);

**iban** Input value must be a valid european IBAN;

### Example

```
type FormData = {
    name: string;
    surname: string;
    email: string;
    privacy: boolean;
}

const inputs: Record<keyof FormData, GenericInput> = {
    name: {
        name: 'name',
        mandatory: false,
        rules: ['requiredIf:surname,'],
    },
    surname: {
        name: 'surname',
        mandatory: false,
        rules: ['requiredIf:name,'],
    },
    email: {
        name: 'email',
        mandatory: true,
        rules: []
    },
    privacy: {
        name: 'privacy',
        mandatory: true,
        rules: ['boolean']
    }
};
const formData = reactive<FormData>({
    name: "test",
    surname: "",
    email: "",
    privacy: false
});

const {v, isInvalid, isInputInvalid, isInputTouched} = useValidation<FormData, string | boolean>(inputs, formData, false);

return {
    v,
    isInvalid,
    isInputInvalid,
    isInputTouched
}
```
