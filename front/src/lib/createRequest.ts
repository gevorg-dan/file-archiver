import axios, { AxiosResponse } from "axios";

export enum METHODS {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
}

interface OptionsInterface {
  body?: Record<string, any>;
  urlParams?: Record<string, string>;
  headers?: Record<string, any>
}

function getResponse(url: string, method: METHODS, body?: Record<string, any>, headers?: Record<string, any>) {
  if (method === METHODS.POST || method === METHODS.PUT) {
    return axios({
      method,
      url,
      responseType: "json",
      headers,
      data: body,
    });
  }

  return axios({ method, url, responseType: "json" });
}

async function makeRequest(
  url: string,
  method: METHODS,
  options?: OptionsInterface
) {
  let realUrl = url;

  if (options?.urlParams) {
    for (let [key, value] of Object.entries(options.urlParams)) {
      realUrl = realUrl.replace(`{${key}}`, value);
    }
  }

  const response = await getResponse(realUrl, method, options?.body, options?.headers);

  if (response.status >= 200 && response.status <= 300) {
    return response.data;
  } else {
    console.log(new Error("Ошибка HTTP: " + response.status));
    return;
  }
}

export class RequestManager {
  createRequest(url: string, method: METHODS) {
    return (options?: OptionsInterface) => makeRequest(url, method, options);
  }
}
