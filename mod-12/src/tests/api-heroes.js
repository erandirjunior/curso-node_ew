const assert = require('assert');
const api = require('./../api');
let app = {};
const MOCK_HERO_REGISTER = {
	name: 'Batman',
	power: 'Money'
};
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImVyYW5kaXJqdW5pb3IiLCJpZCI6MSwiaWF0IjoxNjY1NTEyOTQzfQ.9gin8JLA1UP_8GhjWU3Zfwq9Bw_AKjF2bM23HI5mNm4';
const headers = {
	authorization: TOKEN
};

describe.only('Api Routes', function() {
	this.beforeAll(async () => {
		app = await api;
	});

	it('List /heroes', async () => {
		const result = await app.inject({
			method: 'GET',
			url: '/heroes',
			headers 
		});

		// O retorno vem como string
		// Foi necessário converter para json
		const data = JSON.parse(result.payload);
		
		const statusCode = result.statusCode;
		
		assert.deepEqual(statusCode, 200);
		assert.ok(Array.isArray(data));
	});

	it('List /heroes -> must return 3 registers', async () => {
		const limit = 3;
		const result = await app.inject({
			method: 'GET',
			url: `/heroes?skip=0&limit=${limit}`,
			headers
		});

		// O retorno vem como string
		// Foi necessário converter para json
		const data = JSON.parse(result.payload);

		const statusCode = result.statusCode;
		
		assert.deepEqual(statusCode, 200);
		assert.ok(data.length === limit);
	});

	it('List /heroes -> must return error', async () => {
		const limit = 3
		const result = await app.inject({
			method: 'GET',
			url: `/heroes?skip=0a&limit=${limit}`,
			headers
		});
		const statusCode = result.statusCode;
		assert.deepEqual(statusCode, 400);
	});

	it('List /heroes -> must return only data with specific name', async () => {
		const name = 'Spider-Man'
		const result = await app.inject({
			method: 'GET',
			url: `/heroes?name=${name}`,
			headers
		});


		const data = JSON.parse(result.payload);
		const statusCode = result.statusCode;

		assert.deepEqual(statusCode, 200);

		assert.ok(data.length === 2);
	});

	it('Create /heroes', async () => {
		const name = 'Spider-Man'
		const result = await app.inject({
			method: 'POST',
			url: `/heroes`,
			payload: MOCK_HERO_REGISTER,
			headers
		});


		const {message, id} = JSON.parse(result.payload);
		const statusCode = result.statusCode;

		assert.deepEqual(message, 'Hero registered with success!');
		assert.notStrictEqual(id, undefined)
		assert.ok(statusCode === 200);
	});

	it('Update /heroes', async () => {
		const name = 'Batman'
		let result = await app.inject({
			method: 'POST',
			url: `/heroes`,
			payload: MOCK_HERO_REGISTER,
			headers
		});

		const {id} = JSON.parse(result.payload);

		const expected = {
			power: 'Force'
		};

		result = await app.inject({
			method: 'PATCH',
			url: `/heroes/${id}`,
			payload: expected,
			headers
		});

		const statusCode = result.statusCode;
		const data = JSON.parse(result.payload);

		assert.ok(statusCode === 200);
		assert.deepEqual(data.message, 'Hero updated!');
	});

	it('Update fail /heroes', async () => {
		const expected = {
			power: 'Force'
		};

		const id = '6340aa5e8a48ab9c9ab49caa';
		result = await app.inject({
			method: 'PATCH',
			url: `/heroes/${id}`,
			payload: expected,
			headers
		});

		const statusCode = result.statusCode;
		const data = JSON.parse(result.payload);

		assert.ok(statusCode === 200);
		assert.deepEqual(data.message, 'Update hero failed!');
	});

	it('Delete /heroes', async () => {
		let result = await app.inject({
			method: 'GET',
			url: `/heroes`,
			headers
		});

		const [{_id}] = JSON.parse(result.payload);
		result = await app.inject({
			method: 'DELETE',
			url: `/heroes/${_id}`,
			headers
		});
		const data = JSON.parse(result.payload);
		const statusCode = result.statusCode;

		assert.ok(statusCode === 200);
		assert.deepEqual(data.message, 'Hero deleted!');
	
	});

	it('Delete /heroes fail', async () => {
		let [result] = await app.inject({
			method: 'GET',
			url: `/heroes`,
			headers
		});

		result = await app.inject({
			method: 'DELETE',
			url: `/heroes/${result._id}`,
			headers
		});
		const data = JSON.parse(result.payload);
		const statusCode = result.statusCode;

		assert.ok(statusCode === 200);
		assert.deepEqual(data.message, 'Delete hero failed!');
	});

	/*it('Delete all', async () => {
		const result = await app.inject({
			method: 'DELETE',
			url: `/heroes`
		});
		const data = JSON.parse(result.payload);
		const statusCode = result.statusCode;

		assert.ok(statusCode === 200);
		assert.deepEqual(data.message, 'Heroes deleted!');
	});*/
});