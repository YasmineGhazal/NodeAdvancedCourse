const puppeteer = require('puppeteer')
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox'],
        })
        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function (target, prop) {
                return customPage[prop] || browser[prop] || page[prop];
            }
        });
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const { session, sig } = sessionFactory(user);

        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContent(selector) {
        return await this.page.$eval(selector, el => el.innerHTML)
    }

    async getElement(selector) {
        return await this.page.$$(selector)
    }

    async click(selector) {
        return await this.page.click(selector);
    }

    async typeInElement(selector, text) {
        await this.page.focus(selector)
        await this.page.keyboard.type(text)
    }

    async get(path) {
        return await this.page.evaluate((_path) => {
            return fetch(_path, {
                method: 'GET',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
            }).then(res => res.json())
        }, path);
    }

    async post(path, bodyDate) {
        return await this.page.evaluate((_path, _bodyDate) => {
            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(_bodyDate)
            }).then(res => res.json())
        }, path, bodyDate);
    }

    async execRequests(actions) {
        return await Promise.all(actions.map(({ method, path, data }) => this[method](path, data)));
    }
}

module.exports = CustomPage;
