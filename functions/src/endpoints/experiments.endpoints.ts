/** Endpoints for interactions with experiments */

import { onRequest } from 'firebase-functions/v2/https';
import { app } from '../app';
import { ParticipantSeeder } from '../seeders/participants.seeder';
import { replaceChatStagesUuid } from '../utils/replace-chat-uuid';

/** Fetch all experiments in database (not paginated) */
export const experiments = onRequest(async (request, response) => {
  const experiments = await app.firestore().collection('experiments').get();
  const data = experiments.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
  response.send({ data });
});

/** Fetch a specific experiment's extended data (ie: the experiment and all of its associated users) */
export const experiment = onRequest(async (request, response) => {
  const experimentUid = request.params[0];

  if (!experimentUid) {
    response.status(400).send('Missing experiment UID');
    return;
  }

  const experiment = await app.firestore().collection('experiments').doc(experimentUid).get();

  if (!experiment.exists) {
    response.status(404).send('Experiment not found');
    return;
  }

  const experimentData = experiment.data();

  if (!experimentData) {
    response.status(500).send('Experiment data is missing');
    return;
  }

  const participants = await app
    .firestore()
    .collection('participants')
    .where('experimentId', '==', experimentUid)
    .get();

  const data = {
    ...experimentData,
    uid: experiment.id,
    participants: participants.docs.map((doc) => ({ uid: doc.id, ...doc.data() })),
  };

  response.send(data);
});

export const deleteExperiment = onRequest(async (request, response) => {
  const experimentId = request.params[0];

  if (!experimentId) {
    response.status(400).send('Missing experiment UID');
    return;
  }

  const experiment = await app.firestore().collection('experiments').doc(experimentId).get();

  if (!experiment.exists) {
    response.status(404).send('Experiment not found');
    return;
  }

  // Delete all participants associated with the experiment
  const participants = await app
    .firestore()
    .collection('participants')
    .where('experimentId', '==', experimentId)
    .get();

  const batch = app.firestore().batch();
  batch.delete(experiment.ref);
  participants.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  response.send({ data: `Experiment of ID ${experimentId} was successfully deleted` });
});

export const createExperiment = onRequest(async (request, response) => {
  let uid = '';
  try {
    // Extract data from the body
    const { name, stageMap, numberOfParticipants, allowedStageProgressionMap } = request.body;
    const date = new Date();

    replaceChatStagesUuid(stageMap); // Assign a new UUID to each chat stage

    await app.firestore().runTransaction(async (transaction) => {
      // Create the main parent experiment
      const experiment = app.firestore().collection('experiments').doc();
      transaction.set(experiment, {
        name,
        date,
        numberOfParticipants,
      });
      uid = experiment.id;

      // Create all derived participants with their stages
      const participants = ParticipantSeeder.createMany(
        experiment.id,
        stageMap,
        allowedStageProgressionMap,
        numberOfParticipants,
      );

      participants.forEach((participant) => {
        const participantRef = app.firestore().collection('participants').doc();
        transaction.set(participantRef, participant);
      });
    });
  } catch (e) {
    response.status(500).send(`Error creating experiment: ${e}`);
  }

  response.send({ data: 'Experiment created successfully', uid });
});