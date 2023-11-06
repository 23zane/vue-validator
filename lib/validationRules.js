import { computed, isRef } from 'vue';
import { email, maxLength, minLength, not, required, required as requiredFunction, sameAs, } from '@vuelidate/validators';
import moment from 'moment/moment';
export function getRule(rule, formData) {
    if (typeof rule === 'object') {
        return {
            key: rule.key,
            func: rule.func,
        };
    }
    if (rule.toLowerCase().localeCompare('required') === 0) {
        return {
            key: 'required',
            func: required,
        };
    }
    if (rule.toLowerCase().localeCompare('email') === 0) {
        return {
            key: 'email',
            func: email,
        };
    }
    if (rule.toLowerCase().localeCompare('password') === 0) {
        return {
            key: 'password',
            func: (value) => {
                if (!value) {
                    return true;
                }
                return (value.length >= 8 &&
                    new RegExp('[a-z]').test(value) &&
                    new RegExp('[A-Z]').test(value) &&
                    new RegExp('[0-9]').test(value));
            },
        };
    }
    if (rule.toLowerCase().localeCompare('telephone') === 0) {
        return {
            key: 'telephone',
            func: (value) => {
                if (!value) {
                    return true;
                }
                if (value.toString().length < 7 || value.toString().length > 14) {
                    return false;
                }
                return new RegExp(/^(3).*/).test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('accepted') === 0) {
        return {
            key: 'accepted',
            func: (value) => {
                return value === 1 || value === true;
            },
        };
    }
    if (rule.toLowerCase().localeCompare('char') === 0) {
        return {
            key: 'char',
            func: (value) => {
                if (!value) {
                    return true;
                }
                return value.length >= 8;
            },
        };
    }
    if (rule.toLowerCase().localeCompare('symbol') === 0) {
        return {
            key: 'uppercase',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp('[@!$%&*]');
                return reg.test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('uppercase') === 0) {
        return {
            key: 'uppercase',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp('[A-Z]');
                return reg.test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('lowercase') === 0) {
        return {
            key: 'lowercase',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp('[a-z]');
                return reg.test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('number') === 0) {
        return {
            key: 'number',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp('[0-9]');
                return reg.test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('full_number') === 0) {
        return {
            key: 'full_number',
            func: (value) => {
                const reg = new RegExp('^[0-9]+$');
                return reg.test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('currency') === 0) {
        return {
            key: 'currency',
            func: (value) => {
                if (value === null || !value.toString().trim()) {
                    return true;
                }
                const reg = new RegExp('([0-9]+),([0-9]{2})');
                return reg.test(value.toString());
            },
        };
    }
    if (rule.indexOf('sameAs:') > -1) {
        const [ruleName, name] = rule.split(':');
        if (typeof formData !== 'undefined' && formData.hasOwnProperty(name)) {
            return {
                key: ruleName,
                func: (value) => {
                    const data = isRef(formData) ? Object.assign({}, formData.value) : Object.assign({}, formData);
                    return data[name] === value;
                },
            };
        }
        return {
            key: 'sameAs',
            func: sameAs(rule.replace('sameAs:', '')),
        };
    }
    if (rule.indexOf('notSameAs:') > -1) {
        return {
            key: 'notSameAs',
            func: not(sameAs(rule.replace('notSameAs:', ''))),
        };
    }
    if (rule.indexOf('max:') > -1) {
        return {
            key: 'maxLength',
            func: maxLength(+rule.replace('max:', '')),
        };
    }
    if (rule.indexOf('min:') > -1) {
        return {
            key: 'minLength',
            func: minLength(+rule.replace('min:', '')),
        };
    }
    if (rule.indexOf('minValue:') > -1) {
        return {
            key: 'minValue',
            func: (value) => {
                return +value >= +rule.replace('minValue:', '');
            },
        };
    }
    if (rule.indexOf('maxValue:') > -1) {
        return {
            key: 'maxValue',
            func: (value) => {
                return +value <= +rule.replace('maxValue:', '');
            },
        };
    }
    if (rule.indexOf('minDate:') > -1) {
        return {
            key: 'minDate',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
                if (reg.test(value)) {
                    const minDate = moment(rule.replace('minDate:', ''), 'YYYY-MM-DD');
                    const actualDate = moment(value, 'YYYY-MM-DD');
                    return actualDate.isSameOrAfter(minDate);
                }
                return false;
            },
        };
    }
    if (rule.indexOf('maxDate:') > -1) {
        return {
            key: 'maxDate',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
                if (reg.test(value)) {
                    const maxDate = moment(rule.replace('maxDate:', ''), 'YYYY-MM-DD');
                    const actualDate = moment(value, 'YYYY-MM-DD');
                    return actualDate.isSameOrBefore(maxDate);
                }
                return false;
            },
        };
    }
    if (rule.indexOf('minDatetime:') > -1) {
        return {
            key: 'minDatetime',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}\s[0-9]{2}:[0-9]{2}$/);
                if (reg.test(value)) {
                    const minDate = moment(rule.replace('minDatetime:', ''), 'YYYY-MM-DD HH:mm');
                    const actualDate = moment(value, 'YYYY-MM-DD HH:mm');
                    return actualDate.isSameOrAfter(minDate);
                }
                return false;
            },
        };
    }
    if (rule.indexOf('maxDatetime:') > -1) {
        return {
            key: 'maxDatetime',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}\s[0-9]{2}:[0-9]{2}$/);
                if (reg.test(value)) {
                    const maxDate = moment(rule.replace('maxDatetime:', ''), 'YYYY-MM-DD HH:mm');
                    const actualDate = moment(value, 'YYYY-MM-DD HH:mm');
                    return actualDate.isSameOrBefore(maxDate);
                }
                return false;
            },
        };
    }
    if (rule.indexOf('minMonth:') > -1) {
        return {
            key: 'minMonth',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^[0-9]{4}-[0-9]{2}$/);
                if (reg.test(value)) {
                    const minDate = moment(rule.replace('minMonth:', '') + '-01', 'YYYY-MM-DD');
                    const actualDate = moment(value, 'YYYY-MM-DD');
                    return actualDate.isSameOrAfter(minDate);
                }
                return false;
            },
        };
    }
    if (rule.indexOf('maxMonth:') > -1) {
        return {
            key: 'maxMonth',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^[0-9]{4}-[0-9]{2}$/);
                if (reg.test(value)) {
                    const maxDate = moment(rule.replace('maxMonth:', '') + '-31', 'YYYY-MM-DD');
                    const actualDate = moment(value, 'YYYY-MM-DD');
                    return actualDate.isSameOrBefore(maxDate);
                }
                return false;
            },
        };
    }
    if (rule.indexOf('requiredIf:') > -1) {
        return {
            key: 'requiredIf',
            func(value) {
                const nameValue = rule.replace('requiredIf:', '');
                let name = nameValue;
                let val;
                if (nameValue.indexOf(',') > -1) {
                    name = nameValue.split(',')[0];
                    val = nameValue.split(',')[1];
                }
                const bindings = name.split('.');
                let ref = this;
                if (val === 'true') {
                    val = true;
                }
                if (val === 'false') {
                    val = false;
                }
                if (typeof formData !== 'undefined') {
                    const data = isRef(formData) ? Object.assign({}, formData.value) : Object.assign({}, formData);
                    if (!data.hasOwnProperty(name)) {
                        return false;
                    }
                    if (data[name] === val) {
                        return Array.isArray(value)
                            ? value.length > 0
                            : value != null && value.toString().length > 0;
                    }
                    return true;
                }
                if (!ref) {
                    return false;
                }
                if (bindings.length > 0) {
                    bindings.forEach((b) => {
                        if (ref === null || typeof ref === 'undefined') {
                            return false;
                        }
                        // @ts-ignore
                        ref = ref[b];
                    });
                }
                else {
                    ref = this[name];
                }
                if (ref === null || typeof ref === 'undefined') {
                    return false;
                }
                let needsToCheck = !!ref && ref.length > 0;
                if (typeof val !== 'undefined') {
                    needsToCheck = ref == val;
                }
                if (needsToCheck) {
                    return value != null && value.toString().trim().length > 0;
                }
                return true;
            },
        };
    }
    if (rule.indexOf('requiredIfNot:') > -1) {
        return {
            key: 'requiredIfNot',
            func(value) {
                const nameValue = rule.replace('requiredIfNot:', '');
                let name = nameValue;
                let val;
                if (nameValue.indexOf(',') > -1) {
                    name = nameValue.split(',')[0];
                    val = nameValue.split(',')[1];
                }
                const bindings = name.split('.');
                let ref = this;
                if (val === 'true') {
                    val = true;
                }
                if (val === 'false') {
                    val = false;
                }
                if (typeof formData !== 'undefined') {
                    const data = isRef(formData) ? Object.assign({}, formData.value) : Object.assign({}, formData);
                    if (!data.hasOwnProperty(name)) {
                        return false;
                    }
                    if (data[name] !== val) {
                        return Array.isArray(value)
                            ? value.length > 0
                            : value != null && value.toString().length > 0;
                    }
                    return true;
                }
                if (!ref) {
                    return false;
                }
                if (bindings.length > 0) {
                    bindings.forEach((b) => {
                        if (ref === null || typeof ref === 'undefined') {
                            return false;
                        }
                        // @ts-ignore
                        ref = ref[b];
                    });
                }
                else {
                    ref = this[name];
                }
                if (ref === null || typeof ref === 'undefined') {
                    return false;
                }
                let needsToCheck = !!ref && ref.length > 0;
                if (typeof val !== 'undefined') {
                    needsToCheck = ref !== val;
                }
                if (needsToCheck) {
                    return value != null && value.toString().trim().length > 0;
                }
                return true;
            },
        };
    }
    if (rule.indexOf('regex:') > -1) {
        return {
            key: 'regex',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const stringValue = rule.replace('regex:/', '');
                const reg = new RegExp(stringValue.substr(0, stringValue.length - 1));
                return reg.test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('number') === 0) {
        return {
            key: 'number',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^([0-9]+)$/);
                return reg.test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('iban') === 0) {
        return {
            key: 'iban',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^[a-zA-Z]{2}[0-9]{2}[a-zA-Z0-9]{4}[0-9]{7}([a-zA-Z0-9]?){0,16}$/);
                return reg.test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('stamp_number') === 0) {
        return {
            key: 'stamp_number',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^([0-9]{14})$/);
                return reg.test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('date') === 0) {
        return {
            key: 'date',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
                return reg.test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('datetime') === 0) {
        return {
            key: 'datetime',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}\s[0-9]{2}:[0-9]{2}$/);
                return reg.test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('month_year') === 0) {
        return {
            key: 'date',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^[0-9]{4}-[0-9]{2}$/);
                return reg.test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('postal_code') === 0) {
        return {
            key: 'postal_code',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^[0-9]{5}$/);
                return reg.test(value);
            },
        };
    }
    if (rule.localeCompare('App\\Rules\\VatCode') === 0 || rule.toLowerCase().localeCompare('vat_code') === 0) {
        return {
            key: 'regex',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^[0-9]{11}$/);
                return reg.test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('cif') === 0) {
        return {
            key: 'cif',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^[a-zA-Z][0-9]{7}[a-zA-Z]$/);
                return reg.test(value);
            },
        };
    }
    if (rule.localeCompare('App\\Rules\\TaxCode') === 0 || rule.toLowerCase().localeCompare('tax_code') === 0) {
        return {
            key: 'tax_code',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^([a-zA-Z]{6})([0-9]{2})([a-zA-Z])([0-9]{2})([a-zA-Z])([0-9]{3})([a-zA-Z])$/);
                return reg.test(value);
            },
        };
    }
    if (rule.toLowerCase().localeCompare('nif') === 0) {
        return {
            key: 'nif',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^[a-zA-Z][0-9]{8}[a-zA-Z]$/);
                return reg.test(value);
            },
        };
    }
    if (rule.localeCompare('App\\Rules\\CompanyTaxCode') === 0 || rule.toLowerCase().localeCompare('company_tax_code') === 0) {
        return {
            key: 'company_tax_code',
            func: (value) => {
                if (!value) {
                    return true;
                }
                const reg = new RegExp(/^([a-zA-Z]{6})([0-9]{2})([a-zA-Z])([0-9]{2})([a-zA-Z])([0-9]{3})([a-zA-Z])$/);
                const reg2 = new RegExp(/^[0-9]{11}$/);
                return reg2.test(value) || reg.test(value);
            },
        };
    }
}
export default function useValidationRules(inputs, formData) {
    return computed(() => {
        const rules = {};
        let inputValues;
        if (isRef(inputs)) {
            inputValues = inputs.value;
        }
        else {
            inputValues = Object.assign({}, inputs);
        }
        Object.keys(inputValues).forEach((key) => {
            const input = inputValues[key];
            if (typeof rules[key] === 'undefined') {
                rules[key] = {};
            }
            if (input.mandatory) {
                rules[key] = Object.assign(Object.assign({}, rules[key]), { required: requiredFunction });
            }
            input.rules.forEach((rule) => {
                const ruleObject = getRule(rule, formData);
                if (ruleObject) {
                    if (typeof rules[key] === 'undefined') {
                        rules[key] = {};
                    }
                    let newKey = ruleObject.key.toString();
                    let i = 0;
                    while (rules[key].hasOwnProperty(newKey)) {
                        newKey = ruleObject.key.toString() + (i++).toString();
                    }
                    rules[key] = Object.assign(Object.assign({}, rules[key]), { [newKey]: ruleObject.func });
                }
            });
        });
        return rules;
    });
}
