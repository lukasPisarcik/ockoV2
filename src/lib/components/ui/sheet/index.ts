import { Dialog as SheetPrimitive } from 'bits-ui';

import Root from './sheet.svelte';
import Content from './sheet-content.svelte';
import Header from './sheet-header.svelte';
import Title from './sheet-title.svelte';
import Description from './sheet-description.svelte';

const Trigger = SheetPrimitive.Trigger;
const Close = SheetPrimitive.Close;
const Portal = SheetPrimitive.Portal;

export {
	Root,
	Content,
	Header,
	Title,
	Description,
	Trigger,
	Close,
	Portal,
	Root as Sheet,
	Content as SheetContent,
	Header as SheetHeader,
	Title as SheetTitle,
	Description as SheetDescription,
	Trigger as SheetTrigger,
	Close as SheetClose,
	Portal as SheetPortal
};
