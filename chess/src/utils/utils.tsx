export function capitalizeString(text: string) {
    const lowerCaseText: string = text.toLowerCase();
    const capitalizedString: string = lowerCaseText.charAt(0).toLocaleUpperCase() + lowerCaseText.slice(1);
    return capitalizedString;
}