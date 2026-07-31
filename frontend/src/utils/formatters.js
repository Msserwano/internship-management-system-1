
import { format, formatDistanceToNow, parseISO } from "date-fns";

export const fDate = (d) => { try { return format(parseISO(d), "dd MMM yyyy"); } catch { return d; } };
export const fDateTime = (d) => { try { return format(parseISO(d), "dd MMM yyyy, HH:mm"); } catch { return d; } };
export const fRelative = (d) => { try { return formatDistanceToNow(parseISO(d), { addSuffix: true }); } catch { return d; } };
export const fDeadline = (d) => { try { const diff = (new Date(d) - new Date()) / 864e5; return diff < 0 ? "Expired" : diff < 7 ? `${Math.ceil(diff)} days left` : fDate(d); } catch { return d; } };
export const initials = (name) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) || "??";
export const fNumber = (n) => new Intl.NumberFormat().format(n);
