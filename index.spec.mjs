import 'isomorphic-fetch';
import 'regenerator-runtime/runtime';
import createTestServer from 'create-test-server';
import noutaa, {
  GET,
  POST,
  PUT,
  PATCH,
  HEAD,
  DELETE,
} from './index';

const beerList = [
  {
    name: 'La Réserve',
    brand: 'Grimbergen',
    strength: 8.5,
  },
  {
    name: 'Brooklyn Pilsner',
    brand: 'Brooklyn Brewery',
    strength: 5.1,
    type: 'pilsner',
  },
  {
    name: 'Brooklyn East India Pale Ale',
    brand: 'Brooklyn Brewery',
    strength: 6.9,
    type: 'ipa',
  },
];

const handleBeer = async (req, res) => {
  const beer = beerList[Number(req.params.id)];
  if (beer) {
    res.send(beer);
  } else {
    res.status(404).send();
  }
};

const handleBeerList = async (req, res) => {
  let order = beerList;
  if (req.body && req.body.constructor === Array) {
    order = order.filter((beer, index) => req.body.includes(index));
  } else {
    const min = req.body.min || req.query.min || 0;
    const max = req.body.max || req.query.max || 100;
    order = order.filter(({ strength }) => strength >= min);
    order = order.filter(({ strength }) => strength <= max);
  }
  res.send(order);
};

describe('noutaa', () => {
  let server;

  beforeAll(async () => {
    server = await createTestServer();
    server.all('/beer', handleBeerList);
    server.all('/beer/:id', handleBeer);
  });

  afterAll(async () => server.close());

  it('Simple fetch()', async () => {
    const response = await noutaa(`${server.url}/beer`);
    const json = await response.json();
    expect(json).toEqual(beerList);
  });

  it('With query params', async () => {
    const response = await GET(`${server.url}/beer`, {
      params: { max: 6 },
    });
    const json = await response.json();
    expect(json).toEqual([beerList[1]]);
  });

  it('With merged query params', async () => {
    const response = await GET(`${server.url}/beer?max=7`, {
      params: { min: 6 },
    });
    const json = await response.json();
    expect(json).toEqual([beerList[2]]);
  });

  it('Sending JSON Object in "json" param', async () => {
    const response = await POST(`${server.url}/beer`, {
      json: { min: 8 },
    });
    const json = await response.json();
    expect(json).toEqual([beerList[0]]);
  });

  it('Sending JSON Array in "json" param', async () => {
    const response = await PUT(`${server.url}/beer`, {
      json: [0, 2],
    });
    const json = await response.json();
    expect(json).toEqual([beerList[0], beerList[2]]);
  });

  it('Sending Object in "urlencoded" param', async () => {
    const response = await PATCH(`${server.url}/beer`, {
      urlencoded: { max: 6 },
    });
    const json = await response.json();
    expect(json).toEqual([beerList[1]]);
  });

  it('Sending URLSearchParams in "urlencoded" param', async () => {
    const urlencoded = new URLSearchParams();
    urlencoded.append('max', 6);
    const response = await POST(`${server.url}/beer`, {
      urlencoded,
    });
    const json = await response.json();
    expect(json).toEqual([beerList[1]]);
  });

  it('Throwing responses that are not OK (out of 200s range)', async () => {
    try {
      await DELETE(`${server.url}/beer/999`);
    } catch (error) {
      if (error.code) {
        expect(error.code).toEqual(404);
      }
    }
  });

  it('Parse JSON responses with "accept" param', async () => {
    const response = await GET(`${server.url}/beer/0`, {
      accept: 'json',
    });
    expect(response).toEqual(beerList[0]);
  });

  it('HEAD method', async () => {
    const response = await HEAD(`${server.url}/beer`);
    expect(response.status).toEqual(200);
  });

  it('DELETE() function', async () => {
    const response = await DELETE(`${server.url}/beer/1`);
    expect(response.status).toEqual(200);
  });
});
