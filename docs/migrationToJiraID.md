Algorithm for migrating to the new event schema, introducing Jira_id:
1. Add the second version of the task.created event with jira_id to the schema registry.
1. Release the registry.
1. Add the optional field jira_id to the task data model in the accounting service.
1. Add logic to handle task.created.v2 in accounting.
1. Release accounting service.
1. Send a test event with v2 to ensure everything is okay.
1. Update the registry in the tasks service.
1. Add the jira_id field to the task data model in the tasks service.
1. Add logic for validation of description and saving in jira_id to the database.
1. Add logic for writing different events depending on the environment variable.
1. Release tasks service.
1. Switch environment variable to produce task.created.v2 in tasks service.
1. Remove the tasks.created.v1 producer code.
1. Release tasks service.
1. Ensure there are no tasc.created.v1 events left in the message broker.
1. Remove the tasks.created.v1 consumer in accounting.
1. Release accounting service.
1. Add task.update event producer in tasks service and consumer in accounting service.
1. Fill in jira_id in all the tasks without it and send a batch of taks.updated events.
