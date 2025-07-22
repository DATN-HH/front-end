import { type ClassValue, clsx } from 'clsx';
import dayjs from 'dayjs';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | undefined) {
    if (!date) return '-';
    return dayjs(date).format('DD/MM/YYYY HH:mm:ss');
}
