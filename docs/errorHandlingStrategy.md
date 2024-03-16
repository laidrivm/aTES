The desired strategy to handle errors regarding accounting.

### If broker is down

- [ ]  Store the undelivered events locally.
- [ ]  Progressively try to resend these events to the message broker.
- [ ]  Adapt consumers to read data in random order.
  - [ ]  In case task.closed, task.assigned or task.updated arrived earlier, that task.created.
  - [ ]  In case day.ended arrived earlier that user.created and there are some tasks assigned on that user.


### If accounting received an invalid event

- [ ]  Begin to validate schema and event version in consumers.
- [ ]  Store events in local database, if they do not pass the validation.
- [ ]  Send an alert to admin's email or messanger when we save error causing event to the database.


### If an error in business logic occured

- [ ]  If a valid event triggers error handling, send an according message to accounting.errors topic in the message broker. So that this message producer would be able to patch the data.
