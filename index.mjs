class HTTPError extends Error {
  constructor(response) {
    super(response.statusText);
    this.name = 'HTTPStatus';
    this.response = response;
    this.code = response.status;
  }
}

async function noutaa(url, options) {
  let urlWithParams;
  let body = options && options.body;
  const headers = {};
  const accept = options && options.accept;

  if (
    options
    && options.constructor === Object
    && Object.keys(options).length
  ) {
    const { json, urlencoded, params } = options;

    // update body with "json", attach headers
    if (json) {
      if (json.constructor === Object || Array.isArray(json)) {
        body = JSON.stringify(json);
        headers['Content-Type'] = 'application/json; charset=utf-8';
      }
    }

    // update body with "urlencoded" as URLSearchParams
    if (urlencoded) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      if (urlencoded.constructor === Object) {
        body = new URLSearchParams();
        Object.entries(urlencoded).forEach(([key, value]) => {
          body.append(key, value);
        });
      } else { // else if constructor === URLSearchParams
        body = urlencoded;
      }
    }

    // update body with "form" as URLSearchParams
    // headers['Content-Type'] = 'multipart/form-data';
    // body = new FormData();

    // attach url query string a.k.a. "params"
    if (params) {
      const [urlWithoutParams, paramsOriginal] = url.split('?');
      const urlParams = new URLSearchParams(paramsOriginal);
      Object.entries(params).forEach(([key, value]) => {
        urlParams.append(key, value);
      });
      urlWithParams = (paramsOriginal)
        ? `${urlWithoutParams}?${urlParams}`
        : `${url}?${urlParams}`;
    }
  }

  // merge old options with new config
  const config = {
    ...options,
    headers: { // input headers overwrite generated headers
      ...headers,
      ...(options && options.headers),
    },
    body, // generated body overwrites input
  };

  const res = await fetch(urlWithParams || url, config);
  if (res.ok) {
    switch (accept) {
      case 'json':
      case 'application/json':
      case 'application/json; charset=utf-8':
        return res.json();
      default: return res;
    }
  }
  throw new HTTPError(res);
}

export default noutaa;
export const GET = async (url, options = {}) => noutaa(url, options);
export const POST = async (url, options = {}) => noutaa(url, { ...options, method: 'POST' });
export const PUT = async (url, options = {}) => noutaa(url, { ...options, method: 'PUT' });
export const PATCH = async (url, options = {}) => noutaa(url, { ...options, method: 'PATCH' });
export const HEAD = async (url, options = {}) => noutaa(url, { ...options, method: 'HEAD' });
export const DELETE = async (url, options = {}) => noutaa(url, { ...options, method: 'DELETE' });
