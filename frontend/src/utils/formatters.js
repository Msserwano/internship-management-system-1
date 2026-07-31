import { format, formatDistanceToNow, parseISO } from "date-fns";

export const fDate = (d) => { if (!d) return "—"; try { return format(parseISO(d), "dd MMM yyyy"); } catch { try { return format(new Date(d), "dd MMM yyyy"); } catch { return String(d); } } };
export const fDateTime = (d) => { if (!d) return "—"; try { return format(parseISO(d), "dd MMM yyyy, HH:mm"); } catch { try { return format(new Date(d), "dd MMM yyyy, HH:mm"); } catch { return String(d); } } };
export const fRelative = (d) => { if (!d) return "—"; try { return formatDistanceToNow(parseISO(d), { addSuffix: true }); } catch { try { return formatDistanceToNow(new Date(d), { addSuffix: true }); } catch { return String(d); } } };
export const fDeadline = (d) => { if (!d) return "—"; try { const diff = (new Date(d) - new Date()) / 864e5; return diff < 0 ? "Expired" : diff < 7 ? `${Math.ceil(diff)} days left` : fDate(d); } catch { return String(d); } };
export const initials = (name) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) || "??";
export const fNumber = (n) => new Intl.NumberFormat().format(n);
