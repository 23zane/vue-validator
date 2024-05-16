export type ValidationFunction = (value: never) => boolean;

export type GenericInput<RecordKey extends string = string> = {
	mandatory: boolean;
	name: RecordKey;
	exclude_dirty?: boolean; // Per evitare il controllo dirty
	rules: (string | { key: string; func: ValidationFunction })[];
};

export type InputType<E, I extends GenericInput = GenericInput> = Record<keyof E, I>;

export type RuleNames =
	| 'required'
	| 'email'
	| 'password'
	| 'telephone'
	| 'accepted'
	| 'char'
	| 'uppercase'
	| 'lowercase'
	| 'number'
	| 'full_number'
	| 'currency'
	| 'maxLength'
	| 'minLength'
	| 'iban'
	| 'iban_es'
	| 'stamp_number'
	| 'tax_code'
	| 'vat_code'
	| 'company_tax_code'
	| 'month_year'
	| 'datetime'
	| 'date'
	| string;
