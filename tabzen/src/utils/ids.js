import { nanoid } from 'nanoid';

export const spaceId = () => `space_${nanoid(8)}`;
export const sessId = () => `sess_${nanoid(8)}`;
export const groupId = () => `group_${nanoid(8)}`;
export const tabId = () => `tab_${nanoid(8)}`;
