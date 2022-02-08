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


test('When logged in create blog button should be displayed', async () => {
    await page.login();
    const addBlogBtn = await page.getElement('.btn-floating');

    expect(addBlogBtn).not.toEqual(undefined);
});

describe('When logged in', () => {
    beforeEach(async () => {
        await page.login();
        await page.click('.btn-floating');
    });

    test('Clicking on the "Add Blog Button" should display the "Add Blog Form"', async () => {
        const addBlogForm = await page.getElement('form');

        expect(addBlogForm).not.toEqual(undefined);
    });

    describe('And using valid input', async () => {
        beforeEach(async () => {
            await page.typeInElement('input[name=title]', 'Test Title');
            await page.typeInElement('input[name=content]', 'Test Content');
            await page.click('button[type=submit]');
        });

        test('Submitting takes user to review screen', async () => {
            const conformationMsg = await page.getContent('form h5');
            expect(conformationMsg).toEqual('Please confirm your entries');
        });

        test('Submitting and saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');
            const lastCardTitle = await page.getContent('.card-title');
            const lastCardContent = await page.getContent('p');
            expect(lastCardTitle).toEqual('Test Title');
            expect(lastCardContent).toEqual('Test Content');
        });
    });

    describe('And using invalid input', async () => {
        beforeEach(async () => {
            await page.click('button[type=submit]');
        });

        test('The form should display error for invalid title', async () => {
            const invalidTitleError = await page.getContent('.title .red-text');
            expect(invalidTitleError).toEqual('You must provide a value');
        });

        test('The form should display error for invalid content', async () => {
            const invalidContentError = await page.getContent('.content .red-text');
            expect(invalidContentError).toEqual('You must provide a value');

        });
    });
});

describe('When not logged in', () => {
    const actions = [
        {
            method: 'get',
            path: '/api/blogs',
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: { title: 'new test title', content: 'test content' },
        }
    ]

    test('shouldn\'t be able to do blog related actions', async () => {
        const res = await page.execRequests(actions);
        expect(res.length).toEqual(actions.length);
        res.forEach(r => expect(r).toEqual({ error: 'You must log in!' }));
    });
});
