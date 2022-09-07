import { ComputedRef, Ref } from 'vue-demi';
import { Validation, ValidationRule, ValidationRuleWithoutParams, ValidationRuleWithParams } from '@vuelidate/core';
import { GenericInput, InputType, RuleNames } from './src/types';

export * from './src/types';

export type ValidationFunction = (value: any) => boolean;
export type ValidationArgs<E extends Record<string | number, any> = Record<string | number, any>> = {
	[key in keyof E]: ValidationRule | ValidationArgs<E>
}
type ValidationRuleParams =
	ValidationRuleWithParams<{ equalTo: string; otherName: string; }>
	| ValidationRuleWithParams<{ max: number }>
	| ValidationRuleWithParams<{ min: number }>
	| ValidationRuleWithParams<{ length: number }>
	;
export const getRule: <K extends Record<string, any>, I extends GenericInput = GenericInput>(
	rule: RuleNames | { key: string, func: ValidationFunction },
	formData?:
		| {
		[key in keyof K]: any;
	}
		| Ref<{
		[key in keyof K]: any;
	}>,
) => {
	key: string; func: ((value: string) => boolean) | (() => ValidationRule)
		| ValidationRuleParams
		| ValidationRuleWithParams | ValidationRuleWithoutParams
} | undefined;

export const useValidationRules: <FormDataType, FormDataValuesType extends unknown, InputTypes extends GenericInput = GenericInput>(
	inputs: Ref<InputType<FormDataType, InputTypes>> | ComputedRef<InputType<FormDataType, InputTypes>> | InputType<FormDataType, InputTypes>,
	formData:
		| Record<keyof FormDataType, FormDataValuesType>
		| Ref<Record<keyof FormDataType, FormDataValuesType>>
		| ComputedRef<Record<keyof FormDataType, FormDataValuesType>>,
) => Record<keyof FormDataType, Record<string, ValidationRule<unknown>> | undefined>;


export const useValidation: <FormDataType, FormDataValuesType extends unknown, InputTypes extends GenericInput = GenericInput>(
	inputs: Ref<InputType<FormDataType, InputTypes>> | ComputedRef<InputType<FormDataType, InputTypes>> | InputType<FormDataType, InputTypes>,
	formData: Record<keyof FormDataType, FormDataValuesType> | Ref<Record<keyof FormDataType, FormDataValuesType>>,
	checkDirty?: boolean,
	registerAs?: string,
	callbacks?: Partial<{
		onInputChange: <K extends keyof FormDataType = keyof FormDataType>(key: K, value: FormDataType[K]) => void;
		onInputInvalid: <K extends keyof FormDataType = keyof FormDataType>(key: K) => void;
		onInputValid: <K extends keyof FormDataType = keyof FormDataType>(key: K) => void;
	}>) => {
	v: Ref<Validation<ValidationArgs<FormDataType>, Record<keyof FormDataType, FormDataValuesType>>>,
	isInvalid: Ref<boolean>,
	isInputInvalid: (key: keyof FormDataType, excludeDirty?: boolean) => boolean,
	isInputSilentlyInvalid: (key: keyof FormDataType) => boolean,
	isInputTouched: (key: keyof FormDataType) => boolean
};

export default useValidation;