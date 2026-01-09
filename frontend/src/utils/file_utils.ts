
export const decodeContent = (b64: string) => {
    try {
        return atob(b64);
    } catch (e) {
        return "";
    }
};

export const encodeContent = (str: string) => {
    return btoa(str);
};

export const isTextFile = (name: string) => {
    return name.endsWith('.json') || name.endsWith('.xml') || name.endsWith('.txt') || name.endsWith('.atlas');
};

export const isImageFile = (name: string) => {
    return name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg');
};

export const getFileNameFromPath = (path: string) => {
    return path.split(/[\\/]/).pop() || path;
};