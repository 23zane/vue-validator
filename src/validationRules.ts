import {ValidationRule, ValidationRuleWithoutParams, ValidationRuleWithParams} from '@vuelidate/core';
import { computed, ComputedRef, isRef, Ref } from 'vue';
import {email, maxLength, minLength, not, required, required as requiredFunction, sameAs} from '@vuelidate/validators';
import { GenericInput, InputType, RuleNames, ValidationFunction } from './types';
import moment from 'moment/moment';
import Vue from 'vue';
type ValidationRuleParams =
	ValidationRuleWithParams<{ equalTo: string; otherName: string; }>
	| ValidationRuleWithParams<{ max: number }>
	| ValidationRuleWithParams<{ min: number }>
	| ValidationRuleWithParams<{ length: number }>
	;


export function getRule<K extends Record<string, any>, I extends GenericInput = GenericInput>(
	rule: RuleNames | {key: string, func: ValidationFunction},
	formData?:
		| {
		[key in keyof K]: any;
	}
		| Ref<{
		[key in keyof K]: any;
	}>,
): {
	key: string; func: ((value: string) => boolean) | (() => ValidationRule)
		| ValidationRuleParams
		| ValidationRuleWithParams | ValidationRuleWithoutParams
} | undefined {
	if(typeof rule === 'object'){
		return {
			key: rule.key,
			func: rule.func
		}
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
			func: (value: string) => {
				if(!value){
					return true;
				}
				return (
					value.length >= 8 &&
					new RegExp('[a-z]').test(value) &&
					new RegExp('[A-Z]').test(value) &&
					new RegExp('[0-9]').test(value)
				);
			},
		};
	}

	if (rule.toLowerCase().localeCompare('telephone') === 0) {
		return {
			key: 'telephone',
			func: (value: string) => {
				if(!value){
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
			func: (value: string | boolean | number) => {
				return value === 1 || value === true;
			},
		};
	}
	if (rule.toLowerCase().localeCompare('char') === 0) {
		return {
			key: 'char',
			func: (value: string) => {
				if(!value){
					return true;
				}
				return value.length >= 8;
			},
		};
	}
	if (rule.toLowerCase().localeCompare('uppercase') === 0) {
		return {
			key: 'uppercase',
			func: (value: string) => {
				if(!value){
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
			func: (value: string) => {
				if(!value){
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
			func: (value: string) => {
				if(!value){
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
			func: (value: string) => {
				const reg = new RegExp('^[0-9]+$');
				return reg.test(value);
			},
		};
	}

	if (rule.toLowerCase().localeCompare('currency') === 0) {
		return {
			key: 'currency',
			func: (value: string | number | null) => {
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
				func: (value: string) => {
					const data: {
						[key in keyof K]: any;
					} = isRef(formData) ? {...formData!.value} : {...formData};

					return data[name as keyof K] === value;
				}
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
			func: (value: string) => {
				return +value >= +rule.replace('minValue:', '');
			},
		};
	}

	if (rule.indexOf('maxValue:') > -1) {
		return {
			key: 'maxValue',
			func: (value: string) => {
				return +value <= +rule.replace('maxValue:', '');
			},
		};
	}

	if (rule.indexOf('minDate:') > -1) {
		return {
			key: 'minDate',
			func: (value: string) => {
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
			func: (value: string) => {
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
			func: (value: string) => {
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
			func: (value: string) => {
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
			func: (value: string) => {
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
			func: (value: string) => {
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
			func(
				this:
					| (Vue & {
					[key: string]: string | Vue;
				})
					| undefined,
				value: string | string[] | number[],
			) {
				const nameValue = rule.replace('requiredIf:', '');
				let name = nameValue;
				let val;

				if (nameValue.indexOf(',') > -1) {
					name = nameValue.split(',')[0];
					val = nameValue.split(',')[1];
				}

				const bindings = name.split('.');

				let ref: Vue | string | null | undefined = this;

				if (val === 'true') {
					val = true;
				}

				if (val === 'false') {
					val = false;
				}

					if (typeof formData !== 'undefined') {
						const data: {
							[key in keyof K]: any;
						} = isRef(formData) ? {...formData.value} : {...formData};

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
						ref = ref[b] as Vue | string;
					});
				} else {
					ref = this![name];
				}
				if (ref === null || typeof ref === 'undefined') {
					return false;
				}

				let needsToCheck: boolean = !!ref && (ref as string).length > 0;

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
			func (
				this:
					| (Vue & {
					[key: string]: string | Vue;
				})
					| undefined,
				value: string | string[] | number[],
			) {
				const nameValue = rule.replace('requiredIfNot:', '');
				let name = nameValue;
				let val;

				if (nameValue.indexOf(',') > -1) {
					name = nameValue.split(',')[0];
					val = nameValue.split(',')[1];
				}

				const bindings = name.split('.');

				let ref: Vue | string | null | undefined = this;

				if (val === 'true') {
					val = true;
				}

				if (val === 'false') {
					val = false;
				}

					if (typeof formData !== 'undefined') {
						const data: {
							[key in keyof K]: any;
						} = isRef(formData) ? {...formData.value} : {...formData};

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
						ref = ref[b] as Vue | string;
					});
				} else {
					ref = this![name];
				}
				if (ref === null || typeof ref === 'undefined') {
					return false;
				}

				let needsToCheck: boolean = !!ref && (ref as string).length > 0;

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
			func: (value: string) => {
				if(!value){
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
			func: (value: string) => {
				if(!value){
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
			func: (value: string) => {
				if(!value){
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
			func: (value: string) => {
				if(!value){
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
			func: (value: string) => {
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
			func: (value: string) => {
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
			func: (value: string) => {
				if (!value) {
					return true;
				}
				const reg = new RegExp(/^[0-9]{4}-[0-9]{2}$/);
				return reg.test(value);
			},
		};
	}

	if(rule.toLowerCase().localeCompare('postal_code') === 0){
		return {
			key: 'postal_code',
			func: (value: string) => {
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
			func: (value: string) => {
				if(!value){
					return true;
				}
				const reg = new RegExp(/^[0-9]{11}$/);
				return reg.test(value);
			},
		};
	}

	if (rule.localeCompare('App\\Rules\\TaxCode') === 0 || rule.toLowerCase().localeCompare('tax_code') === 0) {
		return {
			key: 'tax_code',
			func: (value: string) => {
				if(!value){
					return true;
				}
				const reg = new RegExp(/^([a-zA-Z]{6})([0-9]{2})([a-zA-Z])([0-9]{2})([a-zA-Z])([0-9]{3})([a-zA-Z])$/);
				return reg.test(value);
			},
		};
	}

	if (rule.localeCompare('App\\Rules\\CompanyTaxCode') === 0 || rule.toLowerCase().localeCompare(
		'company_tax_code') === 0) {
		return {
			key: 'company_tax_code',
			func: (value: string) => {
				if(!value){
					return true;
				}
				const reg = new RegExp(/^([a-zA-Z]{6})([0-9]{2})([a-zA-Z])([0-9]{2})([a-zA-Z])([0-9]{3})([a-zA-Z])$/);

				const reg2 = new RegExp(/^[0-9]{11}$/);
				return reg2.test(value) || reg.test(value);
			},
		};
	}
}

export default function useValidationRules<E, K, I extends GenericInput = GenericInput>(
	inputs: Ref<InputType<E, I>> | ComputedRef<InputType<E, I>>| InputType<E, I>,
	formData:
		| {
		[key in keyof E]: K;
	}
		| Ref<{
		[key in keyof E]: K;
	}>,
) {
	return computed(() => {

		const rules: {
			[key in keyof E]?: {
				[key: string]: ValidationRule;
			};
		} = {};

		let inputValues: InputType<E>;
		if (isRef(inputs)) {
			inputValues = inputs.value;
		} else {
			inputValues = {...inputs};
		}

		type inputsType = typeof inputValues;
		(Object.keys(inputValues) as (keyof inputsType)[]).forEach((key) => {
			const input = inputValues[key];
			if (typeof rules[key] === 'undefined') {
				rules[key] = {};
			}

			if (input.mandatory) {
				rules[key] = {
					...rules[key]!,
					required: requiredFunction,
				};
			}
			input.rules.forEach((rule) => {
				const ruleObject = getRule(rule, formData) as
					| {
					key: string;
					func: ValidationRule;
				}
					| undefined;
				if (ruleObject) {
					if (typeof rules[key] === 'undefined') {
						rules[key] = {};
					}

					let newKey: string = ruleObject.key.toString();
					let i = 0;

					while (rules[key]!.hasOwnProperty(newKey)) {
						newKey = ruleObject.key.toString() + (i++).toString();
					}

					rules[key] = {
						...rules[key]!,
						[newKey]: ruleObject.func,
					};
				}
			});
		});

		return rules;
	});

}
