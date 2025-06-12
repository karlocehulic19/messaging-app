async function enableAPIMocking() {
  if (import.meta.env.VITE_MOCK_BACKEND_API !== "true") {
    return;
  }

  const { worker } = await import("../mocks/browser");
  window.msw = {
    worker: worker,
    http: (await import("msw")).http,
    HttpResponse: (await import("msw")).HttpResponse,
    backendRoute: (await import("../Constants")).config.url.BACKEND_URL,
    delay: (await import("msw")).delay,
  };

  return worker.start();
}

export default enableAPIMocking;
