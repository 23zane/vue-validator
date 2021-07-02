import { useVuelidate } from '@vuelidate/core';
import { computed, isReactive, isRef, ref, toRefs, watch } from 'vue-demi';
import useValidationRules from './validationRules';
import { install } from 'vue-demi';
install();
export default function useValidation(inputs, formData, checkDirty, registerAs, callbacks) {
    const rules = useValidationRules(inputs, formData);
    // @ts-ignore
    const v = useVuelidate(rules, formData, registerAs);
    const computedIsInputInvalid = (key, excludeDirty) => {
        return computed(() => {
            if (!v.value[key]) {
                return true;
            }
            return isInputInvalid(key, excludeDirty);
        });
    };
    const isInvalid = computed(() => {
        // tslint:disable-next-line:no-shadowed-variable
        const keys = Object.keys(v.value).filter((key) => {
            return key.substr(0, 1) !== '$' && key.substr(0, 1) !== '_';
        });
        return keys.some((key) => {
            const validationObject = v.value[key];
            const inputValues = isRef(inputs) ? inputs.value : inputs;
            const input = typeof inputValues !== 'undefined' ? inputValues[key] : undefined;
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
    const isInputInvalid = (key, excludeDirty) => {
        let dirtyCheck = checkDirty;
        const inputValues = isRef(inputs) ? inputs.value : inputs;
        const input = typeof inputValues !== 'undefined' ? inputValues[key] : undefined;
        if (dirtyCheck && (excludeDirty || (input && input.exclude_dirty))) {
            dirtyCheck = false;
        }
        if (dirtyCheck === true && !v.value[key].$dirty && !v.value[key].$anyDirty) {
            return true;
        }
        return v.value[key].$error;
    };
    const data = isRef(formData) ? formData.value : formData;
    const keys = Object.keys(data);
    const inputsTouched = ref([]);
    if (isReactive(data)) {
        keys.forEach((itemKey) => {
            const { [itemKey]: element } = toRefs(data);
            watch(element, (newValue, oldValue) => {
                if (newValue !== oldValue) {
                    if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.onInputChange) {
                        callbacks.onInputChange(itemKey, newValue);
                    }
                    inputsTouched.value.push(itemKey);
                }
            });
        });
    }
    else if (isRef(formData)) {
        watch(formData, (newValue, oldValue) => {
            keys.forEach((itemKey) => {
                if (newValue[itemKey] !== oldValue[itemKey]) {
                    if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.onInputChange) {
                        callbacks.onInputChange(itemKey, newValue[itemKey]);
                    }
                    inputsTouched.value.push(itemKey);
                }
            });
        }, {
            deep: true
        });
    }
    keys.forEach((itemKey) => {
        watch(computedIsInputInvalid(itemKey), (value) => {
            if ((callbacks === null || callbacks === void 0 ? void 0 : callbacks.onInputValid) || (callbacks === null || callbacks === void 0 ? void 0 : callbacks.onInputInvalid)) {
                if ((callbacks === null || callbacks === void 0 ? void 0 : callbacks.onInputInvalid) && value) {
                    callbacks.onInputInvalid(itemKey);
                }
                if ((callbacks === null || callbacks === void 0 ? void 0 : callbacks.onInputValid) && !value) {
                    callbacks.onInputValid(itemKey);
                }
            }
        });
    });
    const isInputTouched = (key) => {
        return inputsTouched.value.indexOf(key) > -1;
    };
    return {
        v,
        isInvalid,
        isInputInvalid,
        isInputTouched,
    };
}
