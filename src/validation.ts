import { useVuelidate, Validation, ValidationRule, ValidationArgs } from '@vuelidate/core';
import { computed, ComputedRef, isReactive, isRef, ref, Ref, toRefs, watch } from 'vue-demi';
import { GenericInput, InputType } from './types';
import useValidationRules from './validationRules';

export default function useValidation<E, K extends unknown, I extends GenericInput = GenericInput>(
	inputs: Ref<InputType<E, I>> | ComputedRef<InputType<E, I>> | InputType<E, I>,
	formData:
		| {
		[key in keyof E]: K;
	}
		| Ref<{
		[key in keyof E]: K;
	}>,
	checkDirty?: boolean,
	registerAs?: string,
	callbacks?: Partial<{
		onInputChange: <K extends keyof E = keyof E>(key: K, value: E[K]) => void;
		onInputInvalid: <K extends keyof E = keyof E>(key: K) => void;
		onInputValid: <K extends keyof E = keyof E>(key: K) => void;
	}>,
) {
	const rules = useValidationRules<E, K, I>(inputs, formData);

	const v = useVuelidate<
		Record<keyof E, K>,
		Partial<Record<keyof E, ValidationArgs>>
		>(rules, formData, {
			$registerAs: registerAs
	});

	const computedIsInputInvalid = (key: keyof E, excludeDirty?: boolean): ComputedRef<boolean> => {
		return computed(() => {
			if (!v.value[key]) {
				return true;
			}
			return isInputInvalid(key, excludeDirty);
		});
	};
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

	const isInputSilentlyInvalid = (key: keyof E) => {
		return v.value[key].$silentErrors && v.value[key].$silentErrors.length > 0;
	};

	const data = isRef(formData) ? formData.value : formData;
	const keys: (keyof E)[] = Object.keys(data) as (keyof E)[];

	const inputsTouched: Ref<(keyof E)[]> = ref([]);
	if (isRef(formData)) {
		watch(formData, (newValue, oldValue) => {
			keys.forEach((itemKey) => {
				if (newValue[itemKey] !== oldValue[itemKey]) {
					if (callbacks?.onInputChange) {
						callbacks.onInputChange(itemKey, newValue[itemKey] as E[keyof E]);
					}
					inputsTouched.value.push(itemKey);
				}
			});
		}, {
				  deep: true,
			  });
	} else if (isReactive(data)) {
		keys.forEach((itemKey) => {
			const { [itemKey]: element } = toRefs(data);
			watch(element, (newValue, oldValue) => {
				if (newValue !== oldValue) {
					if (callbacks?.onInputChange) {
						callbacks.onInputChange(itemKey, newValue as E[keyof E]);
					}
					inputsTouched.value.push(itemKey);
				}
			});
		});
	}

	keys.forEach((itemKey) => {

		watch(computedIsInputInvalid(itemKey), (value) => {
			if (callbacks?.onInputValid || callbacks?.onInputInvalid) {
				if (callbacks?.onInputInvalid && value) {
					callbacks.onInputInvalid(itemKey);
				}

				if (callbacks?.onInputValid && !value) {
					callbacks.onInputValid(itemKey);
				}
			}
		});
	});

	const isInputTouched = (key: keyof E) => {
		return inputsTouched.value.indexOf(key) > -1;
	};

	return {
		v,
		isInvalid,
		isInputSilentlyInvalid,
		isInputInvalid,
		isInputTouched,
	};
}
