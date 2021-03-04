import { useVuelidate, Validation, ValidationRule } from '@vuelidate/core';
import { computed, isReactive, isRef, ref, Ref, toRefs, watch } from 'vue-demi';
import { GenericInput, InputType } from './types';
import useValidationRules from './validationRules';
export default function useValidation<E, K extends unknown, I extends GenericInput = GenericInput>(
	inputs: Ref<InputType<E, I>> | InputType<E, I>,
	formData:
		| {
				[key in keyof E]: K;
		  }
		| Ref<
				{
					[key in keyof E]: K;
				}
		  >,
	checkDirty?: boolean,
	registerAs?: string,
	callbacks?: Partial<{
		onInputChange: <K extends keyof E = keyof E>(key: K, value: E[K]) => void;
		onInputInvalid: <K extends keyof E = keyof E>(key: K) => void;
		onInputValid: <K extends keyof E = keyof E>(key: K) => void;
	}>,
) {
	const rules = useValidationRules<E, K, I>(inputs, formData);
	type ValidationArgs = {
		[key in keyof E]: ValidationRule<K> | ValidationArgs;
	};

	// @ts-ignore
	const v = useVuelidate<
		// @ts-ignore
		ValidationArgs,
		Record<keyof E, K>
	>(rules, formData, registerAs);

	const isInvalid = computed<boolean>(() => {
		// tslint:disable-next-line:no-shadowed-variable
		const keys: (keyof E)[] = Object.keys(v.value).filter((key) => {
			return key.substr(0, 1) !== '$' && key.substr(0, 1) !== '_';
		}) as (keyof E)[];

		return keys.some((key) => {
			const validationObject: Validation = v.value[key] as unknown as Validation;
			const inputValues: Record<keyof E, I> | undefined = isRef(inputs) ? inputs.value : inputs;
			const input: I | undefined = typeof inputValues !== 'undefined' ? inputValues[key] : undefined;

			let dirtyCheck = checkDirty;
			if (dirtyCheck && input && input.exclude_dirty) {
				dirtyCheck = false;
			}

			if (dirtyCheck === true && !validationObject.$anyDirty && !validationObject.$dirty) {
				return true;
			}

			return validationObject.$error;
		});
	});

	const isInputInvalid = (key: keyof E, excludeDirty?: boolean) => {
		let dirtyCheck = checkDirty;
		const inputValues: Record<keyof E, I> | undefined = isRef(inputs) ? inputs.value : inputs;
		const input: I | undefined = typeof inputValues !== 'undefined' ? inputValues[key] : undefined;
		if (dirtyCheck && (excludeDirty || (input && input.exclude_dirty))) {
			dirtyCheck = false;
		}

		if (dirtyCheck === true && !v.value[key].$dirty && !v.value[key].$anyDirty) {
			return true;
		}

		return v.value[key].$error;
	};

	const data = isRef(formData) ? formData.value : formData;
	const keys: (keyof E)[] = Object.keys(formData) as (keyof E)[];

	const inputsTouched: Ref<(keyof E)[]> = ref([]);
	keys.forEach((itemKey) => {
		if (isReactive(data)) {
			const { [itemKey]: element } = toRefs(data);
			watch(element, (newValue, oldValue) => {
				if (newValue !== oldValue) {
					if (callbacks?.onInputChange) {
						callbacks.onInputChange(itemKey, newValue as E[keyof E]);
					}

					inputsTouched.value.push(itemKey);
				}
			});

			if (callbacks?.onInputValid || callbacks?.onInputInvalid) {
				const { [itemKey]: element } = v.value;
				if (typeof element !== 'undefined') {
					watch(element, () => {
						if (callbacks?.onInputInvalid && isInputInvalid(itemKey)) {
							callbacks.onInputInvalid(itemKey);
						}

						if (callbacks?.onInputValid && !isInputInvalid(itemKey)) {
							callbacks.onInputValid(itemKey);
						}
					});
				}
			}
		}
	});

	const isInputTouched = (key: keyof E) => {
		return inputsTouched.value.indexOf(key) > -1;
	};

	return {
		v,
		isInvalid,
		isInputInvalid,
		isInputTouched,
	};
}
