export const getSortComparator = (key, direction) => {
    return (a, b) => {
        const aVal = a[key] || "";
        const bVal = b[key] || "";

        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
        return 0;
    };
};