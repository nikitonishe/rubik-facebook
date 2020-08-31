/* global describe test expect */
const path = require('path');
const { Kubiks: { Config } } = require('rubik-main');

const { createApp, createKubik } = require('rubik-main/tests/helpers/creators');

const Facebook = require('../classes/Facebook.js');

const CONFIG_VOLUMES = [
  path.join(__dirname, '../default/'),
  path.join(__dirname, '../config/')
];

const get = () => {
  const app = createApp();
  app.add(new Config(CONFIG_VOLUMES));

  const kubik = createKubik(Facebook, app);

  return { app, kubik };
}

describe('Кубик для работы с Facebook', () => {
  test('Создается без проблем и добавляется в App', () => {
    const { app, kubik } = get();
    expect(app.facebook).toBe(kubik);
    expect(app.get('facebook')).toBe(kubik);
  });

  test('Делает тестовый запрос к facebook (не забудьте добавить токен в настройки)', async () => {
    const { app, kubik } = get();
    await app.up();
    const response = await kubik.debugToken({ params: { input_token: app.config.get('facebook').token }});
    expect(response.data).toBeTruthy();
    await app.down();
  });

  test('Делает тестовый запрос к facebook (не забудьте добавить токен в настройки)', async () => {
    const { app, kubik } = get();
    await app.up();
    const response = await kubik.me.subscribedApps();
    expect(response.data).toBeTruthy();
    await app.down();
  });

  test('Тестовый запрос к facebook с невалидным токеном завершается ошибкой', async () => {
    const { app, kubik } = get();
    await app.up();
    expect(kubik.me.subscribedApps({ token: '12345' })).rejects.toThrow();
    await app.down();
  });
});
