export function capitalizeString(text: string) {
    const lowerCaseText: string = text.toLowerCase();
    const capitalizedString: string = lowerCaseText.charAt(0).toLocaleUpperCase() + lowerCaseText.slice(1);
    return capitalizedString;
}

/**
 * Apply the value across an entire set into a map using the set elements as keys
 * @param {Map<any, Set<any>} mapObject 
 * @param {Set<any>} setObject 
 * @param {any} value 
 */
export const applySetToMap = (mapObject: Map<any, Set<any>>, setObject: Set<any>, value: any) => {
    for (const element of setObject) {
        const mapKey = JSON.stringify(element);
        let keySet;
        if (mapObject.has(mapKey)) {
            keySet = mapObject.get(mapKey) as Set<any>;
            keySet.add(value);
            mapObject.set(mapKey, keySet);
        } else {
            keySet = new Set([value]);
            mapObject.set(mapKey, keySet);
        }
    }
}

/**
 * Merge the contents inside the source into the target map, overwrites the target if value is not an iterable like
 * @param {Map<string, Set<any> | any>} source 
 * @param {Map<string, Set<any> | any>} target 
 */
export function mergeMaps<T extends Object> (
    source: Map<string, Set<T> | T>, 
    target: Map<string, Set<T> | T>
): void {
    for (const [key, value] of source.entries()) {
        let currentValue = undefined;
        currentValue = target.get(key);
        if (currentValue instanceof Set) {
            const setValue = value as Set<T>
            target.set(key, new Set([...currentValue, ...setValue]));
        } else {
            target.set(key, value as T);
        }
    }
}