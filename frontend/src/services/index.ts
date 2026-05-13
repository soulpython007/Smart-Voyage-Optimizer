const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false' && import.meta.env.VITE_DEMO_MODE !== '0';

export { DEMO_MODE };

export async function getApi() {
  if (DEMO_MODE) {
    const { demoApi } = await import('./demoApi');
    return demoApi;
  }
  const { api } = await import('./api');
  return api;
}
