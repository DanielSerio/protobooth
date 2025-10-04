# UX Process

## Intentions

Our intention is to provide a valuable user experience to two target roles/audiences:

1. The Client
2. The Engineers (Developers)

Our primary focus is the client. This process should be dead-simple for the client.

Our secondary focus is the Engineers. After all UX considerations are made for the client, we should aim to make this process as simple as possible for our human Engineers.

## The General Overview:

1. Prototyping phase is ready to begin.
2. A Staging server is setup in a secure way between the Engineers and the Client.
3. Prototype shell is generated/Initial app prototype development is completed.
4. Protobooth is installed
5. Protobooth lifecycle begins:

5a. `Development In Progress`
5b. `Reviews Requested`
5c. A deployment to staging occurs (manual or automatic). this should include the `.protobooth` assets
5d. `Review` - Client "Marks Up" the screenshots via the annotate UI
5e. Client publishes annotations via publish button
5f. It is somehow communicated to the engineers that annotations are ready for resolution
5g. `Resolution` - The Engineers download the `.protobooth` assets from the staging server annotate UI
5h. The Engineers upload the `.protobooth` assets from the previous step via tha resolve UI (development)
5i. The process repeats (goes back to 5a) until the client has communicated that the prototype is complete

6. Protobooth is cleanup command is run
7. Protobooth is uninstalled
