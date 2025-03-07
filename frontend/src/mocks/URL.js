export const objectURL = "mockedFilePath";
export const createObjectURlSpy = vi.fn(() => objectURL);

global.URL.createObjectURL = createObjectURlSpy;
global.URL.revokeObjectURL = vi.fn(() => null);
