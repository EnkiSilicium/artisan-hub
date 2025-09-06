import axios from 'axios';
import { ApiPaths } from 'contracts';

describe(`GET /${ApiPaths.Root}`, () => {
  it('should return a message', async () => {
    const res = await axios.get(`/${ApiPaths.Root}`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});
