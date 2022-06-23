/* eslint-disable */
import { CleansingService } from "../../../services/cleansing-service";
import { IAuditEvent } from '../../../models/audit-event';
import { ICleansedEvent } from "../../../models/cleansed-event";


describe('Unit test for cleansing-service', function () {
  let consoleMock: jest.SpyInstance;


  it('strips out client_id when present', async () => {

    const inputMessage: IAuditEvent = {
      timestamp: 1609462861,
      event_name: 'AUTHENTICATION_ATTEMPT',
      event_id: '123456789',
      component_id: '1234',
      client_id: 'An Example Client'
    };

    const expectedMessage: ICleansedEvent = {
      timestamp: 1609462861,
      event_name: 'AUTHENTICATION_ATTEMPT',
      event_id: '123456789',
    };

    expect(CleansingService.cleanseEvent(inputMessage)).toEqual(expectedMessage)

  });
});