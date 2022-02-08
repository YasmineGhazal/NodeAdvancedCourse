const Page = require('./helpers/page');
Number.prototype._called = {};
let page;

beforeEach(async () => {
    page = await Page.build()
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

test('Title should be Blogster', async () => {
    const title = await page.getContent('a.brand-logo');
    expect(title).toEqual('Blogster');
});

test('Clicking login start oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toContain('accounts.google.com');
})


test('When signed in, show logout button', async () => {
    await page.login();
    const logoutBtnText = await page.getContent('a[href="/auth/logout"]');
    expect(logoutBtnText).toEqual('Logout');
});
