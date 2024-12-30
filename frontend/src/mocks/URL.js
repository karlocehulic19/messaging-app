global.URL.createObjectURL = vi.fn(() => "mockedFilePath");
global.URL.revokeObjectURL = vi.fn(() => null);
