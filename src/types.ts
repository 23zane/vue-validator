export type GenericInput = {
	mandatory: boolean;
	name: string;
	exclude_dirty?: boolean; //Per evitare il controllo dirty
	rules: string[];
};

export type InputType<E, I extends GenericInput = GenericInput> = {
	[key in keyof E]: I;
};
