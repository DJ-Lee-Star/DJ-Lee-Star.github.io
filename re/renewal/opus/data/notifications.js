const res = await fetch('../data/notifications.json');
export const notifications = await res.json();
