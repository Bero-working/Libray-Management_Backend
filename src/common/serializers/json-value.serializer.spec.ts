import { serializeJsonValue } from './json-value.serializer';

describe('serializeJsonValue', () => {
  it('serializes bigint values into strings', () => {
    expect(
      serializeJsonValue({
        id: BigInt(1),
        nested: { staffId: BigInt(2) },
        items: [BigInt(3)],
      }),
    ).toEqual({
      id: '1',
      nested: { staffId: '2' },
      items: ['3'],
    });
  });
});
