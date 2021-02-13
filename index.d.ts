import {Ref} from "vue-demi";
import {Validation, ValidationRule} from "@vuelidate/core";
import {InputType} from "./src/types";

export * from "./src/types";
import {GenericInput} from "./src/types";
import {RuleNames} from "./src/types";

export type ValidationArgs<E extends Record<string | number, any> = Record<string | number, any>> = {
	[key in keyof E]: ValidationRule | ValidationArgs<E>
}
export const getRule: <K extends Record<string, any>, I extends GenericInput = GenericInput>(
	rule: RuleNames,
	formData?:
		| {
		[key in keyof K]: any;
	}
		| Ref<{
		[key in keyof K]: any;
	}>,
) => { key: string; func: ((value: string) => boolean) | (() => ValidationRule) } | undefined;

export const useValidationRules: <E, K extends unknown, I extends GenericInput = GenericInput>(
	inputs: Ref<InputType<E, I>> | InputType<E, I>,
	formData:
		| {
		[key in keyof E]: K;
	}
		| Ref<{
		[key in keyof E]: K;
	}>,
) => { [key in keyof E]?: { [p: string]: ValidationRule<unknown> } | undefined };


export const useValidation: <E, K extends unknown, I extends GenericInput = GenericInput>(
	inputs: Ref<InputType<E, I>> | InputType<E, I>,
	formData: Record<keyof E, K> | Ref<Record<keyof E, K>>,
	checkDirty?: boolean,
	registerAs?: string,
	callbacks?: Partial<{
		onInputChange: <K extends keyof E = keyof E>(key: K, value: E[K]) => void;
		onInputInvalid: <K extends keyof E = keyof E>(key: K) => void;
		onInputValid: <K extends keyof E = keyof E>(key: K) => void;
	}>) => {
	v: Ref<Validation<ValidationArgs<E>, Record<keyof E, K>>>,
	isInvalid: boolean,
	isInputInvalid: (key: keyof E, excludeDirty?: boolean) => boolean,
	isInputTouched: (key: keyof E) => boolean
};

export default useValidation;