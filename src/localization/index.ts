import { format } from '@/utilities';
import languages from '@/localization/languages';
import type { Directive } from 'vue';
import * as _ from 'lodash-es';

let loaded: null | {
	code: any | string,
	[k: string]: {
		str: any | string,
		[k: string]: {
			[k: string]: string,
		},
	},
} = null;

const logstr = "[localization]";
const localeKeyTag = "data-locale-key";
const localeArgsTag = "data-locale-args";
const localeModsTag = "data-locale-mods";
export const defaultLangFile = "en-us";

export async function loadLangFile(lang: string) {
	if (!languages.hasOwnProperty(lang)) {
		console.error(logstr, "cannot load unregistered language file:", lang);
		lang = defaultLangFile;
	}

	// attempt to load the lang file and store it into loaded
	const i = await import(`./${lang}.lang.ts`);
	loaded = Object.assign(loaded ?? {}, i.default);
	if (!loaded) return;

	loaded.code = lang;
	console.debug(logstr, "loaded:", lang);
	document.querySelectorAll(
		"[" + localeKeyTag + "]",
	).forEach(e => {
		const key = e.getAttribute(localeKeyTag);
		if (!key) return;

		const binding: Binding = { arg: key, modifiers: {} };

		const args = e.getAttribute(localeArgsTag);
		if (args) binding.value = JSON.parse(args);

		const mods = e.getAttribute(localeModsTag);
		if (mods) mods.split(".").forEach(mod => binding.modifiers[mod] = true);

		translateElement(key, e, binding);
	});
}

export default function translate(key: string, kwargs: { [k: string]: string; } = {}): string {
	if (!loaded) {
		console.warn(logstr, "failed for", key, "locale has not been loaded yet");
		return key;
	}
	if (!loaded.hasOwnProperty(key)) {
		console.warn(logstr, loaded.code, "translation does not exist for:", key);
		return key;
	}
	const fmt = loaded[key];
	const args: { [k: string]: string; } = {};
	Object.entries(kwargs).forEach(([k, v]) => args[k] = fmt?.[k]?.[v] ?? v);
	return format(fmt.str, args);
}

const translateElement = (key: string, el: Element, binding: Binding) => {
	let trans = translate(key, binding.value);
	if (!trans) {
		if (el.textContent) return;
		else trans = key;
	}

	const html = binding.modifiers?.html;
	delete binding.modifiers.html;

	const prevent = binding.modifiers?.prevent;
	delete binding.modifiers.prevent;

	if (html) el.innerHTML = trans;
	else if (!prevent) el.textContent = trans;

	Object.keys(binding.modifiers).forEach(k => el.setAttribute(k, trans));
};

const directiveSet = (el: Element, binding: Binding) => {
	const key: string = binding.arg ?? binding.value;
	if (key === binding.value) binding.value = undefined;
	// we don't want to re-run the directive during update if nothing has changed in the translation
	if (key === el.getAttribute(localeKeyTag) && (!binding.value || _.isEqual(binding.value, binding.oldValue))) return;
	// console.debug(logstr, "el:", el, "key:", key, "value:", binding.value);

	(async () => {
		// I don't know if this actually unblocks the rest of the code to run independently, but that's what I intended
		el.setAttribute(localeKeyTag, key);
		if (binding.value) el.setAttribute(localeArgsTag, JSON.stringify(binding.value));
		if (Object.keys(binding.modifiers).length) el.setAttribute(localeModsTag, Object.keys(binding.modifiers).join("."));
	})();

	translateElement(key, el, binding);
};

interface Binding {
	/**
	 * The value passed to the directive. For example in v-my-directive="1 + 1", the value would be `2`.
	 */
	value?: any,

	/**
	 * The previous value, only available in `beforeUpdate` and `updated`. It is available whether or not the value has changed.
	 */
	oldValue?: any,

	/**
	 * The argument passed to the directive, if any. For example in `v-my-directive:foo`, the arg would be `"foo"`.
	 */
	arg?: string,

	/**
	 * An object containing modifiers, if any. For example in `v-my-directive.foo.bar`, the modifiers object would be `{ foo: true, bar: true }`.
	 */
	modifiers: {
		[k: string]: boolean,
	},

	/**
	 * The instance of the component where the directive is used.
	 */
	instance?: any,  // TODO: idk the type on this

	/**
	 * the directive definition object.
	 */
	dir?: any,  // TODO: idk the type on this
}

export const vTranslate: Directive = {
	// https://vuejs.org/guide/reusability/custom-directives.html#directive-hooks

	// called before bound element's attributes
	// or event listeners are applied
	// created(el: HTMLElement, binding: Binding, /* vnode */) { },

	// called right before the element is inserted into the DOM.
	// beforeMount(el: HTMLElement, binding: Binding, /* vnode */) { },
	beforeMount: directiveSet,

	// called when the bound element's parent component
	// and all its children are mounted.
	// mounted(el: HTMLElement, binding: Binding, /* vnode */) { },

	// called before the parent component is updated
	// beforeUpdate(el: HTMLElement, binding: Binding, /* vnode, prevVnode */) { },
	beforeUpdate: directiveSet,

	// called after the parent component and
	// all of its children have updated
	// updated(el: HTMLElement, binding: Binding, /* vnode, prevVnode */) { },

	// // called before the parent component is unmounted
	// beforeUnmount(el: HTMLElement, binding: Binding, /* vnode */) { },

	// // called when the parent component is unmounted
	// unmounted(el: HTMLElement, binding: Binding, /* vnode */) { },
};
