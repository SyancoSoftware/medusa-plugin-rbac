export const validateName = (value: string) => {
    if (value && value.length > 0) {
        return true;
    }
    return false;
};