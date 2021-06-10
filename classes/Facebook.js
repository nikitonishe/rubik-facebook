const { Kubik } = require('rubik-main');
const fetch = require('node-fetch');
const set = require('lodash/set');
const isObject = require('lodash/isObject');
const querystring = require('querystring');

const methods = require('./Facebook/methods');

const FacebookError = require('../errors/FacebookError');

const DEFAULT_HOST = 'https://graph.facebook.com/';
const DEFAULT_VERSION = 'v8.0';

/**
 * Кубик для запросов к API Facebook
 * @class
 * @prop {String} [token] токен для доступа к API
 * @prop {String} [host=DEFAULT_HOST] адрес API Facebook
 */
class Facebook extends Kubik {
  constructor(token, host, version) {
    super(...arguments);
    this.token = token || null;
    this.host = host || null;
    this.version = version || null;

    this.methods.forEach(this.generateMethod, this);
  }

  /**
   * Поднять кубик
   * @param  {Object} dependencies зависимости
   */
  up({ config }) {
    this.config = config;

    const options = this.config.get(this.name);

    this.token = this.token || options.token || null;
    this.host = this.host || options.host || DEFAULT_HOST;
    this.version = this.version || options.version || DEFAULT_VERSION;
  }

  getUrl({ path, params, token, host, fbApiVersion }) {
    if (!host) host = this.host;
    if (!token) token = this.token;
    if (!fbApiVersion) fbApiVersion = this.version;

    if (!host) throw new TypeError('host is not defined');
    if (!token) throw new TypeError('token is not defined');
    if (!fbApiVersion) throw new TypeError('fbApiVersion is not defined');

    if (!params) params = {};
    params.access_token = token;

    return `${host}${fbApiVersion}/${path}?${querystring.stringify(params)}`;
  }

  /**
   * Сделать запрос к API Viber
   * @param  {String} name  имя метода
   * @param  {Object|String} body тело запроса
   * @param  {String} [token=this.token] токен для запроса
   * @param  {String} [host=this.host] хост API Viber
   * @return {Promise<Object>} ответ от Viber API
   */
  async request({ path, body, params, token, host, method }) {
    if (isObject(body)) {
      body = JSON.stringify(body);
    }

    const url = this.getUrl({ path, params, token, host });
    if (!method) method = 'GET';
    const headers = {};

    if (body) {
      method = 'POST';
      headers['Content-Length'] = Buffer.byteLength(body);
      headers['Content-Type'] = 'application/json'
    }

    const request = await fetch(url, { method, body, headers });
    const result = await request.json();

    if (result.error) throw new FacebookError(result.error.message);
    return result;
  }

  /**
   * Сгенерировать метод API
   *
   * Создает функцию для запроса к API, привязывает ее к текущему контексту
   * и кладет в семантичное имя внутри this.
   * В итоге он разбирет путь на части, и раскладывает его по семантичным объектам:
   * one/two/three -> this.one.two.three(currency, body, id);
   * @param  {String}  path путь запроса, без ведущего /: one/two/three
   */
  generateMethod({ kubikName, apiName }) {
    const method = (options) => {
      if (!options) options = {};
      const { body, params, token, host, method } = options;
      return this.request({ path: apiName, body, params, token, host, method });
    };
    set(this, kubikName, method);
  }
}

// Чтобы не создавать при каждой инициализации класса,
// пишем значения имени и зависимостей в протип
Facebook.prototype.dependencies = Object.freeze(['config']);
Facebook.prototype.methods = Object.freeze(methods);
Facebook.prototype.name = 'facebook';

module.exports = Facebook;
