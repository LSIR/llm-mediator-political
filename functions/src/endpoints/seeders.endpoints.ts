/**
 * Endpoints for seeding the database with dummy data.
 */

import { onRequest } from 'firebase-functions/v2/https';
import { v4 as uuidv4 } from 'uuid';
import { app } from '../app';
import { ExperimentSeeder } from '../seeders/experiments.seeder';
import { ParticipantSeeder } from '../seeders/participants.seeder';
import { TemplatesSeeder } from '../seeders/templates.seeder';

export const seedDatabase = onRequest(async (request, response) => {
  // TODO: check request auth (avoid generating dummy stuff without checking)

  // Create the default template and add it to the database
  const template = TemplatesSeeder.create();
  await app.firestore().collection('templates').add(template);

  // Add one base experiment
  const experiment = await app.firestore().collection('experiments').add(ExperimentSeeder.create());

  // Create 3 participants for this experiment
  const batch = app.firestore().batch();

  // Reuse the template and inject a uuid for the chat stage
  template.stageMap['3. Group discussion'].config.chatId = uuidv4() as unknown as null; // Trick to silence the TS error

  ParticipantSeeder.createMany(
    experiment.id,
    template.stageMap,
    template.allowedStageProgressionMap,
    3,
  ).forEach((participant) => {
    // Get a unique ID for the participant
    const ref = app.firestore().collection('participants').doc();

    // Add the participant to the batch write
    batch.set(ref, participant);
  });

  // Commit the batch write
  await batch.commit();

  response.send('Database seeded!');
});
