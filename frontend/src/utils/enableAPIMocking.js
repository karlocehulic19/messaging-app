async function enableAPIMocking() {
  // eslint-disable-next-line no-undef
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const { worker } = await import("../mocks/browser");
  window.msw = {
    worker: worker,
    http: (await import("msw")).http,
    HttpResponse: (await import("msw")).HttpResponse,
    backendRoute: (await import("../Constants")).config.url.BACKEND_URL,
  };

  return worker.start();
}

export default enableAPIMocking;
